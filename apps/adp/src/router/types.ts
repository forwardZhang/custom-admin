import type { RouteRecordRaw } from 'vue-router';

export type LayoutType = 'vertical' | 'horizontal' | 'mixed';

export interface AppRouteMeta {
  title: string;
  icon?: string;
  layout?: LayoutType;
  hideInMenu?: boolean;
  order?: number;
}

export type AppRouteRecord = RouteRecordRaw & {
  meta?: AppRouteMeta;
  children?: AppRouteRecord[];
};
