<script lang="ts">
  import type { WhitelistRule } from '../lib/types';

  let { rules, onAdd, onRemove }: {
    rules: WhitelistRule[];
    onAdd: (rule: WhitelistRule) => void;
    onRemove: (index: number) => void;
  } = $props();

  let origin = $state('');
  let key = $state('');
  let wildcard = $state(false);

  // Auto-fill origin from current tab
  $effect(() => {
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      if (tabs[0]?.url) {
        try {
          origin = new URL(tabs[0].url).origin;
        } catch {}
      }
    });
  });

  function handleAdd() {
    const trimmedOrigin = origin.trim();
    const trimmedKey = wildcard ? '*' : key.trim();
    if (!trimmedOrigin || !trimmedKey) return;
    onAdd({ origin: trimmedOrigin, key: trimmedKey });
    key = '';
    wildcard = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') handleAdd();
  }
</script>

<div class="px-4 py-3">
  <h3 class="text-xs font-medium text-white/50 uppercase tracking-wide mb-2">Whitelist</h3>

  {#if rules.length === 0}
    <p class="text-xs text-white/30 mb-3">No rules yet. Add a site to start syncing.</p>
  {:else}
    <div class="space-y-1 mb-3 max-h-[140px] overflow-y-auto">
      {#each rules as rule, i}
        <div class="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg bg-white/5 group">
          <div class="flex items-center gap-1.5 min-w-0">
            <span class="text-white/60 truncate">{rule.origin.replace('https://', '')}</span>
            <span class="text-white/20">/</span>
            <span class="text-emerald-400/80 font-mono">{rule.key}</span>
          </div>
          <button
            onclick={() => onRemove(i)}
            class="text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 ml-2 cursor-pointer"
          >x</button>
        </div>
      {/each}
    </div>
  {/if}

  <div class="space-y-2">
    <input
      type="text"
      bind:value={origin}
      placeholder="https://example.com"
      class="w-full text-xs px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/90 placeholder-white/30 focus:outline-none focus:border-white/25"
      onkeydown={handleKeydown}
    />
    {#if !wildcard}
      <input
        type="text"
        bind:value={key}
        placeholder="localStorage key"
        class="w-full text-xs px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/90 placeholder-white/30 focus:outline-none focus:border-white/25"
        onkeydown={handleKeydown}
      />
    {/if}
    <div class="flex items-center justify-between">
      <label class="flex items-center gap-1.5 text-xs text-white/50 cursor-pointer">
        <input type="checkbox" bind:checked={wildcard} class="accent-emerald-400" />
        sync all keys
      </label>
      <button
        onclick={handleAdd}
        class="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-colors cursor-pointer"
      >
        Add Rule
      </button>
    </div>
  </div>
</div>
