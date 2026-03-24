<script lang="ts">
  import { STORAGE_KEYS } from '../lib/constants';
  import type { SyncMode } from '../lib/types';

  let { serverUrl, apiToken, syncMode, encryptionEnabled, encryptionPassphrase, onSave, onBack }: {
    serverUrl: string;
    apiToken: string;
    syncMode: SyncMode;
    encryptionEnabled: boolean;
    encryptionPassphrase: string;
    onSave: (settings: {
      serverUrl: string;
      apiToken: string;
      syncMode: SyncMode;
      encryptionEnabled: boolean;
      encryptionPassphrase: string;
    }) => void;
    onBack: () => void;
  } = $props();

  let url = $state('');
  let token = $state('');
  let mode = $state<SyncMode>('browser');
  let encEnabled = $state(false);
  let passphrase = $state('');
  let saved = $state(false);

  $effect(() => { url = serverUrl; });
  $effect(() => { token = apiToken; });
  $effect(() => { mode = syncMode; });
  $effect(() => { encEnabled = encryptionEnabled; });
  $effect(() => { passphrase = encryptionPassphrase; });

  let showServerFields = $derived(mode === 'server' || mode === 'both');
  let showEncryption = $derived(mode === 'browser' || mode === 'both');

  function handleSave() {
    onSave({
      serverUrl: url.trim().replace(/\/$/, ''),
      apiToken: token.trim(),
      syncMode: mode,
      encryptionEnabled: encEnabled,
      encryptionPassphrase: passphrase,
    });
    saved = true;
    setTimeout(() => (saved = false), 1500);
  }

  function generateToken() {
    token = crypto.randomUUID();
  }
</script>

<div class="px-4 py-3">
  <div class="flex items-center gap-2 mb-4">
    <button
      onclick={onBack}
      class="text-white/40 hover:text-white/70 transition-colors cursor-pointer text-sm"
    >&larr;</button>
    <h3 class="text-xs font-medium text-white/50 uppercase tracking-wide">Settings</h3>
  </div>

  <div class="space-y-3">
    <!-- Sync Mode -->
    <div>
      <label for="sync-mode" class="block text-xs text-white/50 mb-1">Sync Mode</label>
      <select
        id="sync-mode"
        bind:value={mode}
        class="w-full text-xs px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/90 focus:outline-none focus:border-white/25"
      >
        <option value="browser">Browser Sync (default)</option>
        <option value="server">Server Relay</option>
        <option value="both">Both</option>
      </select>
      <p class="text-[10px] text-white/30 mt-1">
        {#if mode === 'browser'}
          Syncs via Chrome/Firefox/Brave built-in sync. No server needed.
        {:else if mode === 'server'}
          Syncs via your Cloudflare Worker. Works across different browsers.
        {:else}
          Uses both. Browser sync for same-browser devices, server for cross-browser.
        {/if}
      </p>
    </div>

    <!-- Server fields (conditional) -->
    {#if showServerFields}
      <div>
        <label for="server-url" class="block text-xs text-white/50 mb-1">Server URL</label>
        <input
          id="server-url"
          type="text"
          bind:value={url}
          placeholder="https://stashbridge-worker.your-account.workers.dev"
          class="w-full text-xs px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/90 placeholder-white/30 focus:outline-none focus:border-white/25"
        />
      </div>

      <div>
        <label for="api-token" class="block text-xs text-white/50 mb-1">API Token</label>
        <div class="flex gap-2">
          <input
            id="api-token"
            type="password"
            bind:value={token}
            placeholder="Bearer token"
            class="flex-1 text-xs px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/90 placeholder-white/30 focus:outline-none focus:border-white/25"
          />
          <button
            onclick={generateToken}
            class="text-xs px-2 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white/60 transition-colors cursor-pointer whitespace-nowrap"
          >Gen</button>
        </div>
      </div>
    {/if}

    <!-- Encryption (conditional) -->
    {#if showEncryption}
      <div class="border-t border-white/5 pt-3">
        <label class="flex items-center gap-2 text-xs text-white/60 cursor-pointer">
          <input type="checkbox" bind:checked={encEnabled} class="accent-emerald-400" />
          Encrypt synced data
        </label>
        {#if encEnabled}
          <div class="mt-2">
            <label for="passphrase" class="block text-xs text-white/50 mb-1">Passphrase</label>
            <input
              id="passphrase"
              type="password"
              bind:value={passphrase}
              placeholder="Enter on each browser"
              class="w-full text-xs px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/90 placeholder-white/30 focus:outline-none focus:border-white/25"
            />
            <p class="text-[10px] text-white/30 mt-1">Same passphrase required on all browsers. Not synced — enter manually on each device.</p>
          </div>
        {/if}
      </div>
    {/if}

    <button
      onclick={handleSave}
      class="w-full text-xs py-2 rounded-lg transition-colors cursor-pointer {saved ? 'bg-emerald-500/30 text-emerald-400' : 'bg-white/10 hover:bg-white/15 text-white/80'}"
    >
      {saved ? 'Saved!' : 'Save'}
    </button>
  </div>
</div>
