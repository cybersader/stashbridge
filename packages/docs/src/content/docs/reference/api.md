---
title: API Reference
description: StashBridge Worker API endpoints.
---

Base URL: `https://stashbridge-worker.<your-subdomain>.workers.dev`

All endpoints except `/health` require `Authorization: Bearer <token>` header.

## GET /health

Health check. No authentication required.

**Response:**
```json
{ "status": "ok", "version": "1.0.0" }
```

## POST /sync

Push localStorage changes to the server.

**Request body:**
```json
{
  "entries": [
    {
      "origin": "https://example.com",
      "key": "theme",
      "value": "dark",
      "updated_at": 1711234567890,
      "browser_id": "550e8400-e29b-41d4-a716-446655440000"
    }
  ]
}
```

**Limits:**
- Max 100 entries per request
- Max 100KB per value

**Response:**
```json
{ "ok": true, "upserted": 1 }
```

**Conflict resolution:** If the server already has a newer `updated_at` for the same `origin`+`key`, the push is silently ignored for that entry.

## GET /pull?since={timestamp}

Pull changes since a given timestamp.

**Query parameters:**
- `since` (integer) — Unix timestamp in milliseconds. Returns entries with `updated_at > since`. Use `0` to pull everything.

**Response:**
```json
{
  "entries": [
    {
      "origin": "https://example.com",
      "key": "theme",
      "value": "dark",
      "updated_at": 1711234567890,
      "browser_id": "550e8400-e29b-41d4-a716-446655440000"
    }
  ],
  "server_time": 1711234600000
}
```

Use `server_time` as the `since` value for your next pull.

**Limit:** Max 500 entries per response, ordered by `updated_at ASC`.
