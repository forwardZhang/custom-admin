import { authMockRoutes } from './modules/auth.ts';
import { dashboardMockRoutes } from './modules/dashboard.ts';
import { dynamicFormMockRoutes } from './modules/dynamic-form.ts';
import { dynamicTableMockRoutes } from './modules/dynamic-table.ts';
import { userMockRoutes } from './modules/user.ts';

export const mockRoutes = [
  ...authMockRoutes,
  ...userMockRoutes,
  ...dashboardMockRoutes,
  ...dynamicFormMockRoutes,
  ...dynamicTableMockRoutes,
];
