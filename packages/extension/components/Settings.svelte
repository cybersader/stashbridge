<script lang="ts">
  import { STORAGE_KEYS } from '../lib/constants';

  let { serverUrl, apiToken, onSave, onBack }: {
    serverUrl: string;
    apiToken: string;
    onSave: (serverUrl: string, apiToken: string) => void;
    onBack: () => void;
  } = $props();

  let url = $state(serverUrl ?? '');
  let token = $state(apiToken ?? '');
  let saved = $state(false);

  // Keep local state in sync with props
  $effect(() => { url = serverUrl; });
  $effect(() => { token = apiToken; });

  function handleSave() {
    onSave(url.trim().replace(/\/$/, ''), token.trim());
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
      <p class="text-[10px] text-white/30 mt-1">Must match STASHBRIDGE_TOKEN secret on your worker</p>
    </div>

    <button
      onclick={handleSave}
      class="w-full text-xs py-2 rounded-lg transition-colors cursor-pointer {saved ? 'bg-emerald-500/30 text-emerald-400' : 'bg-white/10 hover:bg-white/15 text-white/80'}"
    >
      {saved ? 'Saved!' : 'Save'}
    </button>
  </div>
</div>
