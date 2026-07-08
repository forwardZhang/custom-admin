import type { StyleValue } from 'vue';
import type Scrollbar from './scrollbar.vue';

export type ScrollbarDirection = 'top' | 'bottom' | 'left' | 'right';

export interface ScrollbarProps {
  /** 滚动区域高度 */
  height?: string | number;
  /** 滚动区域最大高度 */
  maxHeight?: string | number;
  /** 是否使用原生滚动条 */
  native?: boolean;
  /** wrap 的自定义 style */
  wrapStyle?: StyleValue;
  /** wrap 的自定义 class */
  wrapClass?: string | string[];
  /** view 的自定义 class */
  viewClass?: string | string[];
  /** view 的自定义 style */
  viewStyle?: StyleValue;
  /** 不响应容器尺寸变化，尺寸不变时开启可优化性能 */
  noresize?: boolean;
  /** view 的标签名 */
  tag?: string;
  /** 始终显示滚动条 */
  always?: boolean;
  /** 滚动条最小尺寸 (px) */
  minSize?: number;
  /** wrap 的 tabindex */
  tabindex?: string | number;
  /** view 的 id */
  id?: string;
  /** view 的 role */
  role?: string;
  /** view 的 aria-label */
  ariaLabel?: string;
  /** view 的 aria-orientation */
  ariaOrientation?: 'horizontal' | 'vertical' | 'undefined';
  /** 触发 end-reached 的距离 (px) */
  distance?: number;
}

export type ScrollbarEmits = {
  /** 滚动时触发 */
  scroll: [payload: { scrollTop: number; scrollLeft: number }];
  /** 滚动到边缘时触发 */
  'end-reached': [direction: ScrollbarDirection];
};

export interface BarInstance {
  handleScroll: (wrap: HTMLDivElement) => void;
  update: () => void;
}

export type ScrollbarInstance = InstanceType<typeof Scrollbar>;
