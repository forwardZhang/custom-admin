import type { Router } from 'vue-router';
import { createProgressGuard } from './progress';
import { createRouteGuard } from './route';

/**
 * 初始化所有的路由守卫
 * @param {Router} router - 路由实例
 */
export function createRouterGuard(router: Router) {
  createRouteGuard(router);
  createProgressGuard(router);
}
