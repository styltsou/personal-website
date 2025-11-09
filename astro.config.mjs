// @ts-check
import { defineConfig } from 'astro/config';

import vercel from '@astrojs/vercel/serverless';
import react from '@astrojs/react';
import partytown from '@astrojs/partytown';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import compress from 'astro-compress';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ['import'],
        },
  adapter: vercel({}),
  server: {
    host: true, // Allow external connections
  },
  vite: {
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
        '@/components': new URL('./src/components', import.meta.url).pathname,
        '@/hooks': new URL('./src/hooks', import.meta.url).pathname,
        '@/stores': new URL('./src/stores', import.meta.url).pathname,
        '@/utils': new URL('./src/utils', import.meta.url).pathname,
        '@/data': new URL('./src/data', import.meta.url).pathname,
        '@/styles': new URL('./src/styles', import.meta.url).pathname,
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
