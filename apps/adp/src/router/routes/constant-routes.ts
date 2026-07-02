import type { RouteRecordRaw } from 'vue-router';
import Layout from '@/layouts/index.vue';
import {
  ROUTE_NAME_DASHBOARD,
  ROUTE_NAME_LOGIN,
  ROUTE_NAME_NOT_FOUND,
  ROUTE_NAME_ROOT,
} from '@/constants/route';

/**
 * 常量路由配置（无需登录权限即可访问）
 *
 * meta.constant 标记的路由会被路由守卫视为白名单：
 * 免登录、免鉴权、免用户信息初始化（如登录页、404）。
 */
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: { name: ROUTE_NAME_DASHBOARD },
  },
  {
    path: '/login',
    name: ROUTE_NAME_LOGIN,
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: '登录',
      constant: true,
      hideInMenu: true,
    },
  },
  {
    path: '/',
    name: ROUTE_NAME_ROOT,
    component: Layout,
    meta: {
      title: '首页',
    },
    children: [
      {
        path: 'dashboard',
        name: ROUTE_NAME_DASHBOARD,
        component: () => import('@/views/dashboard/index.vue'),
        meta: {
          title: 'Dashboard',
          order: 1,
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: ROUTE_NAME_NOT_FOUND,
    component: () => import('@/views/exception/404.vue'),
    meta: {
      title: '404',
      constant: true,
      hideInMenu: true,
    },
  },
];
