import type { App } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { constantRoutes } from './routes/constant-routes';
import { createRouterGuard } from './guard';

export const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes: constantRoutes,
});

/**
 * 初始化并挂载路由以及守卫
 * @param {Object} options - 初始化配置项
 * @param {App} options.app - Vue 应用实例
 */
export async function setupRouter(app: App) {
  app.use(router);
  createRouterGuard(router);
  await router.isReady();
}
