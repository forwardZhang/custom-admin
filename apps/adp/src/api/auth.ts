import { request } from '@package/request';
import type { ApiResponse } from '@package/request';

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
  userInfo: any;
}

/** 用户登录 */
export function loginApi(params: LoginParams): Promise<ApiResponse<LoginResult>> {
  return request({
    url: '/auth/login',
    method: 'POST',
    data: params,
  });
}

/** 退出登录 */
export function logoutApi(): Promise<ApiResponse<null>> {
  return request({
    url: '/auth/logout',
    method: 'POST',
  });
}

/** 获取用户信息 */
export function getProfileApi(): Promise<ApiResponse<any>> {
  return request({
    url: '/user/profile',
    method: 'GET',
  });
}
