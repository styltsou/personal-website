// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'url';
import { resolve } from 'path';

import vercel from '@astrojs/vercel';
import react from '@astrojs/react';
import partytown from '@astrojs/partytown';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import compress from 'astro-compress';

const root = fileURLToPath(new URL('.', import.meta.url));

// https://astro.build/config
export default defineConfig({
  output: 'static', // Enable static generation for better performance and SEO
  adapter: vercel({}),
  vite: {
    resolve: {
      alias: {
        '@': resolve(root, './src'),
        '@/components': resolve(root, './src/components'),
        '@/hooks': resolve(root, './src/hooks'),
        '@/stores': resolve(root, './src/stores'),
        '@/utils': resolve(root, './src/utils'),
        '@/data': resolve(root, './src/data'),
        '@/styles': resolve(root, './src/styles'),
      },
    },
  },
  integrations: [
    react({
      include: ['**/*.{tsx,jsx}'],
    }),
    partytown(),
    sitemap(),
    mdx(),
    compress({
      CSS: true,
      HTML: true,
      JavaScript: true,
      Image: true,
      SVG: true,
    }),
  ],
});
