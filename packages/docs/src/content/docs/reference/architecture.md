---
title: Architecture
description: How StashBridge works under the hood.
---

## Components

```
┌─────────────────────────────────────────────┐
│                Browser                       │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
│  │ injected │◄►│ content  │◄►│background │ │
│  │ (main    │  │ (isolated│  │ (service  │ │
│  │  world)  │  │  world)  │  │  worker)  │ │
│  └──────────┘  └──────────┘  └─────┬─────┘ │
└─────────────────────────────────────┼───────┘
                                      │ HTTPS
                              ┌───────▼───────┐
                              │  Cloudflare   │
                              │   Worker      │
                              │  + D1 (SQLite)│
                              └───────────────┘
```

## The Two-Script Bridge

Browser extensions run content scripts in an **isolated world** — they can't access the page's `localStorage`. StashBridge solves this with two scripts:

1. **`injected.ts`** — Runs in the page's main world. Monkey-patches `Storage.prototype.setItem` and `removeItem` to intercept changes. Communicates via `CustomEvent` on `document`.

2. **`content.ts`** — Runs in the isolated world. Listens for `CustomEvent`s from the injected script and forwards them to the background via `chrome.runtime.sendMessage()`. Also relays remote changes back.

This is necessary because:
- The injected script can access `localStorage` but not `chrome.runtime`
- The content script can access `chrome.runtime` but not the page's `localStorage`
- `CustomEvent` on `document` bridges the gap

## Sync Engine

The **background service worker** manages all sync logic:

- **Push**: Batches local changes, debounces (500ms), pushes via `POST /sync`
- **Pull**: Every 60 seconds via `chrome.alarms`, fetches changes via `GET /pull?since=`
- **Persistence**: All state (pending changes, last sync time) is in `chrome.storage.local`, surviving service worker termination
- **Whitelist filtering**: Only processes changes for explicitly whitelisted `{origin, key}` pairs

## Conflict Resolution

**Last-write-wins** by `updated_at` timestamp per key:

```sql
ON CONFLICT(origin, key) DO UPDATE SET
  value = excluded.value,
  updated_at = excluded.updated_at
WHERE excluded.updated_at > sync_entries.updated_at
```

If Browser A writes at `t=100` and Browser B writes at `t=101`, Browser B's value wins regardless of push order.

## Re-entry Guard

When applying remote changes, the injected script must not re-capture them as local changes:

```ts
let suppressCapture = false;

// When applying remote change:
suppressCapture = true;
originalSetItem.call(localStorage, key, value);
suppressCapture = false;

// When capturing local change:
if (!suppressCapture) {
  // dispatch event...
}
```
