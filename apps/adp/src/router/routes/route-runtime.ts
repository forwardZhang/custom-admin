import type { Router, RouteRecordName } from 'vue-router';
import type { MenuItem } from '@/api/auth';
import { ROUTE_NAME_DASHBOARD, ROUTE_NAME_ROOT } from '@/constants/route';
import { generateDynamicRoutes } from './dynamic-routes';

/**
 * 动态权限路由的运行时状态。
 *
 * 这些状态属于 router，而不是 user store：
 * - user store 只关心 token/userInfo/menus；
 * - router runtime 负责“动态路由是否已注册、怎么移除、当前首页是谁”。
 */
const removeRouteFns: Array<() => void> = [];
let authorizedRoutesReady = false;
let authorizedHomeRouteName: RouteRecordName | null = null;

/** 当前账号的动态路由是否已经注册到 Vue Router。 */
export function isAuthorizedRoutesReady() {
  return authorizedRoutesReady;
}

/**
 * 注册当前账号可访问的动态路由。
 *
 * 返回值表示“本次是否真的新增了路由”：
 * - true：首次注册，守卫可能需要 replace 当前地址重新匹配；
 * - false：之前已经注册过，本次不重复 addRoute。
 */
export function registerAuthorizedRoutes(router: Router, menus: MenuItem[]) {
  if (authorizedRoutesReady) return false;

  const dynamicRoutes = generateDynamicRoutes({ menus });

  dynamicRoutes.forEach((route) => {
    // 防御重复 name。正常情况下 authorizedRoutesReady 已经能挡住重复注册，
    // 这里再用 router.hasRoute 兜底，避免热更新或异常状态下 addRoute 报警。
    if (route.name && router.hasRoute(route.name)) return;

    // 动态路由统一挂到 RootLayout 下，并保存 Vue Router 返回的 remove 函数。
    // 登出或 token 失效时调用这些 remove 函数即可卸载当前账号路由。
    const removeRoute = router.addRoute(ROUTE_NAME_ROOT, route);
    removeRouteFns.push(removeRoute);
  });

  // 首页必须在动态路由注册之后计算，因为 router.hasRoute 需要看到刚刚挂载的路由。
  authorizedHomeRouteName = resolveHomeRouteName(router, menus);
  authorizedRoutesReady = true;
  return true;
}

/** 当前账号的首页路由 name，供 RootLayout 重定向使用。 */
export function getAuthorizedHomeRouteName() {
  return authorizedHomeRouteName;
}

/**
 * 清理当前账号动态路由。
 *
 * 典型触发场景：
 * - 主动退出登录；
 * - token 失效，用户信息初始化失败；
 * - 后续扩展切换账号/角色时也可以复用。
 */
export function resetAuthorizedRoutes(router: Router) {
  // 反向移除更安全：如果存在父子关系，先卸载后注册的子路由。
  [...removeRouteFns].reverse().forEach((removeRoute) => {
    removeRoute();
  });

  removeRouteFns.length = 0;
  authorizedHomeRouteName = null;
  authorizedRoutesReady = false;
}

/**
 * 解析当前账号首页。
 *
 * 优先使用约定首页 DashboardWorkbench；
 * 如果这个账号没有该菜单，则退到菜单树里的第一个可见叶子菜单。
 */
function resolveHomeRouteName(router: Router, menus: MenuItem[]) {
  if (router.hasRoute(ROUTE_NAME_DASHBOARD)) {
    return ROUTE_NAME_DASHBOARD;
  }

  return findFirstVisibleLeafName(menus);
}

/** 深度优先查找第一个可见页面菜单，用作无工作台权限时的首页兜底。 */
function findFirstVisibleLeafName(menus: MenuItem[]): string | null {
  for (const menu of menus) {
    if (menu.hideInMenu) continue;

    if (menu.children?.length) {
      const childName = findFirstVisibleLeafName(menu.children);
      if (childName) return childName;
    } else {
      return menu.name;
    }
  }

  return null;
}
