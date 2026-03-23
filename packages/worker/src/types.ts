export interface Env {
  DB: D1Database;
  STASHBRIDGE_TOKEN: string;
}

export interface SyncEntry {
  origin: string;
  key: string;
  value: string;
  updated_at: number;
  browser_id: string;
}

export interface SyncRequest {
  entries: SyncEntry[];
}

export interface PullResponse {
  entries: SyncEntry[];
  server_time: number;
}
