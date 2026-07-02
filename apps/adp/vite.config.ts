import { fileURLToPath, URL } from 'node:url';

import type { Plugin } from 'vite';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import tailwindcss from '@tailwindcss/vite';
import Components from 'unplugin-vue-components/vite';
import { AntdvNextResolver } from '@antdv-next/auto-import-resolver';

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
  plugins: [
    vue(),
    vueJsx(),
    tailwindcss(),
    Components({
      resolvers: [AntdvNextResolver()],
      dts: 'src/components.d.ts',
    }),
    mockPlugin,
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@mock': fileURLToPath(new URL('./mock', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: (content: string, filename: string) => {
          if (filename.endsWith('variables.scss')) {
            return content;
          }
          return `@use "@/styles/variables.scss" as *;\n${content}`;
        },
      },
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
