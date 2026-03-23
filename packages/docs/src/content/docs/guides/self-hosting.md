---
title: Self-Hosting
description: Details on running your own StashBridge relay server.
---

StashBridge's server is a Cloudflare Worker — it runs on Cloudflare's edge network, not a traditional server. This means:

- No VPS, no Docker, no port forwarding
- Deploys in seconds via `wrangler deploy` or GitHub Actions
- Free tier covers personal use with massive headroom
- Data stays in Cloudflare's D1 (SQLite) — you own it

## Updating

If you deployed via GitHub Actions, just push to `main` — changes to `packages/worker/` trigger automatic redeployment.

If you deployed manually:
```bash
cd packages/worker
npx wrangler deploy
```

## Data Management

### View your data
```bash
npx wrangler d1 execute stashbridge --remote --command "SELECT * FROM sync_entries"
```

### Delete all data for a site
```bash
npx wrangler d1 execute stashbridge --remote \
  --command "DELETE FROM sync_entries WHERE origin = 'https://example.com'"
```

### Export all data
```bash
npx wrangler d1 export stashbridge --remote --output backup.sql
```

## Security

- **Auth**: Every request requires a bearer token that only you know
- **Transport**: All traffic is HTTPS (Cloudflare enforces it)
- **Storage**: Data is stored in Cloudflare's D1 — encrypted at rest
- **No user accounts**: Single-tenant by design. One token, one database, one user.

If someone guesses your token, they could read/write your synced localStorage. Use a strong token (UUID or longer).

## Costs

The free tier resets daily at 00:00 UTC:
- 100,000 Worker requests/day
- 5,000,000 D1 row reads/day
- 100,000 D1 row writes/day
- 500 MB D1 storage

For a single user syncing a handful of sites, you'll use a tiny fraction of these limits.
