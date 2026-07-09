import type { MockRoute } from '../types.ts';
import { fail, success } from '../utils/response.ts';
import { mockMenus } from '../data/menus.ts';

export const authMockRoutes: MockRoute[] = [
  {
    method: 'POST',
    url: '/api/auth/login',
    handler: ({ body, res }) => {
      const username = String(body.username ?? 'admin');
      const password = String(body.password ?? '');

      if (!username.trim()) {
        res.statusCode = 400;
        return fail('用户名不能为空', 400);
      }

      // 模拟 500 服务器错误
      if (username === 'server_error') {
        res.statusCode = 500;
        return fail('服务器内部发生未知错误', 500);
      }

      // 模拟 403 密码错误
      if (username === 'admin' && password !== '123456') {
        res.statusCode = 403;
        return fail('密码错误，请重新输入', 403);
      }

      return success({
        token: 'mock-token-admin',
        userInfo: {
          id: 1,
          username,
          nickname: 'Admin',
          menus: mockMenus,
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
