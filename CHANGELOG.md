# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-03-23

### Added

- **Browser Extension** (Manifest V3, Chrome/Firefox/Edge)
  - localStorage proxy via main-world script injection
  - Content script bridge between page context and extension
  - Background service worker with alarm-based sync engine
  - Debounced push (500ms) and periodic pull (60s)
  - Popup UI with dark glassmorphism theme (Svelte 5 + Tailwind CSS)
  - Whitelist manager with per-key and wildcard rules
  - Settings panel for server URL and bearer token
  - Auto-fill origin from active tab
  - Pending changes queue with persistence across service worker restarts

- **Cloudflare Worker Relay Server**
  - `POST /sync` — batch upsert with last-write-wins conflict resolution
  - `GET /pull?since=` — pull changes since timestamp
  - `GET /health` — unauthenticated health check
  - D1 (SQLite) database with indexed schema
  - Bearer token authentication
  - 100KB per-value soft limit, 100 entries per batch limit
  - CORS headers for cross-origin extension requests

- **Documentation Site** (Astro Starlight)
  - Getting Started guide (overview, install, deploy, connect)
  - Whitelist rules guide
  - Self-hosting guide with data management commands
  - API reference
  - Architecture reference with sync flow diagrams

- **CI/CD** (GitHub Actions)
  - `deploy-worker.yml` — auto-deploy worker on push to `packages/worker/`
  - `build-extension.yml` — build Chrome + Firefox artifacts
  - `deploy-docs.yml` — deploy docs to Cloudflare Pages

- **Monorepo** (Bun workspaces)
  - `packages/extension/` — WXT + Svelte 5 + Tailwind CSS
  - `packages/worker/` — Cloudflare Workers + D1
  - `packages/docs/` — Astro Starlight
