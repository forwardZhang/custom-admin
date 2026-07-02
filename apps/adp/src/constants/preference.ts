export type LayoutMode = 'vertical' | 'horizontal' | 'mix';

/** 深度 Partial 辅助类型 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export interface Preference {
  /** 主题配置 */
  theme: {
    /** 主要颜色 */
    primaryColor: string;
  };
  /** 布局配置 */
  layout: {
    /** 布局模式 */
    mode: LayoutMode;
  };
}
export const APP_PREFERENCE_KEY = 'app-preference';

/** 默认偏好配置 */
export const defaultPreference: Preference = {
  theme: {
    primaryColor: '#10b981',
  },
  layout: {
    mode: 'vertical',
  },
};
