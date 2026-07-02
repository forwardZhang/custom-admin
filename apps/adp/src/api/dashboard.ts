import { request } from '@/utils/request';

export interface DashboardOverview {
  userCount: number;
  orderCount: number;
  revenue: number;
  conversionRate: number;
}

/**
 * 获取仪表盘概览数据
 *
 * 请求层已解包：成功时直接返回 `DashboardOverview`，
 * 失败时 reject `RequestError`，调用方 try/catch 即可。
 */
export function getDashboardOverviewApi(): Promise<DashboardOverview> {
  return request.get<DashboardOverview>('/dashboard/overview');
}
