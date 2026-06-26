import type { MockRoute } from '../types.ts';
import { success } from '../utils/response.ts';

export const userMockRoutes: MockRoute[] = [
  {
    method: 'GET',
    url: '/api/user/profile',
    handler: () =>
      success({
        id: 1,
        username: 'admin',
        nickname: 'Admin',
        roles: ['admin'],
      }),
  },
];
