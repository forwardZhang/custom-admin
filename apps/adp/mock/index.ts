import { authMockRoutes } from './modules/auth.ts';
import { dashboardMockRoutes } from './modules/dashboard.ts';
import { userMockRoutes } from './modules/user.ts';

export const mockRoutes = [...authMockRoutes, ...userMockRoutes, ...dashboardMockRoutes];
