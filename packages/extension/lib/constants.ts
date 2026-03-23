export const ALARM_NAME = 'stashbridge-sync';
export const SYNC_INTERVAL_MINUTES = 1;
export const DEBOUNCE_MS = 500;
export const DEFAULT_SERVER_URL = ''; // User must configure
export const STORAGE_KEYS = {
  BROWSER_ID: 'browser_id',
  API_TOKEN: 'api_token',
  SERVER_URL: 'server_url',
  WHITELIST: 'whitelist',
  LAST_SYNC_AT: 'last_sync_at',
  PENDING_CHANGES: 'pending_changes',
} as const;
