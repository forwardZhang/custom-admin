import type { RouteRecordRaw } from 'vue-router';
import type { MenuItem } from '@/api/auth';
import { routeMap } from './route-map';

/**
 * 403 兜底组件
 *
 * 后端菜单可能已经下发了某个 name，但前端还没在 routeMap 中接入对应页面。
 * 这种情况不应该让 router 注册失败，而是注册到 403，方便定位权限/前端映射缺口。
 */
const ForbiddenComponent = () => import('@/views/exception/403.vue');

/**
 * 根据后端菜单树生成动态路由。
 *
 * 生成结果会统一挂到 RootLayout 下：
 * - 有 children 的菜单是“目录路由”，只负责 redirect 到第一个可见子菜单；
 * - 没有 children 的菜单是“页面路由”，component 从 routeMap 按 name 映射；
 * - 菜单 meta 和 routeMap meta 会合并，routeMap 里的前端配置优先级更高。
 */
export function generateDynamicRoutes({ menus }: { menus: MenuItem[] }): RouteRecordRaw[] {
  const routes: RouteRecordRaw[] = [];

  // Vue Router 的 addRoute(parentName, route) 接收的是扁平子路由。
  // 因此这里遍历菜单树时，把目录和页面都 push 到同一个 routes 数组里。
  function traverse(menuList: MenuItem[], parentPath = '') {
    for (const menu of menuList) {
      const mapItem = routeMap[menu.name];
      const hasChildren = Array.isArray(menu.children) && menu.children.length > 0;

      const meta: RouteRecordRaw['meta'] = {
        title: menu.title,
        icon: menu.icon,
        order: menu.order,
        hideInMenu: menu.hideInMenu,
        ...mapItem?.meta,
      };

      const routePath = resolveRoutePath({ menu, mapPath: mapItem?.path, parentPath });

      if (hasChildren) {
        // 目录菜单没有 component，进入目录时默认跳到第一个可见子菜单。
        // 如果所有子菜单都隐藏，则兜底跳第一个子菜单，避免 redirect 为空。
        routes.push({
          path: routePath,
          name: menu.name,
          meta,
          redirect: { name: findFirstVisibleChild({ children: menu.children! }) },
        });

        traverse(menu.children!, routePath);
      } else {
        // 页面菜单必须绑定 component。
        // 未在 routeMap 中配置时使用 403，提醒“菜单有了，但页面映射还没接”。
        routes.push({
          path: routePath,
          name: menu.name,
          meta,
          component: mapItem?.component ?? ForbiddenComponent,
        });
      }
    }
  }

  traverse(menus);
  return routes;
}

/**
 * 解析最终注册给 Vue Router 的相对路径。
 *
 * 优先级：
 * 1. routeMap.path：前端显式声明的真实页面路径；
 * 2. menu.path：后端显式下发路径；
 * 3. menu.name 自动转 kebab-case，并结合父路径推导。
 *
 * 返回值会去掉首尾斜杠，因为这些路由是作为 RootLayout 子路由注册的。
 */
function resolveRoutePath({
  menu,
  mapPath,
  parentPath,
}: {
  menu: MenuItem;
  mapPath?: string;
  parentPath: string;
}) {
  const configuredPath = mapPath ?? menu.path;

  if (configuredPath) {
    return trimSlashes(configuredPath);
  }

  const parentSegments = parentPath ? parentPath.split('/') : [];
  const currentSegment = toKebabCase(menu.name);
  const relativeSegment = removeParentPrefix({ value: currentSegment, parentSegments });

  return [...parentSegments, relativeSegment].filter(Boolean).join('/');
}

/**
 * 从自动生成的子路径片段中移除父级前缀。
 *
 * 例如父路径是 dashboard，子菜单 name 是 DashboardWorkbench：
 * - name 转换后得到 dashboard-workbench；
 * - 去掉父级 dashboard- 后，子路径只保留 workbench；
 * - 最终拼成 dashboard/workbench。
 */
function removeParentPrefix({
  value,
  parentSegments,
}: {
  value: string;
  parentSegments: string[];
}) {
  for (let length = parentSegments.length; length > 0; length -= 1) {
    const prefix = parentSegments.slice(-length).join('-');
    const prefixWithSeparator = `${prefix}-`;

    if (value.startsWith(prefixWithSeparator)) {
      return value.slice(prefixWithSeparator.length);
    }
  }

  return value;
}

/** 去掉首尾斜杠，保证 addRoute 到 RootLayout 下时是相对路径。 */
function trimSlashes(path: string) {
  return path.replace(/^\/+|\/+$/g, '');
}

/** 把菜单 name 转为路径友好的 kebab-case。 */
function toKebabCase(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase();
}

/** 找到父级菜单默认跳转的第一个可见子菜单。 */
function findFirstVisibleChild({ children }: { children: MenuItem[] }): string {
  const visible = children.find((c) => !c.hideInMenu);
  return visible?.name ?? children[0]!.name;
}
