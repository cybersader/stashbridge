import type { SyncEntry } from './types';
import { compressJSON, decompressJSON, byteLength } from './compress';
import { encrypt, decrypt } from './crypto';
import { pushEntries, pullEntries } from './api';

const SYNC_PREFIX = 'sb_';
const SYNC_META_KEY = 'sb_meta';
const MAX_CHUNK_BYTES = 7000; // Under 8,192 QUOTA_BYTES_PER_ITEM
const SYNC_QUOTA_BYTES = 102_400;

interface SyncMeta {
  version: number;
  chunks: number;
  updated_at: number;
}

// --- Browser Sync Backend ---

export async function browserSyncPush(
  entries: SyncEntry[],
  passphrase?: string
): Promise<void> {
  // Read existing entries, merge with new
  const existing = await browserSyncPullAll(passphrase);
  const merged = mergeEntries(existing, entries);

  // Compress and shard
  const json = JSON.stringify(merged);
  let payload = compressJSON(merged);

  if (passphrase) {
    payload = await encrypt(payload, passphrase);
  }

  // Shard into chunks that fit within per-item limit
  const chunks = shardString(payload, MAX_CHUNK_BYTES);

  // Clear old chunks first
  const oldMeta = await getSyncMeta();
  const keysToRemove: string[] = [];
  if (oldMeta) {
    for (let i = 0; i < oldMeta.chunks; i++) {
      keysToRemove.push(`${SYNC_PREFIX}${i}`);
    }
  }
  if (keysToRemove.length > 0) {
    await browser.storage.sync.remove(keysToRemove);
  }

  // Write new chunks
  const writeData: Record<string, string | SyncMeta> = {};
  for (let i = 0; i < chunks.length; i++) {
    writeData[`${SYNC_PREFIX}${i}`] = chunks[i];
  }
  writeData[SYNC_META_KEY] = {
    version: 1,
    chunks: chunks.length,
    updated_at: Date.now(),
  };

  await browser.storage.sync.set(writeData);
}

export async function browserSyncPull(
  since: number,
  passphrase?: string
): Promise<SyncEntry[]> {
  const all = await browserSyncPullAll(passphrase);
  return all.filter(e => e.updated_at > since);
}

async function browserSyncPullAll(passphrase?: string): Promise<SyncEntry[]> {
  const meta = await getSyncMeta();
  if (!meta || meta.chunks === 0) return [];

  const keys = Array.from({ length: meta.chunks }, (_, i) => `${SYNC_PREFIX}${i}`);
  const data = await browser.storage.sync.get(keys);

  let payload = keys.map(k => (data[k] as string) ?? '').join('');
  if (!payload) return [];

  try {
    if (passphrase) {
      payload = await decrypt(payload, passphrase);
    }
    return decompressJSON<SyncEntry[]>(payload);
  } catch {
    return [];
  }
}

async function getSyncMeta(): Promise<SyncMeta | null> {
  const data = await browser.storage.sync.get(SYNC_META_KEY);
  return (data[SYNC_META_KEY] as SyncMeta) ?? null;
}

export async function browserSyncGetUsage(): Promise<{ used: number; total: number }> {
  const bytesInUse = await browser.storage.sync.getBytesInUse(null);
  return { used: bytesInUse, total: SYNC_QUOTA_BYTES };
}

// --- Server Relay Backend ---

export async function serverRelayPush(
  entries: SyncEntry[],
  serverUrl: string,
  token: string
): Promise<void> {
  await pushEntries(serverUrl, token, entries);
}

export async function serverRelayPull(
  since: number,
  serverUrl: string,
  token: string
): Promise<{ entries: SyncEntry[]; serverTime: number }> {
  const result = await pullEntries(serverUrl, token, since);
  return { entries: result.entries, serverTime: result.server_time };
}

// --- Helpers ---

function mergeEntries(existing: SyncEntry[], incoming: SyncEntry[]): SyncEntry[] {
  const map = new Map<string, SyncEntry>();

  for (const entry of existing) {
    map.set(`${entry.origin}::${entry.key}`, entry);
  }
  for (const entry of incoming) {
    const key = `${entry.origin}::${entry.key}`;
    const current = map.get(key);
    if (!current || entry.updated_at > current.updated_at) {
      map.set(key, entry);
    }
  }

  return Array.from(map.values());
}

function shardString(str: string, maxBytes: number): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < str.length) {
    // Estimate chars that fit in maxBytes (UTF-16 = ~2 bytes/char, but chrome.storage measures differently)
    // Be conservative: use half the byte limit as char count
    let end = start + Math.floor(maxBytes / 2);
    if (end > str.length) end = str.length;

    let chunk = str.slice(start, end);

    // Shrink if over byte limit
    while (byteLength(JSON.stringify(chunk)) > maxBytes && end > start + 1) {
      end -= 100;
      chunk = str.slice(start, end);
    }

    chunks.push(chunk);
    start = end;
  }

  return chunks;
}
