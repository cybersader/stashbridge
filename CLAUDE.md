# StashBridge

Browser extension + Cloudflare Worker for syncing localStorage across browsers.

## Structure
- `packages/extension/` — WXT browser extension (Svelte 5, Tailwind CSS, TypeScript)
- `packages/worker/` — Cloudflare Worker with D1 (SQLite)
- `packages/docs/` — Astro Starlight documentation site

## Commands
- Extension dev: `cd packages/extension && bun run dev`
- Extension build: `cd packages/extension && bun run build:chrome`
- Worker dev: `cd packages/worker && bun run dev`
- Worker deploy: `cd packages/worker && bunx wrangler deploy`
- Docs dev: `cd packages/docs && bun run dev`

## Conventions
- TypeScript everywhere, strict mode
- Svelte 5 runes syntax ($state, $derived, $effect)
- Tailwind for all styling, dark glassmorphism theme
- No external UI libraries
- Bun as package manager
- Keep it minimal — this is a small utility tool
