---
title: Connect & Sync
description: Set up syncing with browser sync or a server relay.
sidebar:
  order: 4
---

## Browser Sync (Default)

Browser Sync works immediately with no configuration. Just:

1. **Make sure you're signed into your browser's sync** (Chrome Sync, Firefox Sync, Brave Sync, etc.)
2. **Add whitelist rules** for the sites you want to sync
3. That's it — data syncs automatically across all your devices using the same browser

### Add Your First Whitelist Rule

1. Navigate to a site you want to sync (e.g., `https://www.obsidianstats.com`)
2. Click the StashBridge icon in your toolbar
3. The **Origin** field auto-fills with the current site
4. Enter a specific localStorage key, or check **sync all keys**
5. Click **Add Rule**

### Storage Usage

Browser Sync has a 100KB limit. StashBridge compresses data (typically 50-70% reduction), so you effectively get ~200-300KB of raw data. The popup shows a usage bar so you can monitor this.

### Optional Encryption

1. Open Settings (gear icon)
2. Check **Encrypt synced data**
3. Enter a passphrase
4. **Important**: Enter the same passphrase on every browser. It's stored locally only — not synced.

## Server Relay (Optional)

To sync across *different* browsers (Chrome to Firefox), switch to Server Relay or Both mode:

1. [Deploy the server](/stashbridge/getting-started/deploy-server/) first
2. Open StashBridge Settings (gear icon)
3. Change **Sync Mode** to "Server Relay" or "Both"
4. Enter your worker URL and API token
5. Click **Save**

### Sync Modes

| Mode | What it does |
|------|-------------|
| **Browser Sync** (default) | Uses Chrome/Firefox/Brave built-in sync. No server needed. Same browser only. |
| **Server Relay** | Uses your Cloudflare Worker. Works across different browsers. |
| **Both** | Uses both. Browser sync for same-browser devices, server for cross-browser. |

## How Sync Works

- **Local changes**: When a whitelisted site writes to `localStorage`, the extension captures it and pushes within 500ms
- **Remote changes**: Every 60 seconds, the extension pulls new changes and applies them to open tabs
- **Conflicts**: Last-write-wins by timestamp
- **Offline**: Changes queue locally and push when connectivity returns
- **Compression**: All synced data is compressed with LZ-String before storage
