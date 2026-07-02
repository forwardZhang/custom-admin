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

/** 用户信息（profile / login 返回） */
export interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  roles: string[];
  /** 按钮级权限码（可选，部分后端不返回） */
  buttons?: string[];
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
