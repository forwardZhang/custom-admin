import type { Router } from 'vue-router';
import { useUserStore } from '@/store/modules/user';
import { ROUTE_NAME_DASHBOARD, ROUTE_NAME_LOGIN } from '@/constants/route';

/**
 * 权限与登录态路由守卫
 *
 * 参考 soybean-admin 的 guard/route.ts，适配当前纯静态路由项目：
 * 1. 已登录访问登录页 → 回首页；
 * 2. 登录页本身放行（未登录可进入）；
 * 3. 常量白名单路由（meta.constant）免登录放行；
 * 4. 需登录但未登录 → 跳登录页并携带 redirect；
 * 5. 已登录但用户信息为空（刷新页面场景）→ 拉取用户信息，失败则登出；
 * 6. meta.roles 角色权限校验，无权限跳 404（可扩展为 403）。
 * @param router - 路由实例
 */
export function createRouteGuard(router: Router) {
  router.beforeEach(async (to) => {
    const userStore = useUserStore();
    const isLogin = userStore.isLogin;

    // 1. 已登录访问登录页 → 回首页（避免重复登录）
    if (to.name === ROUTE_NAME_LOGIN && isLogin) {
      return { name: ROUTE_NAME_DASHBOARD };
    }

    // 2. 登录页放行（无论登录态，未登录可进入登录）
    if (to.name === ROUTE_NAME_LOGIN) {
      return true;
    }

    // 3. 常量白名单路由（免登录、免鉴权，如 404）直接放行
    if (to.meta.constant) {
      return true;
    }

    // 4. 需要登录但未登录 → 跳登录页，携带 redirect 供登录后回跳
    //    redirect 保留 path 语义（to.fullPath），以便还原任意深链（含 query/params）
    if (!isLogin) {
      return { name: ROUTE_NAME_LOGIN, query: { redirect: to.fullPath } };
    }

    // 5. 已登录但用户信息为空（页面刷新后 store 重建丢失 userInfo）→ 拉取用户信息
    if (!userStore.userInfo) {
      const ok = await userStore.initUserInfo();
      // 拉取失败（token 失效等）→ 跳登录页
      if (!ok) {
        return { name: ROUTE_NAME_LOGIN, query: { redirect: to.fullPath } };
      }
    }

    return true;
  });
}
