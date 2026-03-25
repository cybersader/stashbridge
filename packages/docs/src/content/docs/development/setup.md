---
title: Local Development
description: Set up StashBridge for local development.
sidebar:
  order: 1
---

## Prerequisites

- [Bun](https://bun.sh/) (package manager)
- [Node.js](https://nodejs.org/) 18+ (for Wrangler CLI)
- A Chromium browser or Firefox

## Clone & Install

```bash
git clone https://github.com/cybersader/stashbridge.git
cd stashbridge
bun install
```

## Project Structure

```
stashbridge/
├── packages/extension/   # WXT + Svelte 5 + Tailwind CSS
├── packages/worker/      # Cloudflare Worker + D1
└── packages/docs/        # Astro Starlight docs site
```

## Extension Development

```bash
cd packages/extension
bun run dev           # Dev mode with hot reload (Chrome)
bun run dev:firefox   # Dev mode (Firefox)
bun run build:chrome  # Production build (Chrome)
bun run build:firefox # Production build (Firefox)
bun run zip:chrome    # Build + zip for Chrome Web Store
bun run zip:firefox   # Build + zip for Firefox AMO
```

`bun run dev` opens a browser window with the extension loaded and hot-reloading enabled.

## Worker Development

```bash
cd packages/worker
bun run dev          # Local dev server (wrangler dev)
bun run deploy       # Deploy to Cloudflare
bun run migrate:local   # Run D1 migrations locally
bun run migrate:remote  # Run D1 migrations on production
```

## Docs Development

```bash
cd packages/docs
bun run dev       # Local dev server with hot reload
bun run build     # Production build
bun run preview   # Preview production build locally
```

## Loading the Extension (Developer Mode)

### Chrome / Edge / Brave
1. Build: `cd packages/extension && bun run build:chrome`
2. Go to `chrome://extensions`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked**
5. Select `packages/extension/.output/chrome-mv3/`

### After Rebuilding
After pulling changes and rebuilding, go to `chrome://extensions` and click the **reload icon** on the StashBridge card. No need to remove and re-add.

### Firefox
1. Build: `cd packages/extension && bun run build:firefox`
2. Go to `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on**
4. Select `manifest.json` in `packages/extension/.output/firefox-mv3/`

Note: Firefox temporary add-ons are removed when you close the browser.
