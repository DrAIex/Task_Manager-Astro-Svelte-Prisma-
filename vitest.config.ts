/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte({ hot: false })],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
    setupFiles: ['./test/setup.ts'],
  },
  resolve: {
    conditions: ['browser', 'svelte'],
  },
}); 