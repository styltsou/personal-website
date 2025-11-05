// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import partytown from '@astrojs/partytown';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import compress from 'astro-compress';

// https://astro.build/config
export default defineConfig({
  // Enable View Transitions API for smooth page navigation
  output: 'static',
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ['import'],
        },
      },
    },
  },
  integrations: [
    react(),
    partytown(),
    sitemap(),
    mdx(),
    compress({
      css: true,
      html: true,
      js: true,
      img: true,
      svg: true,
    }),
  ],
});