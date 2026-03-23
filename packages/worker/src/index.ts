import type { Env, SyncRequest, SyncEntry } from './types';
import { validateAuth } from './auth';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);

    // Health check — no auth
    if (url.pathname === '/health') {
      return json({ status: 'ok', version: '1.0.0' });
    }

    // All other routes require auth
    if (!validateAuth(request, env)) {
      return json({ error: 'Unauthorized' }, 401);
    }

    if (url.pathname === '/sync' && request.method === 'POST') {
      return handleSync(request, env);
    }

    if (url.pathname === '/pull' && request.method === 'GET') {
      return handlePull(request, env);
    }

    return json({ error: 'Not Found' }, 404);
  },
};

async function handleSync(request: Request, env: Env): Promise<Response> {
  const body = (await request.json()) as SyncRequest;

  if (!body.entries?.length) {
    return json({ error: 'No entries provided' }, 400);
  }

  // Limit batch size to prevent abuse
  if (body.entries.length > 100) {
    return json({ error: 'Max 100 entries per request' }, 400);
  }

  let upserted = 0;

  for (const entry of body.entries) {
    if (!entry.origin || !entry.key || entry.value === undefined || !entry.updated_at || !entry.browser_id) {
      continue;
    }

    // Soft-limit value size to 100KB
    if (entry.value.length > 102400) {
      continue;
    }

    const result = await env.DB.prepare(
      `INSERT INTO sync_entries (origin, key, value, updated_at, browser_id)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(origin, key) DO UPDATE SET
         value = excluded.value,
         updated_at = excluded.updated_at,
         browser_id = excluded.browser_id
       WHERE excluded.updated_at > sync_entries.updated_at`
    )
      .bind(entry.origin, entry.key, entry.value, entry.updated_at, entry.browser_id)
      .run();

    if (result.meta.changes > 0) upserted++;
  }

  return json({ ok: true, upserted });
}

async function handlePull(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const since = parseInt(url.searchParams.get('since') ?? '0', 10);

  const { results } = await env.DB.prepare(
    `SELECT origin, key, value, updated_at, browser_id
     FROM sync_entries
     WHERE updated_at > ?
     ORDER BY updated_at ASC
     LIMIT 500`
  )
    .bind(since)
    .all<SyncEntry>();

  return json({
    entries: results ?? [],
    server_time: Date.now(),
  });
}
