---
title: Publishing
description: How to publish StashBridge to browser extension stores.
sidebar:
  order: 2
---

## Chrome Web Store

### One-Time Setup

1. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay the **$5 one-time registration fee**
3. Complete identity verification if prompted

### Build the Zip

```bash
cd packages/extension
bun run zip:chrome
```

This creates a zip at `packages/extension/.output/stashbridgeextension-<version>-chrome.zip`.

### Upload & Submit

1. In the Developer Dashboard, click **New Item** (or select your existing listing)
2. Upload the `.zip` file
3. Fill in the listing details:

| Field | Value |
|-------|-------|
| **Name** | StashBridge |
| **Summary** | Sync localStorage across browsers and devices — zero setup, compressed, optionally encrypted. |
| **Category** | Productivity |
| **Language** | English |

4. Add a **detailed description** (use the content from the README)
5. Upload **screenshots** (at least one, 1280x800 or 640x400 — screenshot the popup UI)
6. The **128x128 icon** is already in the zip manifest

### Required Fields

- **Privacy policy URL**: `https://cybersader.github.io/stashbridge/privacy/`
- **Single purpose description**: "Syncs localStorage data across browsers for sites the user whitelists"
- **Host permissions justification** (for `<all_urls>`): "Content script must be injected on user-whitelisted sites to intercept localStorage read/write operations for syncing"
- **`activeTab` justification**: "Used to auto-fill the current site URL when the user adds a new whitelist rule"
- **`storage` justification**: "Stores whitelist rules, extension settings, and synced localStorage data"
- **`alarms` justification**: "Periodic sync timer that fires every 60 seconds to pull remote changes"

### Review

- New submissions: typically **1-3 business days**
- Updates to existing listings: typically **24-48 hours**
- If rejected, you'll get an email with the reason and can resubmit

### Publishing an Update

1. Bump the version in `packages/extension/package.json`
2. Rebuild: `bun run zip:chrome`
3. In the Developer Dashboard, select your extension
4. Click **Package** → **Upload new package**
5. Upload the new zip
6. Click **Submit for review**

## Firefox Add-ons (AMO)

### Build the Zip

```bash
cd packages/extension
bun run zip:firefox
```

### Upload & Submit

1. Go to [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)
2. Sign in with your Mozilla account (free)
3. Click **Submit a New Add-on**
4. Choose **On this site** (listed on AMO) or **On your own** (self-distributed, signed but not listed)
5. Upload the `.zip`
6. Fill in listing details and submit

### Review

Firefox uses a dual review system (automated + human). Review times vary — can be a few days to a couple weeks.

## Edge Add-ons

### Build

Edge uses the same Chromium build:

```bash
cd packages/extension
bun run zip:chrome
```

### Upload & Submit

1. Go to [Microsoft Partner Center](https://partner.microsoft.com/dashboard/microsoftedge/overview)
2. Create a free developer account
3. Click **Create new extension**
4. Upload the same Chrome `.zip` — Edge accepts Chrome extensions directly
5. Fill in listing details and submit

### Review

Typically up to 7 business days.
