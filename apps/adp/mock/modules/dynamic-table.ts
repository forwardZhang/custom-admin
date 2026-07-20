import type { MockRoute } from '../types.ts';
import { success } from '../utils/response.ts';

type UserStatus = 'active' | 'disabled';

interface UserRecord {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  status: UserStatus;
  createdAt: string;
}

const departments = ['产品研发', '数据平台', '客户成功', '市场运营'];
const roles = ['前端工程师', '后端工程师', '产品经理', '数据分析师'];

let users = Array.from({ length: 47 }, (_, index): UserRecord => {
  const id = index + 1;
  return {
    id,
    name: `用户 ${String(id).padStart(2, '0')}`,
    email: `user${id}@example.com`,
    department: departments[index % departments.length]!,
    role: roles[index % roles.length]!,
    status: index % 5 === 0 ? 'disabled' : 'active',
    createdAt: `2026-${String((index % 6) + 1).padStart(2, '0')}-${String((index % 27) + 1).padStart(2, '0')}`,
  };
});

function delay(duration: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

function getPositiveInteger(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function sortUsers(list: UserRecord[], field: string | null, order: string | null): UserRecord[] {
  if (!field || !order || !['id', 'name', 'createdAt'].includes(field)) return list;

  const direction = order === 'descend' ? -1 : 1;
  return [...list].sort((left, right) => {
    if (field === 'id') return (left.id - right.id) * direction;
    const leftValue = String(left[field as keyof UserRecord]);
    const rightValue = String(right[field as keyof UserRecord]);
    return leftValue.localeCompare(rightValue, 'zh-CN') * direction;
  });
}

export const dynamicTableMockRoutes: MockRoute[] = [
  {
    method: 'GET',
    url: '/api/dynamic-table/users',
    async handler({ req }) {
      const url = new URL(req.url ?? '', 'http://localhost');
      const current = getPositiveInteger(url.searchParams.get('current'), 1);
      const pageSize = getPositiveInteger(url.searchParams.get('pageSize'), 10);
      const keyword = url.searchParams.get('keyword')?.trim().toLowerCase();
      const status = url.searchParams.get('status');

      let filteredUsers = users.filter((user) => {
        const matchesKeyword =
          !keyword ||
          user.name.toLowerCase().includes(keyword) ||
          user.email.toLowerCase().includes(keyword) ||
          user.department.toLowerCase().includes(keyword);
        const matchesStatus = !status || user.status === status;
        return matchesKeyword && matchesStatus;
      });

      filteredUsers = sortUsers(
        filteredUsers,
        url.searchParams.get('sorterField'),
        url.searchParams.get('sorterOrder'),
      );

      const total = filteredUsers.length;
      const start = (current - 1) * pageSize;
      await delay(current % 2 === 0 ? 520 : 260);

      return success({
        data: {
          list: filteredUsers.slice(start, start + pageSize),
          total,
        },
      });
    },
  },
  {
    method: 'GET',
    url: '/api/dynamic-table/users/all',
    async handler() {
      await delay(280);
      return success(users.slice(0, 18));
    },
  },
  {
    method: 'POST',
    url: '/api/dynamic-table/users/disable',
    async handler({ body }) {
      const ids = Array.isArray(body.ids)
        ? body.ids.filter((id): id is number => typeof id === 'number')
        : [];
      const idSet = new Set(ids);
      users = users.map((user) =>
        idSet.has(user.id) ? { ...user, status: 'disabled' as const } : user,
      );
      await delay(180);
      return success(null);
    },
  },
];
