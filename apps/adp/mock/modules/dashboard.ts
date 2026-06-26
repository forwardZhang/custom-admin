import type { MockRoute } from '../types.ts';
import { success } from '../utils/response.ts';

export const dashboardMockRoutes: MockRoute[] = [
  {
    method: 'GET',
    url: '/api/dashboard/overview',
    handler: () =>
      success({
        cards: [
          { label: '今日访问', value: 1280 },
          { label: '待办事项', value: 18 },
          { label: '运行服务', value: 6 },
        ],
      }),
  },
];
