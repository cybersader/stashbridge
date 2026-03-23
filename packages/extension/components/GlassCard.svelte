<script lang="ts">
  let { children, class: className = '' }: { children: any; class?: string } = $props();
</script>

<div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg {className}">
  {@render children()}
</div>
