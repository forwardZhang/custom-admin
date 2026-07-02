import type { MockRoute } from '../types.ts';
import { fail, success } from '../utils/response.ts';

export const authMockRoutes: MockRoute[] = [
  {
    method: 'POST',
    url: '/api/auth/login',
    handler: ({ body }) => {
      const username = String(body.username ?? 'admin');

      if (!username.trim()) {
        return fail('用户名不能为空', 400);
      }

      return success({
        token: 'mock-token-admin',
        userInfo: {
          id: 1,
          username,
          nickname: 'Admin',
          roles: ['admin'],
        },
      });
    },
  },
  {
    method: 'POST',
    url: '/api/auth/logout',
    handler: () => success(true),
  },
];
