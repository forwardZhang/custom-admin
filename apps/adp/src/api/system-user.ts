import { request } from '@/utils/request';

export type SystemUserStatus = 'enabled' | 'disabled';

export interface SystemUser extends Record<string, unknown> {
  id: number;
  username: string;
  nickname: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  status: SystemUserStatus;
  remark: string;
  createdAt: string;
}

export interface SystemUserFormValue {
  username: string;
  nickname: string;
  password?: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  status: SystemUserStatus;
  remark: string;
}

export interface SystemUserQuery extends Record<string, unknown> {
  keyword?: string;
  department?: string;
  role?: string;
  status?: SystemUserStatus;
}

export interface SystemUserPageParams extends SystemUserQuery {
  current: number;
  pageSize: number;
  sorterField?: string;
  sorterOrder?: 'ascend' | 'descend';
}

/** 分页接口返回结构，与 DynamicTable 的 request 契约保持一致。 */
export interface SystemUserPageResult {
  list: SystemUser[];
  total: number;
}

export function getSystemUserPageApi(
  params: SystemUserPageParams,
  signal?: AbortSignal,
): Promise<SystemUserPageResult> {
  return request.get<SystemUserPageResult>('/system/users', params, { signal });
}

export function createSystemUserApi(data: SystemUserFormValue): Promise<SystemUser> {
  return request.post<SystemUser>('/system/users/create', data);
}

export function updateSystemUserApi(params: {
  id: number;
  data: SystemUserFormValue;
}): Promise<SystemUser> {
  return request.post<SystemUser>('/system/users/update', params);
}

export function deleteSystemUsersApi(ids: number[]): Promise<null> {
  return request.post<null>('/system/users/delete', { ids });
}
