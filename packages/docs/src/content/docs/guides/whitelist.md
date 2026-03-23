---
title: Whitelist Rules
description: Control which sites and keys StashBridge syncs.
---

StashBridge only syncs localStorage for origins and keys you explicitly whitelist. Nothing is synced by default.

## Rule Types

### Specific Key
Sync a single localStorage key for a specific site:
- **Origin**: `https://www.obsidianstats.com`
- **Key**: `favorites`

Only the `favorites` key on that exact origin will be synced.

### Wildcard (All Keys)
Sync every localStorage key for a site:
- **Origin**: `https://www.obsidianstats.com`
- **Key**: `*`

Use with caution — some sites store tokens or session data in localStorage that you may not want to sync.

## Managing Rules

### Add a Rule
1. Click the StashBridge popup
2. Navigate to the target site (origin auto-fills)
3. Enter a key name or check "sync all keys"
4. Click **Add Rule**

### Remove a Rule
Hover over a rule in the whitelist and click the **x** button. Removing a rule stops syncing that key but does not delete existing data from the server.

## Tips

- Start with specific keys rather than wildcards
- Avoid syncing keys that contain auth tokens or session data
- The origin must match exactly (including `https://` vs `http://`)
