<script lang="ts">
  import GlassCard from '../../components/GlassCard.svelte';
  import SyncStatus from '../../components/SyncStatus.svelte';
  import WhitelistManager from '../../components/WhitelistManager.svelte';
  import Settings from '../../components/Settings.svelte';
  import { STORAGE_KEYS } from '../../lib/constants';
  import type { WhitelistRule } from '../../lib/types';
  import { getWhitelist, setWhitelist } from '../../lib/storage';

  let view = $state<'main' | 'settings'>('main');
  let connected = $state(false);
  let lastSync = $state(0);
  let pending = $state(0);
  let rules = $state<WhitelistRule[]>([]);
  let serverUrl = $state('');
  let apiToken = $state('');

  // Load state on mount
  $effect(() => {
    loadState();
  });

  async function loadState() {
    const storage = await browser.storage.local.get([
      STORAGE_KEYS.WHITELIST,
      STORAGE_KEYS.SERVER_URL,
      STORAGE_KEYS.API_TOKEN,
      STORAGE_KEYS.LAST_SYNC_AT,
      STORAGE_KEYS.PENDING_CHANGES,
    ]);

    rules = (storage[STORAGE_KEYS.WHITELIST] as WhitelistRule[]) ?? [];
    serverUrl = (storage[STORAGE_KEYS.SERVER_URL] as string) ?? '';
    apiToken = (storage[STORAGE_KEYS.API_TOKEN] as string) ?? '';
    lastSync = (storage[STORAGE_KEYS.LAST_SYNC_AT] as number) ?? 0;
    pending = ((storage[STORAGE_KEYS.PENDING_CHANGES] as unknown[]) ?? []).length;
    connected = !!serverUrl && !!apiToken;
  }

  async function handleSyncNow() {
    await browser.runtime.sendMessage({ type: 'SYNC_NOW' });
    // Refresh status after sync
    setTimeout(loadState, 500);
  }

  async function handleAddRule(rule: WhitelistRule) {
    // Prevent duplicates
    if (rules.some(r => r.origin === rule.origin && r.key === rule.key)) return;
    rules = [...rules, rule];
    await setWhitelist(rules);
  }

  async function handleRemoveRule(index: number) {
    rules = rules.filter((_, i) => i !== index);
    await setWhitelist(rules);
  }

  async function handleSaveSettings(url: string, token: string) {
    serverUrl = url;
    apiToken = token;
    connected = !!url && !!token;
    await browser.storage.local.set({
      [STORAGE_KEYS.SERVER_URL]: url,
      [STORAGE_KEYS.API_TOKEN]: token,
    });
  }
</script>

<div class="p-3 space-y-2">
  <!-- Header -->
  <div class="flex items-center justify-between px-1">
    <h1 class="text-sm font-semibold text-white/90 tracking-tight">StashBridge</h1>
    <button
      onclick={() => (view = view === 'main' ? 'settings' : 'main')}
      class="text-white/40 hover:text-white/70 transition-colors cursor-pointer text-base leading-none"
      title="Settings"
    >
      {view === 'main' ? '\u2699' : ''}
    </button>
  </div>

  {#if view === 'settings'}
    <GlassCard>
      <Settings
        {serverUrl}
        {apiToken}
        onSave={handleSaveSettings}
        onBack={() => (view = 'main')}
      />
    </GlassCard>
  {:else}
    <!-- Sync Status -->
    <GlassCard>
      <SyncStatus {connected} {lastSync} {pending} onSyncNow={handleSyncNow} />
    </GlassCard>

    <!-- Whitelist -->
    <GlassCard>
      <WhitelistManager {rules} onAdd={handleAddRule} onRemove={handleRemoveRule} />
    </GlassCard>
  {/if}
</div>
