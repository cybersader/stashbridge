<script lang="ts">
  import GlassCard from '../../components/GlassCard.svelte';
  import SyncStatus from '../../components/SyncStatus.svelte';
  import StorageUsage from '../../components/StorageUsage.svelte';
  import WhitelistManager from '../../components/WhitelistManager.svelte';
  import Settings from '../../components/Settings.svelte';
  import { STORAGE_KEYS } from '../../lib/constants';
  import type { WhitelistRule, SyncMode, StorageUsage as StorageUsageType } from '../../lib/types';
  import { getWhitelist, setWhitelist } from '../../lib/storage';

  let view = $state<'main' | 'settings'>('main');
  let connected = $state(false);
  let lastSync = $state(0);
  let pending = $state(0);
  let syncMode = $state<SyncMode>('browser');
  let usage = $state<StorageUsageType>({ used: 0, total: 102_400 });
  let rules = $state<WhitelistRule[]>([]);
  let serverUrl = $state('');
  let apiToken = $state('');
  let encryptionEnabled = $state(false);
  let encryptionPassphrase = $state('');

  $effect(() => {
    loadState();
  });

  async function loadState() {
    const storage = await browser.storage.local.get([
      STORAGE_KEYS.WHITELIST,
      STORAGE_KEYS.SERVER_URL,
      STORAGE_KEYS.API_TOKEN,
      STORAGE_KEYS.SYNC_MODE,
      STORAGE_KEYS.ENCRYPTION_ENABLED,
      STORAGE_KEYS.ENCRYPTION_PASSPHRASE,
    ]);

    rules = (storage[STORAGE_KEYS.WHITELIST] as WhitelistRule[]) ?? [];
    serverUrl = (storage[STORAGE_KEYS.SERVER_URL] as string) ?? '';
    apiToken = (storage[STORAGE_KEYS.API_TOKEN] as string) ?? '';
    syncMode = (storage[STORAGE_KEYS.SYNC_MODE] as SyncMode) ?? 'browser';
    encryptionEnabled = (storage[STORAGE_KEYS.ENCRYPTION_ENABLED] as boolean) ?? false;
    encryptionPassphrase = (storage[STORAGE_KEYS.ENCRYPTION_PASSPHRASE] as string) ?? '';

    // Get status from background
    try {
      const status = await browser.runtime.sendMessage({ type: 'GET_STATUS' });
      if (status) {
        connected = status.connected;
        lastSync = status.lastSync;
        pending = status.pending;
        syncMode = status.syncMode;
        usage = status.usage;
      }
    } catch {}
  }

  async function handleSyncNow() {
    await browser.runtime.sendMessage({ type: 'SYNC_NOW' });
    setTimeout(loadState, 500);
  }

  async function handleAddRule(rule: WhitelistRule) {
    if (rules.some(r => r.origin === rule.origin && r.key === rule.key)) return;
    rules = [...rules, rule];
    await setWhitelist(rules);
  }

  async function handleRemoveRule(index: number) {
    rules = rules.filter((_, i) => i !== index);
    await setWhitelist(rules);
  }

  async function handleSaveSettings(settings: {
    serverUrl: string;
    apiToken: string;
    syncMode: SyncMode;
    encryptionEnabled: boolean;
    encryptionPassphrase: string;
  }) {
    serverUrl = settings.serverUrl;
    apiToken = settings.apiToken;
    syncMode = settings.syncMode;
    encryptionEnabled = settings.encryptionEnabled;
    encryptionPassphrase = settings.encryptionPassphrase;

    await browser.storage.local.set({
      [STORAGE_KEYS.SERVER_URL]: settings.serverUrl,
      [STORAGE_KEYS.API_TOKEN]: settings.apiToken,
      [STORAGE_KEYS.SYNC_MODE]: settings.syncMode,
      [STORAGE_KEYS.ENCRYPTION_ENABLED]: settings.encryptionEnabled,
      [STORAGE_KEYS.ENCRYPTION_PASSPHRASE]: settings.encryptionPassphrase,
    });

    // Refresh status
    setTimeout(loadState, 300);
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
        {syncMode}
        {encryptionEnabled}
        {encryptionPassphrase}
        onSave={handleSaveSettings}
        onBack={() => (view = 'main')}
      />
    </GlassCard>
  {:else}
    <!-- Sync Status -->
    <GlassCard>
      <SyncStatus {connected} {lastSync} {pending} {syncMode} onSyncNow={handleSyncNow} />
      {#if syncMode === 'browser' || syncMode === 'both'}
        <StorageUsage {usage} />
      {/if}
    </GlassCard>

    <!-- Whitelist -->
    <GlassCard>
      <WhitelistManager {rules} onAdd={handleAddRule} onRemove={handleRemoveRule} />
    </GlassCard>
  {/if}
</div>
