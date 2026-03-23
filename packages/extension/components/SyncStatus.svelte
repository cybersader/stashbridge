<script lang="ts">
  let { connected, lastSync, pending, onSyncNow }: {
    connected: boolean;
    lastSync: number;
    pending: number;
    onSyncNow: () => void;
  } = $props();

  let relativeTime = $derived(formatRelative(lastSync));

  function formatRelative(ts: number): string {
    if (!ts) return 'never';
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 5) return 'just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  }

  // Refresh relative time every 5s
  $effect(() => {
    const interval = setInterval(() => {
      relativeTime = formatRelative(lastSync);
    }, 5000);
    return () => clearInterval(interval);
  });
</script>

<div class="flex items-center justify-between px-4 py-3">
  <div class="flex items-center gap-2 text-sm">
    <span class="w-2 h-2 rounded-full {connected ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 'bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.5)]'}"></span>
    <span class="text-white/70">{connected ? 'Connected' : 'Not configured'}</span>
    {#if lastSync}
      <span class="text-white/40">Last: {relativeTime}</span>
    {/if}
    {#if pending > 0}
      <span class="text-amber-400/80 text-xs">{pending} pending</span>
    {/if}
  </div>
  <button
    onclick={onSyncNow}
    class="text-xs px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 active:bg-white/20 text-white/80 transition-colors cursor-pointer"
  >
    Sync Now
  </button>
</div>
