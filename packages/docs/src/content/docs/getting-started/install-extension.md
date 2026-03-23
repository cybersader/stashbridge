---
title: Install Extension
description: Install the StashBridge browser extension.
sidebar:
  order: 2
---

## Chrome / Edge / Brave

### From the Chrome Web Store
1. Visit the [StashBridge listing](#) on the Chrome Web Store
2. Click **Add to Chrome**
3. The extension icon appears in your toolbar

### From Source (Developer Mode)
If you want to build from source:

```bash
git clone https://github.com/cybersader/stashbridge.git
cd stashbridge
bun install
cd packages/extension
bun run build:chrome
```

Then load the unpacked extension:
1. Go to `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `packages/extension/.output/chrome-mv3/` folder

## Firefox

### From Firefox Add-ons
1. Visit the [StashBridge listing](#) on Firefox Add-ons
2. Click **Add to Firefox**

### From Source
```bash
cd packages/extension
bun run build:firefox
```

Then load temporarily:
1. Go to `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select the `manifest.json` in `packages/extension/.output/firefox-mv3/`
