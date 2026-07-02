import { request } from '@package/request';
import type { ApiResponse } from '@package/request';

export interface DashboardOverview {
  userCount: number;
  orderCount: number;
  revenue: number;
  conversionRate: number;
}

/** 获取仪表盘概览数据 */
export function getDashboardOverviewApi(): Promise<ApiResponse<DashboardOverview>> {
  return request({
    url: '/dashboard/overview',
    method: 'GET',
  });
}
