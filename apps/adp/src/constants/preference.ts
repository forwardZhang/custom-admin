export const layoutModes = ['vertical', 'vertical-top', 'two-column', 'top'] as const;

export type LayoutMode = (typeof layoutModes)[number];

/** 深度 Partial 辅助类型 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export interface Preference {
  /** 主题配置 */
  theme: {
    /** 主要颜色 */
    colorPrimary: string;
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
    colorPrimary: '#1677ff',
  },
  layout: {
    mode: 'vertical',
  },
};

/** 预设主题色 */
export const themeColors: Array<{ label: string; value: string }> = [
  { label: '默认', value: '#006be6' },
  { label: '紫罗兰', value: '#7166f0' },
  { label: '樱花粉', value: '#e84a6c' },
  { label: '橙黄色', value: '#fa8c16' },
  { label: '天蓝色', value: '#4e69fd' },
  { label: '深色绿', value: '#0d9496' },
  { label: '锌色灰', value: '#5f646d' },
  { label: '玫瑰红', value: '#f5222d' },
];
