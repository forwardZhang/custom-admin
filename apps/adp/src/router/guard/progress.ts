import type { Router } from 'vue-router';
import NProgress from 'nprogress';

/**
 * 页面跳转加载进度条守卫
 * @param {Router} router - 路由实例
 */
export function createProgressGuard(router: Router) {
  router.beforeEach(() => {
    NProgress.start?.();
    return;
  });
  router.afterEach(() => {
    NProgress.done?.();
  });
}
