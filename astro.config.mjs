// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'http://localhost:4321',
  integrations: [svelte(), tailwind()],
  output: 'server',
  adapter: node({
    mode: 'standalone'
  })
});
