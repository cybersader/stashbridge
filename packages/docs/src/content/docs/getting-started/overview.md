---
title: Overview
description: What StashBridge does and why you might want it.
sidebar:
  order: 1
---

**StashBridge** syncs `localStorage` across your browsers and devices using a lightweight browser extension and a free self-hosted relay server.

## The Problem

Many web apps store preferences, favorites, and UI state in `localStorage`. Switch browsers (or clear data) and it's all gone. There's no built-in way to sync this across browsers.

## How It Works

1. **Browser extension** watches `localStorage` changes on sites you whitelist
2. Changes are pushed to your **Cloudflare Worker** relay (free tier)
3. Other browsers pull those changes and apply them locally

That's it. Last-write-wins, no accounts, no complexity.

## Use Cases

- Sync favorited plugins on [Obsidian Stats](https://www.obsidianstats.com)
- Keep Hacker News upvoted/hidden stories across browsers
- Sync preferences for dev tools (Swagger UI, GraphQL Playground)
- Persist layout preferences for self-hosted dashboards

## What You Need

- A Chromium browser (Chrome, Edge, Brave) or Firefox
- A free [Cloudflare account](https://dash.cloudflare.com/sign-up)
- 5 minutes to set up

## Cost

| Component | Cost |
|-----------|------|
| Extension (Chrome) | $0 (free to install) |
| Cloudflare Worker | $0/month (free tier: 100k requests/day) |
| Cloudflare D1 database | $0/month (free tier: 5M reads/day) |
| **Total** | **$0/month** |
