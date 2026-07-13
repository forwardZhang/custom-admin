import type { RouteMeta } from 'vue-router';
import type { Component } from 'vue';

/**
 * 前端页面映射项。
 *
 * 后端菜单只负责告诉前端“用户能看到哪些 menu name”；
 * 前端通过这里把 menu name 映射到真实 path/component/meta。
 */
export interface RouteMapItem {
  /** 页面真实访问路径。注册到 RootLayout 下时会自动去掉首尾斜杠。 */
  path: string;
  /** 页面组件，建议始终使用懒加载，避免后台页面一次性打进首包。 */
  component?: () => Promise<Component>;
  /** 额外路由 meta，会与后端 menu 提供的 title/icon/order/hideInMenu 合并。 */
  meta?: Partial<RouteMeta>;
}

/**
 * 后端菜单 name 到前端页面的白名单映射。
 *
 * 这不是完整路由表，也不决定用户权限：
 * - 权限来自后端返回的 menus；
 * - routeMap 只决定某个 menu.name 对应哪个前端页面；
 * - 如果菜单 name 没有命中这里，dynamic-routes 会把它注册到 403 兜底页。
 */
export const routeMap: Record<string, RouteMapItem> = {
  DashboardWorkbench: {
    path: '/dashboard/workbench',
    component: () => import('@/views/dashboard/workbench/index.vue'),
  },
  DashboardAnalysis: {
    path: '/dashboard/analysis',
    component: () => import('@/views/dashboard/analysis/index.vue'),
  },

  DemoScrollbar: {
    path: '/demo/scroll',
    component: () => import('@/views/demo/scrollbar/index.vue'),
    meta: { keepAlive: true },
  },
};
