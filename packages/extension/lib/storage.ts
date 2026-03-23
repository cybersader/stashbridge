import { STORAGE_KEYS } from './constants';
import type { WhitelistRule, SyncEntry } from './types';

export async function getWhitelist(): Promise<WhitelistRule[]> {
  const result = await browser.storage.local.get(STORAGE_KEYS.WHITELIST);
  return (result[STORAGE_KEYS.WHITELIST] as WhitelistRule[]) ?? [];
}

export async function setWhitelist(rules: WhitelistRule[]): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEYS.WHITELIST]: rules });
}

export async function getServerUrl(): Promise<string> {
  const result = await browser.storage.local.get(STORAGE_KEYS.SERVER_URL);
  return (result[STORAGE_KEYS.SERVER_URL] as string) ?? '';
}

export async function getApiToken(): Promise<string> {
  const result = await browser.storage.local.get(STORAGE_KEYS.API_TOKEN);
  return (result[STORAGE_KEYS.API_TOKEN] as string) ?? '';
}

export async function getLastSyncAt(): Promise<number> {
  const result = await browser.storage.local.get(STORAGE_KEYS.LAST_SYNC_AT);
  return (result[STORAGE_KEYS.LAST_SYNC_AT] as number) ?? 0;
}

export async function setLastSyncAt(time: number): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEYS.LAST_SYNC_AT]: time });
}

export async function getPendingChanges(): Promise<SyncEntry[]> {
  const result = await browser.storage.local.get(STORAGE_KEYS.PENDING_CHANGES);
  return (result[STORAGE_KEYS.PENDING_CHANGES] as SyncEntry[]) ?? [];
}

export async function setPendingChanges(changes: SyncEntry[]): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEYS.PENDING_CHANGES]: changes });
}

export async function addPendingChange(entry: SyncEntry): Promise<void> {
  const pending = await getPendingChanges();
  // Replace existing entry for same origin+key, or add new
  const idx = pending.findIndex(e => e.origin === entry.origin && e.key === entry.key);
  if (idx >= 0) {
    pending[idx] = entry;
  } else {
    pending.push(entry);
  }
  await setPendingChanges(pending);
}

export function isWhitelisted(origin: string, key: string, whitelist: WhitelistRule[]): boolean {
  return whitelist.some(
    rule => rule.origin === origin && (rule.key === '*' || rule.key === key)
  );
}
