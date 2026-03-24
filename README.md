<p align="center">
  <img src="logo.png" alt="StashBridge" width="128" height="128">
</p>

<h1 align="center">StashBridge</h1>

<p align="center"><strong>Sync browser localStorage across browsers and devices — self-hosted, simple, last-write-wins.</strong></p>

<p align="center"><em>Your browser stash, everywhere.</em></p>

<p align="center">
  <a href="https://cybersader.github.io/stashbridge/">Docs</a> ·
  <a href="https://github.com/cybersader/stashbridge/issues">Issues</a> ·
  <a href="#roadmap">Roadmap</a>
</p>

---

## The Problem

Web apps store your preferences, favorites, and UI state in `localStorage`. Switch browsers, clear your cache, or open a new device — and it's all gone. There's no native way to sync this across browsers.

## The Solution

**StashBridge** is a browser extension + free relay server that watches `localStorage` on sites you whitelist and syncs it across all your browsers.

- **Extension** — intercepts `localStorage` writes on whitelisted sites, pushes changes to your relay server
- **Server** — Cloudflare Worker + D1 (SQLite). Free tier, zero monthly cost
- **Conflict resolution** — last-write-wins by timestamp per key. Simple and predictable.

## Platform Compatibility

### Supported

| Platform | Browser | Status |
|----------|---------|--------|
| **Desktop** | Chrome / Chromium | Full support (Manifest V3) |
| **Desktop** | Firefox | Full support (Manifest V3, Firefox 128+) |
| **Desktop** | Edge | Full support (Manifest V3) |
| **Desktop** | Brave, Arc, Vivaldi | Should work (untested, Chromium-based) |

### Not Supported

| Platform | Why |
|----------|-----|
| **Mobile Chrome (Android)** | Chrome Android does not support extensions |
| **Mobile Safari (iOS)** | iOS Web Extensions have limited content script support |
| **Mobile PWAs** | PWAs run outside the browser — extensions can't inject into them |
| **Firefox Android** | Supports some extensions; may work but untested |

> StashBridge is a **desktop browser extension**. Mobile and PWA support would require a different approach (see [Roadmap](#roadmap)).

## How It Works

```
┌──────────────┐         ┌──────────────────┐         ┌──────────────┐
│  Browser A   │         │  Cloudflare       │         │  Browser B   │
│  (Chrome)    │  push   │  Worker + D1      │  pull   │  (Firefox)   │
│              ├────────►│                   ├────────►│              │
│ localStorage │◄────────┤  key-value store  │◄────────┤ localStorage │
│              │  pull   │  + timestamps     │  push   │              │
└──────────────┘         └──────────────────┘         └──────────────┘
```

1. You visit a whitelisted site
2. The extension intercepts `localStorage.setItem()` calls
3. Changes push to your Cloudflare Worker within 500ms
4. Every 60 seconds, other browsers pull new changes and apply them
5. Last-write-wins by timestamp — newer values always win

## Features

- **Configurable origin whitelist** — only sync the sites you choose
- **Per-key sync** — granular key filtering or wildcard (sync all keys)
- **Self-hosted server** — Cloudflare Workers free tier ($0/month)
- **Cross-browser** — Chrome, Firefox, Edge via Manifest V3
- **Bearer token auth** — simple, secure, single-tenant
- **Dark glassmorphism UI** — clean popup with sync status and whitelist manager
- **Offline resilient** — changes queue locally and push when connectivity returns
- **GitHub Actions CI/CD** — auto-deploy worker and docs on push

## Quick Start

See the full [Getting Started guide](https://cybersader.github.io/stashbridge/getting-started/overview/) or:

1. **Deploy the server** — [instructions](https://cybersader.github.io/stashbridge/getting-started/deploy-server/)
2. **Install the extension** — [instructions](https://cybersader.github.io/stashbridge/getting-started/install-extension/)
3. **Connect & sync** — [instructions](https://cybersader.github.io/stashbridge/getting-started/connect/)

## Use Cases

- **[Obsidian Stats](https://www.obsidianstats.com/)** — sync favorited plugins across browsers
- **Hacker News** — sync upvoted/hidden stories
- **Dev tools** — sync preferences for Swagger UI, Redoc, GraphQL Playground
- **Self-hosted dashboards** — sync layout preferences for Heimdall, Homer, Homarr
- **Any web app** that stores state in localStorage but doesn't offer cloud sync

## Cost

| Component | Cost |
|-----------|------|
| Extension (Chrome Web Store) | Free to install |
| Cloudflare Worker | $0/month (free tier: 100k req/day) |
| Cloudflare D1 database | $0/month (free tier: 5M reads/day) |
| **Total** | **$0/month** |

Publishing to Chrome Web Store costs a one-time $5 developer fee.

## Project Structure

```
stashbridge/
├── packages/extension/   # WXT + Svelte 5 + Tailwind CSS
├── packages/worker/      # Cloudflare Worker + D1
└── packages/docs/        # Astro Starlight docs site
```

## Roadmap

- [x] Browser extension with localStorage proxy (Manifest V3)
- [x] Cloudflare Worker relay with D1
- [x] Dark glassmorphism popup UI
- [x] GitHub Actions CI/CD
- [x] Astro Starlight docs site
- [ ] Publish to Chrome Web Store, Firefox AMO, Edge Add-ons
- [ ] Manual import/export (JSON backup)
- [ ] Conflict log — see when a key was overwritten and by which browser
- [ ] Optional E2E encryption — encrypt values client-side before they leave the browser
- [ ] IndexedDB support (stretch goal — most common single-store patterns)
- [ ] **Mobile / PWA support** — JS SDK that site owners can add via `<script>` tag for sync without an extension. Would enable mobile browsers and PWAs to participate in sync.
- [ ] Firefox Android testing and support

## FAQ

**Why not CRDTs?**
For preferences, favorites, and UI state, last-write-wins per key is sufficient. Concurrent edits to the same key across two browsers is vanishingly rare. CRDTs add complexity that isn't warranted here.

**Why not PouchDB/CouchDB?**
StashBridge syncs *third-party* sites where you can't inject a library. The extension approach works on any site without developer integration.

**Why Cloudflare Workers instead of Docker?**
Free tier with zero maintenance. No VPS, no port forwarding, no Docker runtime. Deploys in seconds via GitHub Actions. You can always self-host differently by reimplementing the 3 API endpoints.

**Is this secure?**
All traffic is HTTPS (Cloudflare enforces it). Bearer token auth on every request. Data encrypted at rest in D1. The extension only activates on origins you explicitly whitelist.

## Contributing

Contributions welcome. Please open an issue to discuss before submitting a PR.

## License

MIT

---

*Built for the self-hosted community. Your data, your server, your rules.*
