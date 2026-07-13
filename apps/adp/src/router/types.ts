import 'vue-router';

/**
 * 路由元数据类型扩展
 *
 * 通过 module augmentation 为 vue-router 的 RouteMeta 增加字段，
 * 参考 soybean-admin 的 typings/router.d.ts 设计，按当前项目实际需要裁剪。
 */
declare module 'vue-router' {
  interface RouteMeta {
    /** 路由标题（用于菜单、面包屑、文档标题） */
    title?: string;
    /** 是否为常量路由（免登录、免鉴权），如登录页、404 */
    constant?: boolean;
    /** 允许访问的角色编码列表；为空表示不限制角色 */
    roles?: string[];
    /** 是否在菜单中隐藏 */
    hideInMenu?: boolean;
    /** 菜单排序权重，越小越靠前 */
    order?: number;
    /** 菜单图标（图标库 class 或 svg 名称） */
    icon?: string;
    /** 外链地址；存在时点击菜单在新窗口打开 */
    href?: string;
    /** 进入该路由时高亮的菜单 key（用于详情页等不在菜单中的路由） */
    activeMenu?: string;
    /** 是否缓存该路由组件（组件 defineOptions.name 需与路由 name 保持一致） */
    keepAlive?: boolean;
  }
}

export {};
