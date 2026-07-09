/**
 * Mock 菜单数据
 *
 * 模拟后端根据用户角色/权限返回的菜单树。
 * 仅提供菜单结构（name / title / icon / children），
 * 组件映射和 meta 由前端 route-map.ts 维护。
 */

export const mockMenus: any[] = [
  {
    name: 'Dashboard',
    title: '仪表盘',
    icon: 'DashboardOutlined',
    order: 1,
    children: [
      {
        name: 'DashboardWorkbench',
        title: '工作台',
        icon: 'LineChartOutlined',
        order: 1,
      },
      {
        name: 'DashboardAnalysis',
        title: '分析页',
        icon: 'LineChartOutlined',
        order: 2,
      },
    ],
  },
  {
    name: 'Demo',
    title: '演示',
    icon: 'DemoOutlined',
    order: 2,
    children: [
      {
        name: 'DemoScrollbar',
        title: 'Scrollbar Demo',
        icon: 'ScrollOutlined',
        order: 1,
      },
    ],
  },
  {
    name: 'System',
    title: '系统管理',
    icon: 'SettingOutlined',
    order: 2,
    children: [
      {
        name: 'SystemUser',
        title: '用户管理',
        icon: 'UserOutlined',
        order: 1,
      },
      {
        name: 'SystemRole',
        title: '角色管理',
        icon: 'TeamOutlined',
        order: 2,
      },
      {
        name: 'SystemMenu',
        title: '菜单管理',
        icon: 'MenuOutlined',
        order: 3,
      },
      {
        name: 'SystemDept',
        title: '部门管理',
        icon: 'ApartmentOutlined',
        order: 4,
      },
      {
        name: 'SystemDeptAdd',
        title: '添加部门',
        icon: 'ApartmentOutlined',
        order: 5,
        hideInMenu: true,
      },
    ],
  },
  {
    name: 'Monitor',
    title: '系统监控',
    icon: 'MonitorOutlined',
    order: 3,
    children: [
      {
        name: 'MonitorServer',
        title: '服务监控',
        icon: 'CloudServerOutlined',
        order: 1,
      },
      {
        name: 'MonitorOnline',
        title: '在线用户',
        icon: 'UsergroupAddOutlined',
        order: 2,
      },
      {
        name: 'MonitorLog',
        title: '操作日志',
        icon: 'FileTextOutlined',
        order: 3,
      },
    ],
  },
  {
    name: 'About',
    title: '关于',
    icon: 'InfoCircleOutlined',
    order: 99,
  },
];
