import { createPinia } from 'pinia';
import type { App } from 'vue';

export function setupStores(app: App) {
  const pinia = createPinia();
  app.use(pinia);
}

export { useAppStore } from './modules/app';
export { useUserStore } from './modules/user';
