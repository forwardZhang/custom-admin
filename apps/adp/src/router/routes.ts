import type { RouteRecordRaw } from 'vue-router';
import Layout from '@/layouts/index.vue';

/**
 * 常量路由配置（无需登录权限即可访问）
 */
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: '登录',
      constant: true,
      hideInMenu: true,
    },
  },
  {
    path: '/',
    name: 'RootLayout',
    component: Layout,
    meta: {
      title: '首页',
    },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: {
          title: 'Dashboard',
          order: 1,
        },
      },
    ],
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/exception/404.vue'),
    meta: {
      title: '404',
      constant: true,
      hideInMenu: true,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
];
