import type { SyncEntry } from './types';

interface SyncResponse {
  ok: boolean;
  upserted: number;
}

interface PullResponse {
  entries: SyncEntry[];
  server_time: number;
}

export async function pushEntries(
  serverUrl: string,
  token: string,
  entries: SyncEntry[]
): Promise<SyncResponse> {
  const res = await fetch(`${serverUrl}/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ entries }),
  });
  if (!res.ok) throw new Error(`Push failed: ${res.status}`);
  return res.json();
}

export async function pullEntries(
  serverUrl: string,
  token: string,
  since: number
): Promise<PullResponse> {
  const res = await fetch(`${serverUrl}/pull?since=${since}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Pull failed: ${res.status}`);
  return res.json();
}

export async function checkHealth(serverUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`${serverUrl}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
