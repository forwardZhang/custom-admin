import type { App } from 'vue';
import { createPinia } from 'pinia';

export * from './modules/app';
export * from './modules/tabs';
export * from './modules/user';

export function setupStore(app: App) {
  const store = createPinia();
  app.use(store);
}
