import type { Component } from 'vue';
import {
  ApartmentOutlined,
  AuditOutlined,
  BarChartOutlined,
  CloudServerOutlined,
  DashboardOutlined,
  ExperimentOutlined,
  FileOutlined,
  FileTextOutlined,
  GiftOutlined,
  InfoCircleOutlined,
  LineChartOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  MonitorOutlined,
  OrderedListOutlined,
  ReloadOutlined,
  SettingOutlined,
  ShopOutlined,
  SlidersOutlined,
  TeamOutlined,
  UsergroupAddOutlined,
  UserOutlined,
} from '@antdv-next/icons';
import type { MenuItem } from '@/api/auth';

const iconRegistry: Record<string, Component> = {
  ApartmentOutlined,
  AuditOutlined,
  BarChartOutlined,
  CloudServerOutlined,
  DashboardOutlined,
  ExperimentOutlined,
  FileOutlined,
  FileTextOutlined,
  GiftOutlined,
  InfoCircleOutlined,
  LineChartOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  MonitorOutlined,
  OrderedListOutlined,
  ReloadOutlined,
  SettingOutlined,
  ShopOutlined,
  SlidersOutlined,
  TeamOutlined,
  UsergroupAddOutlined,
  UserOutlined,
};

/** 递归过滤隐藏菜单，同时移除已经没有可见子项的纯目录。 */
export function filterVisibleMenus(menuList: MenuItem[]): MenuItem[] {
  return menuList.reduce<MenuItem[]>((result, menu) => {
    if (menu.hideInMenu) return result;

    const children = menu.children ? filterVisibleMenus(menu.children) : undefined;
    if (menu.children?.length && !children?.length) return result;

    result.push({
      ...menu,
      children,
    });
    return result;
  }, []);
}

/** 查找目标菜单从一级菜单开始的完整路径。 */
export function findMenuTrail(menuList: MenuItem[], targetName: string): MenuItem[] {
  for (const menu of menuList) {
    if (menu.name === targetName) return [menu];

    const childTrail = menu.children?.length ? findMenuTrail(menu.children, targetName) : [];
    if (childTrail.length) return [menu, ...childTrail];
  }

  return [];
}

/** 获取菜单树中第一个可访问的叶子菜单。 */
export function findFirstLeaf(menu: MenuItem): MenuItem {
  const firstChild = menu.children?.[0];
  return firstChild ? findFirstLeaf(firstChild) : menu;
}

/** 根据后端下发的组件名获取 Antdv 图标组件。 */
export function getMenuIcon(iconName?: string): Component | undefined {
  return iconName ? iconRegistry[iconName] : undefined;
}
