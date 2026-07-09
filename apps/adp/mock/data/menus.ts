/**
 * Mock 菜单数据
 *
 * 模拟后端根据用户角色/权限返回的菜单树。
 * 仅提供菜单结构（name / path / title / icon / children），
 * 组件映射和 meta 由前端 route-map.ts 维护。
 */

export const mockMenus: any[] = [
  {
    name: 'Dashboard',
    title: '工作台',
    icon: 'DashboardOutlined',
    path: '/dashboard',
    order: 1,
    children: [
      {
        name: 'DashboardWorkbench',
        title: '工作台',
        icon: 'HomeOutlined',
        order: 1,
        path: '/dashboard/workbench',
      },
      {
        name: 'DashboardAnalysis',
        title: '分析页',
        icon: 'LineChartOutlined',
        order: 2,
        path: '/dashboard/analysis',
      },
    ],
  },
  {
    name: 'Demo',
    title: '演示',
    icon: 'DemoOutlined',
    order: 2,
    path: '/demo',
    children: [
      {
        name: 'DemoScrollbar',
        title: 'Scrollbar Demo',
        icon: 'ScrollOutlined',
        order: 1,
        path: '/demo/scroll',
      },
    ],
  },
  {
    name: 'System',
    title: '系统管理',
    icon: 'SettingOutlined',
    path: '/system',
    order: 2,
    children: [
      {
        name: 'SystemUser',
        title: '用户管理',
        icon: 'UserOutlined',
        order: 1,
        path: '/system/user',
      },
      {
        name: 'SystemRole',
        title: '角色管理',
        icon: 'TeamOutlined',
        order: 2,
        path: '/system/role',
      },
      {
        name: 'SystemMenu',
        title: '菜单管理',
        icon: 'MenuOutlined',
        order: 3,
        path: '/system/menu',
      },
      {
        name: 'SystemDept',
        title: '部门管理',
        icon: 'ApartmentOutlined',
        order: 4,
        path: '/system/dept',
      },
      {
        name: 'SystemDeptAdd',
        title: '添加部门',
        icon: 'ApartmentOutlined',
        order: 5,
        hideInMenu: true,
        path: '/system/dept/add',
      },
    ],
  },
  {
    name: 'Monitor',
    title: '系统监控',
    icon: 'MonitorOutlined',
    path: '/monitor',
    order: 3,
    children: [
      {
        name: 'MonitorServer',
        title: '服务监控',
        icon: 'CloudServerOutlined',
        order: 1,
        path: '/monitor/server',
      },
      {
        name: 'MonitorOnline',
        title: '在线用户',
        icon: 'UsergroupAddOutlined',
        order: 2,
        path: '/monitor/online',
      },
      {
        name: 'MonitorLog',
        title: '操作日志',
        icon: 'FileTextOutlined',
        order: 3,
        path: '/monitor/log',
      },
    ],
  },
  {
    name: 'About',
    title: '关于',
    icon: 'InfoCircleOutlined',
    order: 99,
    path: '/about',
  },
];
