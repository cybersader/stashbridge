import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  modules: ['@wxt-dev/module-svelte'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    name: 'StashBridge',
    description: 'Sync localStorage across browsers and devices',
    permissions: ['storage', 'alarms', 'activeTab'],
    host_permissions: ['<all_urls>'],
  },
});
