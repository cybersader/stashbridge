---
title: Deploy Server
description: Deploy the StashBridge relay server to Cloudflare Workers for free.
sidebar:
  order: 3
---

The relay server runs on Cloudflare Workers with a D1 (SQLite) database. The free tier is more than enough for personal use.

## Prerequisites

- A free [Cloudflare account](https://dash.cloudflare.com/sign-up)
- [Node.js](https://nodejs.org/) 18+ (for Wrangler CLI)

## Option A: Deploy via GitHub Actions (Recommended)

This is the easiest method. Fork the repo and let GitHub Actions deploy automatically.

### 1. Fork the Repository

Fork [cybersader/stashbridge](https://github.com/cybersader/stashbridge) on GitHub.

### 2. Create a Cloudflare API Token

1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Use the **Edit Cloudflare Workers** template
4. Under permissions, ensure:
   - Account > Cloudflare Workers > Edit
   - Account > D1 > Edit
5. Create the token and copy it

### 3. Add GitHub Secrets

In your forked repo, go to **Settings > Secrets and variables > Actions** and add:

| Secret | Value |
|--------|-------|
| `CLOUDFLARE_API_TOKEN` | The API token from step 2 |
| `CLOUDFLARE_ACCOUNT_ID` | Found in your Cloudflare dashboard URL or Workers overview |

### 4. Create the D1 Database

You'll need to create the database once. Run this locally:

```bash
# Install wrangler globally
npm install -g wrangler

# Log in to Cloudflare
wrangler login

# Create the D1 database
wrangler d1 create stashbridge
```

Copy the `database_id` from the output and update `packages/worker/wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "stashbridge"
database_id = "your-database-id-here"
```

Commit and push this change. GitHub Actions will automatically deploy the worker and run migrations.

### 5. Set the Auth Token

Generate a strong token (or use the one from your extension's settings):

```bash
wrangler secret put STASHBRIDGE_TOKEN
```

Enter your token when prompted. This is the bearer token the extension uses to authenticate.

### 6. Verify

Your worker is now live at `https://stashbridge-worker.<your-subdomain>.workers.dev`

Test it:
```bash
curl https://stashbridge-worker.<your-subdomain>.workers.dev/health
# Should return: {"status":"ok","version":"1.0.0"}
```

## Option B: Deploy Manually

```bash
git clone https://github.com/cybersader/stashbridge.git
cd stashbridge/packages/worker

# Install dependencies
bun install

# Login to Cloudflare
npx wrangler login

# Create D1 database
npx wrangler d1 create stashbridge
# Update wrangler.toml with the database_id

# Run migrations
npx wrangler d1 migrations apply stashbridge --remote

# Set auth token
npx wrangler secret put STASHBRIDGE_TOKEN

# Deploy
npx wrangler deploy
```

## What Gets Deployed

- **Worker**: A tiny TypeScript function (~2KB) handling 3 endpoints
- **D1 Database**: A single SQLite table storing your synced key-value pairs
- **Secret**: Your bearer token (never exposed, stored encrypted by Cloudflare)

## Free Tier Limits

| Resource | Free Limit | Typical Usage |
|----------|-----------|---------------|
| Worker requests | 100,000/day | ~100-1,000/day |
| D1 row reads | 5,000,000/day | ~1,000-5,000/day |
| D1 row writes | 100,000/day | ~10-100/day |
| D1 storage | 500 MB | < 1 MB |

You'll likely use less than 1% of the free tier.
