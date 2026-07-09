import type { RouteRecordRaw } from 'vue-router';
import Layout from '@/layouts/index.vue';
import { ROUTE_NAME_LOGIN, ROUTE_NAME_NOT_FOUND, ROUTE_NAME_ROOT } from '@/constants/route';

export const constantRoutes: RouteRecordRaw[] = [
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
    /** 布局容器：业务子路由由动态路由模块通过 addRoute 挂入 */
    path: '/',
    name: ROUTE_NAME_ROOT,
    component: Layout,
    children: [],
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
