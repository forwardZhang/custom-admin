import { request } from '@package/request';
import type { ApiResponse } from '@package/request';
import type { UserInfo } from '@package/shared';

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
  userInfo: UserInfo;
}

/** 用户登录 */
export function loginApi(params: LoginParams): Promise<ApiResponse<LoginResult>> {
  return request({
    url: '/api/auth/login',
    method: 'POST',
    data: params,
  });
}

/** 退出登录 */
export function logoutApi(): Promise<ApiResponse<null>> {
  return request({
    url: '/api/auth/logout',
    method: 'POST',
  });
}

/** 获取用户信息 */
export function getProfileApi(): Promise<ApiResponse<UserInfo>> {
  return request({
    url: '/api/user/profile',
    method: 'GET',
  });
}
