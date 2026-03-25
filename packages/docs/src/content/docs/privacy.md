---
title: Privacy Policy
description: StashBridge privacy policy.
sidebar:
  hidden: true
---

**Last updated: March 25, 2026**

## What StashBridge Does

StashBridge is a browser extension that syncs `localStorage` data across your browsers and devices for sites you explicitly whitelist.

## Data Collection

StashBridge does **not** collect, transmit, or store any personal data to the extension developer or any third party.

### What data is accessed

- **localStorage values** on sites you explicitly add to your whitelist. No other site data is accessed.
- **Active tab URL** — used only to auto-fill the origin field when adding whitelist rules. Not stored or transmitted.

### Where data is stored

- **Browser Sync mode (default)**: Your synced localStorage data is stored in your browser's built-in synced storage (`chrome.storage.sync`), managed by your browser vendor (Google, Mozilla, etc.) under their respective privacy policies. Data is compressed and optionally encrypted before storage.
- **Server Relay mode (optional)**: If you configure a self-hosted server relay, data is transmitted to a server URL you specify and control. The extension developer has no access to your server.
- **Local extension storage** (`chrome.storage.local`): Whitelist rules, settings, and pending changes are stored locally on your device.

### What data is NOT collected

- No analytics or telemetry
- No browsing history
- No cookies
- No personal information
- No data is sent to the extension developer

## Permissions

| Permission | Why |
|-----------|-----|
| `storage` | Store whitelist rules, settings, and sync data |
| `alarms` | Periodic sync every 60 seconds |
| `activeTab` | Auto-fill current site URL when adding whitelist rules |
| `host_permissions: <all_urls>` | Inject content script on whitelisted sites to intercept localStorage changes |

## Encryption

When encryption is enabled, all synced data is encrypted with AES-256-GCM using a passphrase you provide. The passphrase is stored only on your local device and is never transmitted.

## Third Parties

StashBridge does not share data with any third parties. If you use Browser Sync mode, your browser vendor's sync service applies (e.g., Google Chrome Sync, Firefox Sync). If you use Server Relay mode, data goes only to the server you configure.

## Open Source

StashBridge is open source. You can audit the code at [github.com/cybersader/stashbridge](https://github.com/cybersader/stashbridge).

## Contact

For questions about this privacy policy, open an issue at [github.com/cybersader/stashbridge/issues](https://github.com/cybersader/stashbridge/issues).
