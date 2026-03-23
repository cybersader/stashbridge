// Service worker — sync engine
// Receives local changes, batches them, pushes to server, pulls remote changes

import { ALARM_NAME, SYNC_INTERVAL_MINUTES, DEBOUNCE_MS } from '../lib/constants';
import { pushEntries, pullEntries } from '../lib/api';
import {
  getWhitelist,
  getServerUrl,
  getApiToken,
  getLastSyncAt,
  setLastSyncAt,
  getPendingChanges,
  setPendingChanges,
  addPendingChange,
  isWhitelisted,
} from '../lib/storage';
import { getOrCreateBrowserId } from '../utils/browser-id';
import type { SyncEntry } from '../lib/types';

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

  // On install, generate browser ID
  browser.runtime.onInstalled.addListener(async () => {
    await getOrCreateBrowserId();
  });

  // Handle messages from content scripts and popup
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'LOCAL_CHANGE') {
      handleLocalChange(message).then(() => sendResponse({ ok: true }));
      return true; // async response
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

    // Debounce push
    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = setTimeout(() => pushPending(), DEBOUNCE_MS);
  }

  async function pushPending() {
    const [serverUrl, token, pending] = await Promise.all([
      getServerUrl(),
      getApiToken(),
      getPendingChanges(),
    ]);

    if (!serverUrl || !token || pending.length === 0) return;

    try {
      await pushEntries(serverUrl, token, pending);
      await setPendingChanges([]);
    } catch {
      // Keep pending for next attempt
    }
  }

  async function pullRemote() {
    const [serverUrl, token, lastSync, whitelist] = await Promise.all([
      getServerUrl(),
      getApiToken(),
      getLastSyncAt(),
      getWhitelist(),
    ]);

    if (!serverUrl || !token) return;

    try {
      const { entries, server_time } = await pullEntries(serverUrl, token, lastSync);

      // Apply each entry to matching tabs
      for (const entry of entries) {
        if (!isWhitelisted(entry.origin, entry.key, whitelist)) continue;

        const tabs = await browser.tabs.query({ url: `${entry.origin}/*` });
        for (const tab of tabs) {
          if (tab.id) {
            browser.tabs.sendMessage(tab.id, {
              type: 'REMOTE_CHANGE',
              key: entry.key,
              value: entry.value,
            }).catch(() => {
              // Tab may not have content script ready
            });
          }
        }
      }

      await setLastSyncAt(server_time);
    } catch {
      // Will retry on next alarm
    }
  }

  async function getStatus() {
    const [serverUrl, lastSync, pending] = await Promise.all([
      getServerUrl(),
      getLastSyncAt(),
      getPendingChanges(),
    ]);

    return {
      type: 'STATUS' as const,
      connected: !!serverUrl,
      lastSync,
      pending: pending.length,
    };
  }
});
