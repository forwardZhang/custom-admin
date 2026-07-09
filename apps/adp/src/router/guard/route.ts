import type { Router, RouteLocationNormalized } from 'vue-router';
import { useUserStore } from '@/store/modules/user';
import { ROUTE_NAME_LOGIN, ROUTE_NAME_NOT_FOUND, ROUTE_NAME_ROOT } from '@/constants/route';
import {
  getAuthorizedHomeRouteName,
  registerAuthorizedRoutes,
  resetAuthorizedRoutes,
} from '@/router/routes/route-runtime';

/**
 * 权限与登录态路由守卫
 *
 * 这里刻意把动态路由初始化收敛在“已登录访问非登录页”的主链路中：
 * - 登录页不直接跳 DashboardWorkbench，因为它是动态路由，刷新后可能尚未注册；
 * - 组件侧也只跳 RootLayout，由本守卫统一决定真正的首页；
 * - 动态路由注册完成后，如果当前路由已经被 404 捕获，则 replace 回原地址重新匹配。
 */
export function createRouteGuard(router: Router) {
  router.beforeEach(async (to: RouteLocationNormalized) => {
    const userStore = useUserStore();

    // 已登录用户访问 /login 时，只回到根路由入口。
    // 根路由会在动态路由准备好后再转到真实首页，避免解析未注册的动态 name。
    if (to.name === ROUTE_NAME_LOGIN) {
      return userStore.isLogin ? { name: ROUTE_NAME_ROOT, replace: true } : true;
    }

    // 未登录时只放行常量公开路由。404 不在这里直接放行：
    // 对未登录用户来说，访问业务深链应先去登录页，而不是先看到 404。
    if (!userStore.isLogin) {
      if (to.meta.constant && to.name !== ROUTE_NAME_NOT_FOUND) {
        return true;
      }

      return { name: ROUTE_NAME_LOGIN, query: { redirect: to.fullPath } };
    }

    // 已登录但刷新页面后 Pinia 内存状态会丢失，此时用 token 拉回用户信息和菜单。
    // 如果 token 失效，清掉动态路由状态并回登录页。
    const userReady = await ensureUserInfo(userStore);
    if (!userReady) {
      resetAuthorizedRoutes(router);
      return { name: ROUTE_NAME_LOGIN, query: { redirect: to.fullPath } };
    }

    // 根据当前用户菜单注册一次动态路由。
    // registerAuthorizedRoutes 内部会维护“是否已注册”的运行时状态，避免重复 addRoute。
    const routesAdded = registerAuthorizedRoutes(router, userStore.menus);

    if (to.name === ROUTE_NAME_NOT_FOUND && routesAdded) {
      // 刷新时当前地址可能已先命中 404，注册动态路由后需要重新匹配一次。
      return {
        path: to.path,
        query: to.query,
        hash: to.hash,
        replace: true,
      };
    }

    // RootLayout 是统一首页入口，不承载具体页面。
    // 当前账号能访问的首页由 route-runtime 根据菜单计算：优先工作台，否则第一个可见叶子菜单。
    if (to.name === ROUTE_NAME_ROOT) {
      const homeRouteName = getAuthorizedHomeRouteName();
      return homeRouteName
        ? { name: homeRouteName, replace: true }
        : { name: ROUTE_NAME_NOT_FOUND };
    }

    return true;
  });
}

/** 确保用户信息已加载，供动态路由生成 menus 使用。 */
async function ensureUserInfo(userStore: ReturnType<typeof useUserStore>) {
  if (userStore.userInfo) return true;
  return userStore.initUserInfo();
}
