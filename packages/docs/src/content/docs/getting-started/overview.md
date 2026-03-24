---
title: Overview
description: What StashBridge does and why you might want it.
sidebar:
  order: 1
---

**StashBridge** syncs `localStorage` across your browsers and devices using a lightweight browser extension.

## The Problem

Many web apps store preferences, favorites, and UI state in `localStorage`. Switch browsers (or clear data) and it's all gone. There's no built-in way to sync this across browsers.

## How It Works

### Browser Sync (Default — Zero Setup)

1. **Install the extension** and sign into your browser's sync (Chrome Sync, Firefox Sync, Brave Sync)
2. **Whitelist sites** you want to sync
3. Changes are **compressed and stored** in the browser's built-in synced storage
4. Other instances of the same browser pull changes automatically

No server needed. Works immediately.

### Server Relay (Optional — Cross-Browser)

For syncing between *different* browsers (Chrome to Firefox), you can optionally connect a Cloudflare Worker relay:

1. Deploy a free Cloudflare Worker (5 minutes)
2. Enter the server URL and token in the extension settings
3. Changes sync across any browser via the relay

## Features

- **Browser Sync** — zero-config default using your browser's built-in sync
- **Compression** — LZ-String compression to fit more data in the 100KB sync limit
- **Optional encryption** — AES-256-GCM with a passphrase you set
- **Storage usage indicator** — see how much of the 100KB limit you're using
- **Server relay** — optional Cloudflare Worker for cross-browser sync
- **Whitelist control** — only sync sites and keys you explicitly choose

## Use Cases

- Sync favorited plugins on [Obsidian Stats](https://www.obsidianstats.com)
- Keep Hacker News upvoted/hidden stories across browsers
- Sync preferences for dev tools (Swagger UI, GraphQL Playground)
- Persist layout preferences for self-hosted dashboards

## What You Need

- A Chromium browser (Chrome, Edge, Brave) or Firefox
- That's it for browser sync mode
- A free [Cloudflare account](https://dash.cloudflare.com/sign-up) only if you want cross-browser sync

## Cost

| Component | Cost |
|-----------|------|
| Extension | $0 |
| Browser Sync | $0 (built into your browser) |
| Server Relay (optional) | $0/month (Cloudflare free tier) |
| **Total** | **$0/month** |
