import { request } from '@/utils/request';

export interface LoginParams {
  username: string;
  password: string;
}

/** 登录接口返回的业务数据（已由请求层解包，无需再取 .data） */
export interface LoginResult {
  token: string;
  userInfo: UserInfo;
}

/**
 * 后端返回的菜单项
 *
 * 后端根据用户角色/权限下发的菜单树节点，
 * 前端通过 name 字段匹配本地路由映射表（route-map.ts）来生成动态路由。
 */
export interface MenuItem {
  /** 菜单唯一标识，与前端路由映射表的 key 一一对应 */
  name: string;
  /** 菜单显示标题 */
  title: string;
  /** 菜单图标（antdv icon 组件名） */
  icon?: string;
  /** 菜单对应的 URL 路径 (后端不再返回，改由前端 route-map 维护) */
  path?: string;
  /** 排序权重，越小越靠前 */
  order?: number;
  /** 是否在菜单中隐藏 */
  hideInMenu?: boolean;
  /** 子菜单 */
  children?: MenuItem[];
}

/** 用户信息（profile / login 返回） */
export interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  roles: string[];
  /** 按钮级权限码（可选，部分后端不返回） */
  buttons?: string[];
  /** 用户可访问的菜单树（由后端根据角色/权限动态返回） */
  menus?: MenuItem[];
}

/**
 * 用户登录
 *
 * 请求层已解包：成功时直接返回 `LoginResult`（含 token + userInfo），
 * 失败时 reject `RequestError`，调用方 try/catch 即可。
 */
export function loginApi(params: LoginParams): Promise<LoginResult> {
  return request.post<LoginResult>('/auth/login', params);
}

/** 退出登录 */
export function logoutApi(): Promise<null> {
  return request.post<null>('/auth/logout');
}

/** 获取用户信息 */
export function getProfileApi(): Promise<UserInfo> {
  return request.get<UserInfo>('/user/profile');
}
