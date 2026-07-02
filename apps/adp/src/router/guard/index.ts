import type { Router } from 'vue-router';
import { createProgressGuard } from './progress';
import { createRouteGuard } from './route';
import { createTitleGuard } from './title';

/**
 * 初始化所有的路由守卫
 *
 * 注册顺序即执行顺序（beforeEach 按注册顺序触发）：
 * 1. progress —— 顶部进度条（最早启动）；
 * 2. route —— 登录态 / 权限 / 用户信息初始化；
 * 3. title —— afterEach 设置文档标题。
 * @param router - 路由实例
 */
export function createRouterGuard(router: Router) {
  createProgressGuard(router);
  createRouteGuard(router);
  createTitleGuard(router);
}
