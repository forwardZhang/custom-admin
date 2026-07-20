import { request } from '@/utils/request';

export type DynamicTableUserStatus = 'active' | 'disabled';

export interface DynamicTableUser {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  status: DynamicTableUserStatus;
  createdAt: string;
}

export interface DynamicTableUserQuery {
  [key: string]: unknown;
  current: number;
  pageSize: number;
  keyword?: string;
  status?: DynamicTableUserStatus;
  sorterField?: string;
  sorterOrder?: 'ascend' | 'descend';
}

export interface DynamicTableUserPageResult {
  data: {
    list: DynamicTableUser[];
    total: number;
  };
}

export function getDynamicTableUsersApi(
  params: DynamicTableUserQuery,
  signal?: AbortSignal,
): Promise<DynamicTableUserPageResult> {
  return request.get<DynamicTableUserPageResult>('/dynamic-table/users', params, { signal });
}

export function getDynamicTableUserListApi(signal?: AbortSignal): Promise<DynamicTableUser[]> {
  return request.get<DynamicTableUser[]>('/dynamic-table/users/all', undefined, { signal });
}

export function disableDynamicTableUsersApi(ids: number[]): Promise<null> {
  return request.post<null>('/dynamic-table/users/disable', { ids });
}
