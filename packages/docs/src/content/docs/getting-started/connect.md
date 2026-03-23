---
title: Connect & Sync
description: Connect the extension to your server and start syncing.
sidebar:
  order: 4
---

With the extension installed and server deployed, connect them:

## 1. Open Extension Settings

Click the StashBridge icon in your browser toolbar, then click the gear icon (top right).

## 2. Enter Server URL

Paste your worker URL:
```
https://stashbridge-worker.<your-subdomain>.workers.dev
```

## 3. Enter API Token

Enter the same token you set as `STASHBRIDGE_TOKEN` on your worker. Or click **Gen** to generate one (then update the worker secret to match).

## 4. Save

Click **Save**. The status indicator should turn green.

## 5. Add Your First Whitelist Rule

1. Navigate to a site you want to sync (e.g., `https://www.obsidianstats.com`)
2. Click the StashBridge icon
3. The **Origin** field auto-fills with the current site
4. Enter a specific localStorage key, or check **sync all keys**
5. Click **Add Rule**

## 6. Repeat on Other Browsers

Install the extension on your other browsers, enter the same server URL and token, and add the same whitelist rules. Changes will sync automatically every 60 seconds, or click **Sync Now** to sync immediately.

## How Sync Works

- **Local changes**: When a whitelisted site writes to `localStorage`, the extension captures it and pushes to your server within 500ms
- **Remote changes**: Every 60 seconds, the extension pulls new changes from the server and applies them to open tabs
- **Conflicts**: Last-write-wins by timestamp. If two browsers write the same key at nearly the same time, the later write wins
- **Offline**: Changes queue locally and push when connectivity returns
