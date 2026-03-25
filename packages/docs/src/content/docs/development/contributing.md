---
title: Contributing
description: How to contribute to StashBridge.
sidebar:
  order: 3
---

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork and set up the project (see [Local Development](./setup/))
3. Create a feature branch: `git checkout -b my-feature`
4. Make your changes
5. Test by loading the extension in developer mode
6. Commit and push, then open a pull request

## Before Submitting a PR

- Run the extension build and verify it loads: `cd packages/extension && bun run build:chrome`
- Run the docs build if you changed docs: `cd packages/docs && bun run build`
- Keep PRs focused — one feature or fix per PR
- Please open an issue first to discuss larger changes

## Code Conventions

- **TypeScript** everywhere, strict mode
- **Svelte 5** runes syntax (`$state`, `$derived`, `$effect`)
- **Tailwind CSS** for all styling
- No external UI component libraries
- Keep it minimal — this is a small utility tool

## Key Files

| File | Purpose |
|------|---------|
| `packages/extension/entrypoints/injected.ts` | Main-world localStorage proxy |
| `packages/extension/entrypoints/content.ts` | Bridge between page and extension |
| `packages/extension/entrypoints/background.ts` | Sync engine (alarms, push/pull) |
| `packages/extension/lib/sync-backend.ts` | Browser sync + server relay abstraction |
| `packages/extension/lib/compress.ts` | LZ-String compression |
| `packages/extension/lib/crypto.ts` | AES-GCM encryption |
| `packages/worker/src/index.ts` | Cloudflare Worker entry (API routes) |
