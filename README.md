<p align="center">
  <img src="logo.png" alt="StashBridge" width="128" height="128">
</p>

<h1 align="center">StashBridge</h1>

<p align="center"><strong>Sync browser localStorage across browsers and devices — self-hosted, simple, last-write-wins.</strong></p>

<p align="center"><em>Your browser stash, everywhere.</em></p>

---

## The Problem

Web apps like [Obsidian Stats](https://www.obsidianstats.com/), Hacker News, and countless PWAs store your preferences, favorites, and state in `localStorage` or `IndexedDB`. That data is siloed per browser instance. Switch from Chrome to Firefox, open a new device, or clear your cache — and it's all gone.

There's no native browser API to sync site-specific storage across browsers. `chrome.storage.sync` only works within Chrome extensions for their own data. The web platform simply never solved this.

## The Solution

**StashBridge** is a lightweight browser extension + self-hosted relay server that watches `localStorage` on sites you specify and syncs it across all your browsers via a simple key-value API.

- **Extension** — content script hooks `localStorage` reads/writes on whitelisted origins, pushes changes to the relay server, and pulls remote state on page load.
- **Server** — a minimal key-value store with timestamps. No accounts, no complexity. Deploy it anywhere: a Docker container, a TrueNAS jail, a VPS, a Raspberry Pi.
- **Conflict resolution** — last-write-wins by timestamp per key. Simple, predictable, good enough for 99% of use cases (favorites, preferences, UI state). No CRDTs needed.

## How It Works

```
┌──────────────┐         ┌──────────────────┐         ┌──────────────┐
│  Browser A   │         │  StashBridge      │         │  Browser B   │
│  (Chrome)    │         │  Relay Server     │         │  (Firefox)   │
│              │  push   │                   │  pull   │              │
│ localStorage ├────────►│  key-value store  ├────────►│ localStorage │
│ on site X    │◄────────┤  + timestamps     │◄────────┤ on site X    │
│              │  pull   │                   │  push   │              │
└──────────────┘         └──────────────────┘         └──────────────┘
```

1. You visit a whitelisted site (e.g., `obsidianstats.com`)
2. The extension reads the site's `localStorage` and compares with the server
3. Newer remote keys overwrite older local keys (and vice versa)
4. Changes are pushed to the server with a timestamp
5. Other browsers pull on next page load

## Features

- [ ] **Configurable origin whitelist** — only sync the sites you choose
- [ ] **Per-key sync** — granular key filtering (sync `favorites` but not `session_token`)
- [ ] **Self-hosted server** — Docker image, no external dependencies beyond a SQLite file
- [ ] **Cross-browser** — Chrome, Firefox, Edge (via Manifest V3 WebExtension API)
- [ ] **Encrypted transit** — server is designed to sit behind your reverse proxy (Nginx Proxy Manager, Caddy, etc.)
- [ ] **Optional E2E encryption** — encrypt values client-side before they leave the browser
- [ ] **Manual import/export** — JSON backup of all synced data
- [ ] **Conflict log** — see when a key was overwritten and by which browser instance

## Planned Architecture

### Extension (Browser)

- **Manifest V3** WebExtension (cross-browser compatible)
- Content script injected on whitelisted origins
- Hooks `Storage.prototype.setItem` / `getItem` via a proxy wrapper
- Polls or uses `storage` event listener for cross-tab awareness
- Communicates with background service worker for server sync
- Popup UI for managing whitelist, viewing sync status, triggering manual sync

### Server (Self-Hosted)

- Lightweight HTTP API (Node.js/Hono or Go)
- SQLite backend (single file, zero config)
- Endpoints:
  - `GET /api/v1/sync/:origin` — fetch all keys for an origin
  - `PUT /api/v1/sync/:origin` — push key-value pairs with timestamps
  - `GET /api/v1/origins` — list tracked origins
  - `DELETE /api/v1/sync/:origin/:key` — remove a key
- Optional: Bearer token auth, rate limiting
- Docker image for one-line deployment

### Data Model

```json
{
  "origin": "www.obsidianstats.com",
  "key": "favorites",
  "value": "[\"excalidraw\",\"dataview\",\"templater\"]",
  "updated_at": "2026-03-22T14:30:00.000Z",
  "browser_id": "chrome-desktop-home"
}
```

## Getting Started

> **Status: Pre-release / Planning Phase**
>
> This project is in the design stage. The README serves as the specification.
> Contributions, feedback, and architecture discussion are welcome via [Issues](../../issues).

### Quickstart (Coming Soon)

```bash
# Server
docker run -d \
  -p 3090:3090 \
  -v stashbridge-data:/data \
  ghcr.io/cybersader/stashbridge:latest

# Extension
# Install from Chrome Web Store / Firefox Add-ons (links TBD)
# Set server URL to https://stashbridge.yourdomain.com
# Add origins to whitelist
```

## Use Cases

- **Obsidian Stats** — sync your favorited plugins across browsers
- **Hacker News** — sync upvoted/hidden stories
- **PWAs without accounts** — any web app that stores state in localStorage but doesn't offer cloud sync
- **Dev tools** — sync local preferences for tools like Swagger UI, Redoc, GraphQL Playground
- **Self-hosted dashboards** — sync Heimdall, Homer, or Homarr layout preferences

## FAQ

**Why not CRDTs?**
For the target use case (user preferences, favorites, simple UI state), last-write-wins per key is sufficient. The chance of genuinely conflicting concurrent edits to the same key across two browsers is near zero. CRDTs add complexity that isn't warranted here. If you need them, check out [Automerge](https://automerge.org/) or [Yjs](https://yjs.dev/).

**Why not PouchDB/CouchDB?**
PouchDB is great if you control the app code, but StashBridge is for syncing *third-party* sites where you can't inject a library into the app itself. The extension approach works on any site.

**What about IndexedDB?**
IndexedDB support is planned as a stretch goal. It's significantly more complex than localStorage (multiple object stores, structured cloning, cursors) but the most common patterns (single-store key-value) are tractable.

**Is this secure?**
The server is designed to run on your own infrastructure behind your own reverse proxy with TLS. Optional E2E encryption means the server never sees plaintext values. The extension only activates on origins you explicitly whitelist.

## Related Projects & Prior Art

| Project | What It Does | Limitation |
|---------|-------------|------------|
| [remote-storage (Frigade)](https://github.com/FrigadeHQ/remote-storage) | localStorage-like API with cloud sync | Requires app integration; not for third-party sites |
| [remoteStorage.io](https://remotestorage.io/) | Open protocol for per-user web storage | App must implement the protocol |
| [xBrowserSync](https://www.xbrowsersync.org/) | Cross-browser bookmark sync | Bookmarks only, not arbitrary storage |
| [Floccus](https://floccus.org/) | Bookmark sync via Nextcloud/WebDAV | Bookmarks only |
| `chrome.storage.sync` | Built-in extension storage sync | Chrome-only, extension's own storage only, 100KB limit |

## Contributing

This project is open to contributions. If you're interested in:

- **Extension development** (Manifest V3, content scripts, service workers)
- **Server implementation** (lightweight HTTP APIs, SQLite)
- **Security review** (E2E encryption design, threat modeling)
- **Testing across browsers** (Chrome, Firefox, Edge, Brave, Arc)

Please open an issue to discuss before submitting a PR.

## License

MIT

---

*Built for the self-hosted community. Your data, your server, your rules.*
