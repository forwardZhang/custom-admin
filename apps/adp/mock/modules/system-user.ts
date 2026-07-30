import type { MockRoute } from '../types.ts';
import { fail, success } from '../utils/response.ts';

type UserStatus = 'enabled' | 'disabled';

interface UserRecord {
  id: number;
  username: string;
  nickname: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  status: UserStatus;
  remark: string;
  createdAt: string;
}

const departments = ['产品研发部', '数据平台部', '市场运营部', '客户成功部'];
const roles = ['超级管理员', '系统管理员', '业务运营', '普通用户'];
const surnames = ['张', '李', '王', '赵', '陈', '林', '周', '吴'];
const givenNames = ['明', '宁', '一航', '若溪', '子墨', '思远'];

let users = Array.from({ length: 38 }, (_, index): UserRecord => {
  const id = index + 1;
  const nickname = `${surnames[index % surnames.length]}${givenNames[index % givenNames.length]}`;
  return {
    id,
    username: id === 1 ? 'admin' : `user${String(id).padStart(2, '0')}`,
    nickname: id === 1 ? '系统管理员' : nickname,
    email: id === 1 ? 'admin@example.com' : `user${id}@example.com`,
    phone: `138${String(10000000 + id * 317).slice(-8)}`,
    department: departments[index % departments.length]!,
    role: id === 1 ? '超级管理员' : roles[index % roles.length]!,
    status: index % 7 === 0 && id !== 1 ? 'disabled' : 'enabled',
    remark: id === 1 ? '系统内置账号，不允许删除' : '',
    createdAt: `2026-${String((index % 6) + 1).padStart(2, '0')}-${String((index % 27) + 1).padStart(2, '0')} 09:30`,
  };
});

function delay(duration = 220): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

function getPositiveInteger(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function readText(body: Record<string, unknown>, key: string): string {
  return String(body[key] ?? '').trim();
}

function isStatus(value: unknown): value is UserStatus {
  return value === 'enabled' || value === 'disabled';
}

function toUserInput(body: Record<string, unknown>) {
  return {
    username: readText(body, 'username'),
    nickname: readText(body, 'nickname'),
    email: readText(body, 'email'),
    phone: readText(body, 'phone'),
    department: readText(body, 'department'),
    role: readText(body, 'role'),
    status: isStatus(body.status) ? body.status : ('enabled' as const),
    remark: readText(body, 'remark'),
  };
}

function sortUsers(list: UserRecord[], field: string | null, order: string | null): UserRecord[] {
  if (!field || !order || !['username', 'nickname', 'createdAt'].includes(field)) return list;

  const direction = order === 'descend' ? -1 : 1;
  return [...list].sort((left, right) => {
    const leftValue = String(left[field as keyof UserRecord]);
    const rightValue = String(right[field as keyof UserRecord]);
    return leftValue.localeCompare(rightValue, 'zh-CN') * direction;
  });
}

export const systemUserMockRoutes: MockRoute[] = [
  {
    method: 'GET',
    url: '/api/system/users',
    async handler({ req }) {
      const url = new URL(req.url ?? '', 'http://localhost');
      const current = getPositiveInteger(url.searchParams.get('current'), 1);
      const pageSize = getPositiveInteger(url.searchParams.get('pageSize'), 10);
      const keyword = url.searchParams.get('keyword')?.trim().toLowerCase();
      const department = url.searchParams.get('department');
      const role = url.searchParams.get('role');
      const status = url.searchParams.get('status');

      // 查询、筛选与排序全部在 mock 服务端完成，保持与真实分页接口一致。
      let filteredUsers = users.filter((user) => {
        const matchesKeyword =
          !keyword ||
          user.username.toLowerCase().includes(keyword) ||
          user.nickname.toLowerCase().includes(keyword) ||
          user.email.toLowerCase().includes(keyword) ||
          user.phone.includes(keyword);
        return (
          matchesKeyword &&
          (!department || user.department === department) &&
          (!role || user.role === role) &&
          (!status || user.status === status)
        );
      });

      filteredUsers = sortUsers(
        filteredUsers,
        url.searchParams.get('sorterField'),
        url.searchParams.get('sorterOrder'),
      );

      const total = filteredUsers.length;
      const start = (current - 1) * pageSize;
      await delay();
      return success({
        data: {
          list: filteredUsers.slice(start, start + pageSize),
          total,
        },
      });
    },
  },
  {
    method: 'POST',
    url: '/api/system/users/create',
    async handler({ body, res }) {
      const input = toUserInput(body);
      if (!input.username || !input.nickname) {
        res.statusCode = 400;
        return fail('用户名和用户姓名不能为空', 400);
      }
      if (users.some((user) => user.username === input.username)) {
        res.statusCode = 409;
        return fail('用户名已存在', 409);
      }

      const nextId = Math.max(0, ...users.map((user) => user.id)) + 1;
      const user: UserRecord = {
        ...input,
        id: nextId,
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      };
      users.unshift(user);
      await delay(300);
      return success(user);
    },
  },
  {
    method: 'POST',
    url: '/api/system/users/update',
    async handler({ body, res }) {
      const id = Number(body.id);
      const index = users.findIndex((user) => user.id === id);
      const data = body.data;
      if (index < 0 || !data || typeof data !== 'object' || Array.isArray(data)) {
        res.statusCode = 404;
        return fail('用户不存在', 404);
      }

      const input = toUserInput(data as Record<string, unknown>);
      if (users.some((user) => user.id !== id && user.username === input.username)) {
        res.statusCode = 409;
        return fail('用户名已存在', 409);
      }

      users[index] = { ...users[index]!, ...input };
      await delay(300);
      return success(users[index]!);
    },
  },
  {
    method: 'POST',
    url: '/api/system/users/delete',
    async handler({ body, res }) {
      const ids = Array.isArray(body.ids)
        ? body.ids.filter((id): id is number => typeof id === 'number')
        : [];
      if (ids.includes(1)) {
        res.statusCode = 400;
        return fail('系统内置账号不能删除', 400);
      }

      const idSet = new Set(ids);
      users = users.filter((user) => !idSet.has(user.id));
      await delay(260);
      return success(null);
    },
  },
];
