export interface SyncEntry {
  origin: string;
  key: string;
  value: string;
  updated_at: number;
  browser_id: string;
}

export interface WhitelistRule {
  origin: string;
  key: string; // specific key or "*" for all keys
}

export interface ExtensionState {
  browser_id: string;
  api_token: string;
  server_url: string;
  whitelist: WhitelistRule[];
  last_sync_at: number;
  pending_changes: SyncEntry[];
}

// Messages between content script and background
export type ContentMessage =
  | { type: 'LOCAL_CHANGE'; origin: string; key: string; value: string; timestamp: number }
  | { type: 'SYNC_NOW' }
  | { type: 'GET_STATUS' };

export type BackgroundMessage =
  | { type: 'REMOTE_CHANGE'; key: string; value: string }
  | { type: 'STATUS'; connected: boolean; lastSync: number; pending: number };

// Messages between injected script and content script (via CustomEvent)
export interface StorageChangeDetail {
  key: string;
  value: string;
  origin: string;
  timestamp: number;
}

export interface StorageWriteDetail {
  key: string;
  value: string;
}
