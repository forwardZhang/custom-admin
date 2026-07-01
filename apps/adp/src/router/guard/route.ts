import type { Router } from 'vue-router';
import { useUserStore } from '@/store/modules/user';

/**
 * 权限与登录态路由拦截守卫
 * @param {Router} router - 路由实例
 */
export function createRouteGuard(router: Router) {
  router.beforeEach((to, from) => {
    const userStore = useUserStore();
    const isLoggedIn = userStore.isLoggedIn();

    // 是否为常量白名单路由（如 /login、/404）
    const isConstant = to.meta.constant === true;

    if (isConstant) {
      // 如果已登录用户去访问 login，则直接重定向回首页
      if (to.name === 'Login' && isLoggedIn) {
        return { path: '/' };
      }
      return true;
    }

    // 若不是白名单（需要登录），但用户未登录
    if (!isLoggedIn) {
      return { name: 'Login', query: { redirect: to.fullPath } };
    }

    return true;
  });
}
