import { fileURLToPath, URL } from 'node:url';

import type { Plugin } from 'vite';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import tailwindcss from '@tailwindcss/vite';

import { createMockMiddleware } from './mock/server.ts';

const mockPlugin: Plugin = {
  name: 'adp-mock-server',
  configureServer(server) {
    if (process.env.VITE_USE_MOCK !== 'false') {
      server.middlewares.use(createMockMiddleware());
    }
  },
};

export default defineConfig({
  plugins: [vue(), vueJsx(), tailwindcss(), mockPlugin],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@mock': fileURLToPath(new URL('./mock', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3456,
    open: true,
  },
  build: {
    target: 'es2022',
  },
});
