<script lang="ts">
  import type { StorageUsage } from '../lib/types';

  let { usage }: { usage: StorageUsage } = $props();

  let percent = $derived(Math.round((usage.used / usage.total) * 100));
  let usedKB = $derived((usage.used / 1024).toFixed(1));
  let totalKB = $derived((usage.total / 1024).toFixed(0));

  let barColor = $derived(
    percent < 60 ? 'bg-emerald-400' :
    percent < 85 ? 'bg-amber-400' :
    'bg-red-400'
  );
</script>

<div class="px-4 py-2">
  <div class="flex items-center justify-between text-[10px] text-white/40 mb-1">
    <span>Browser Sync Storage</span>
    <span>{usedKB}KB / {totalKB}KB ({percent}%)</span>
  </div>
  <div class="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
    <div
      class="h-full rounded-full transition-all duration-500 {barColor}"
      style="width: {percent}%"
    ></div>
  </div>
</div>
