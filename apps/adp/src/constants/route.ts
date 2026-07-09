/**
 * 路由 name 常量
 *
 * 所有路由跳转统一引用此处常量，避免字面量散落各处导致改名漏改。
 * 与路由定义（`router/routes/constant-routes.ts`）中的 name 字段一一对应。
 */

/** 根布局路由（承载带 Layout 的业务子路由） */
export const ROUTE_NAME_ROOT = 'RootLayout';

/** 登录页路由 */
export const ROUTE_NAME_LOGIN = 'Login';

/** Dashboard 首页路由（登录成功 / 已登录访问登录页时的默认回跳目标） */
export const ROUTE_NAME_DASHBOARD = 'Dashboard';

/** 404 页面路由（权限不足 / 路由未匹配时的兜底跳转目标） */
export const ROUTE_NAME_NOT_FOUND = 'NotFound';

/** 403 页面路由（动态路由未匹配到有效组件时展示） */
export const ROUTE_NAME_FORBIDDEN = 'Forbidden';
