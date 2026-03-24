import { ALARM_NAME, SYNC_INTERVAL_MINUTES, DEBOUNCE_MS } from '../lib/constants';
import {
  getWhitelist,
  getServerUrl,
  getApiToken,
  getSyncMode,
  getEncryptionEnabled,
  getEncryptionPassphrase,
  getLastSyncAt,
  setLastSyncAt,
  getPendingChanges,
  setPendingChanges,
  addPendingChange,
  isWhitelisted,
} from '../lib/storage';
import {
  browserSyncPush,
  browserSyncPull,
  browserSyncGetUsage,
  serverRelayPush,
  serverRelayPull,
} from '../lib/sync-backend';
import { getOrCreateBrowserId } from '../utils/browser-id';
import type { SyncEntry, SyncMode, StorageUsage } from '../lib/types';

export default defineBackground(() => {
  let pushTimer: ReturnType<typeof setTimeout> | null = null;

  // Set up periodic sync alarm
  browser.alarms.create(ALARM_NAME, { periodInMinutes: SYNC_INTERVAL_MINUTES });

  browser.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === ALARM_NAME) {
      await pushPending();
      await pullRemote();
    }
  });

  // Listen for changes from browser sync (other devices)
  browser.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes['sb_meta']) {
      // Another device pushed — pull and apply
      pullRemote();
    }
  });

  // On install, generate browser ID
  browser.runtime.onInstalled.addListener(async () => {
    await getOrCreateBrowserId();
  });

  // Handle messages from content scripts and popup
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'LOCAL_CHANGE') {
      handleLocalChange(message).then(() => sendResponse({ ok: true }));
      return true;
    }

    if (message.type === 'SYNC_NOW') {
      Promise.all([pushPending(), pullRemote()]).then(() =>
        sendResponse({ ok: true })
      );
      return true;
    }

    if (message.type === 'GET_STATUS') {
      getStatus().then(sendResponse);
      return true;
    }
  });

  async function handleLocalChange(message: {
    origin: string;
    key: string;
    value: string;
    timestamp: number;
  }) {
    const whitelist = await getWhitelist();
    if (!isWhitelisted(message.origin, message.key, whitelist)) return;

    const browserId = await getOrCreateBrowserId();
    const entry: SyncEntry = {
      origin: message.origin,
      key: message.key,
      value: message.value,
      updated_at: message.timestamp,
      browser_id: browserId,
    };

    await addPendingChange(entry);

    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = setTimeout(() => pushPending(), DEBOUNCE_MS);
  }

  async function pushPending() {
    const [syncMode, pending] = await Promise.all([
      getSyncMode(),
      getPendingChanges(),
    ]);

    if (pending.length === 0) return;

    const useBrowser = syncMode === 'browser' || syncMode === 'both';
    const useServer = syncMode === 'server' || syncMode === 'both';

    let browserOk = false;
    let serverOk = false;

    if (useBrowser) {
      try {
        const [encEnabled, passphrase] = await Promise.all([
          getEncryptionEnabled(),
          getEncryptionPassphrase(),
        ]);
        await browserSyncPush(
          pending,
          encEnabled ? passphrase : undefined
        );
        browserOk = true;
      } catch {
        // Will retry next alarm
      }
    }

    if (useServer) {
      try {
        const [serverUrl, token] = await Promise.all([
          getServerUrl(),
          getApiToken(),
        ]);
        if (serverUrl && token) {
          await serverRelayPush(pending, serverUrl, token);
          serverOk = true;
        }
      } catch {
        // Will retry next alarm
      }
    }

    // Clear pending only if at least one backend succeeded
    if (browserOk || serverOk) {
      await setPendingChanges([]);
    }
  }

  async function pullRemote() {
    const [syncMode, lastSync, whitelist] = await Promise.all([
      getSyncMode(),
      getLastSyncAt(),
      getWhitelist(),
    ]);

    const useBrowser = syncMode === 'browser' || syncMode === 'both';
    const useServer = syncMode === 'server' || syncMode === 'both';

    let allEntries: SyncEntry[] = [];
    let newSyncTime = lastSync;

    if (useBrowser) {
      try {
        const [encEnabled, passphrase] = await Promise.all([
          getEncryptionEnabled(),
          getEncryptionPassphrase(),
        ]);
        const entries = await browserSyncPull(
          lastSync,
          encEnabled ? passphrase : undefined
        );
        allEntries.push(...entries);
        const maxTs = entries.reduce((m, e) => Math.max(m, e.updated_at), 0);
        if (maxTs > newSyncTime) newSyncTime = maxTs;
      } catch {
        // Will retry
      }
    }

    if (useServer) {
      try {
        const [serverUrl, token] = await Promise.all([
          getServerUrl(),
          getApiToken(),
        ]);
        if (serverUrl && token) {
          const { entries, serverTime } = await serverRelayPull(lastSync, serverUrl, token);
          allEntries.push(...entries);
          if (serverTime > newSyncTime) newSyncTime = serverTime;
        }
      } catch {
        // Will retry
      }
    }

    // Deduplicate: keep newest per origin+key
    const deduped = new Map<string, SyncEntry>();
    for (const entry of allEntries) {
      const mapKey = `${entry.origin}::${entry.key}`;
      const existing = deduped.get(mapKey);
      if (!existing || entry.updated_at > existing.updated_at) {
        deduped.set(mapKey, entry);
      }
    }

    // Apply to matching tabs
    for (const entry of deduped.values()) {
      if (!isWhitelisted(entry.origin, entry.key, whitelist)) continue;

      const tabs = await browser.tabs.query({ url: `${entry.origin}/*` });
      for (const tab of tabs) {
        if (tab.id) {
          browser.tabs.sendMessage(tab.id, {
            type: 'REMOTE_CHANGE',
            key: entry.key,
            value: entry.value,
          }).catch(() => {});
        }
      }
    }

    if (newSyncTime > lastSync) {
      await setLastSyncAt(newSyncTime);
    }
  }

  async function getStatus() {
    const [syncMode, serverUrl, lastSync, pending] = await Promise.all([
      getSyncMode(),
      getServerUrl(),
      getLastSyncAt(),
      getPendingChanges(),
    ]);

    let usage: StorageUsage = { used: 0, total: 102_400 };
    if (syncMode === 'browser' || syncMode === 'both') {
      try {
        usage = await browserSyncGetUsage();
      } catch {}
    }

    const connected =
      syncMode === 'browser' ||
      syncMode === 'both' ||
      (syncMode === 'server' && !!serverUrl);

    return {
      type: 'STATUS' as const,
      connected,
      lastSync,
      pending: pending.length,
      syncMode,
      usage,
    };
  }
});
