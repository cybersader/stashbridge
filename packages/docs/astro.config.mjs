import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://cybersader.github.io',
  base: '/stashbridge',
  integrations: [
    starlight({
      title: 'StashBridge',
      logo: {
        src: './src/assets/logo.png',
      },
      description: 'Sync localStorage across browsers and devices',
      social: {
        github: 'https://github.com/cybersader/stashbridge',
      },
      customCss: ['./src/styles/custom.css'],
      sidebar: [
        {
          label: 'Getting Started',
          autogenerate: { directory: 'getting-started' },
        },
        {
          label: 'Guides',
          autogenerate: { directory: 'guides' },
        },
        {
          label: 'Reference',
          autogenerate: { directory: 'reference' },
        },
        {
          label: 'Development',
          autogenerate: { directory: 'development' },
        },
      ],
    }),
  ],
});
