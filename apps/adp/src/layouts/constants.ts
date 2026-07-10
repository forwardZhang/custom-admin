import type { LayoutMode } from '@/constants/preference';

export const LayoutModeMap = {
  vertical: 'vertical',
  verticalTop: 'vertical-top',
  twoColumn: 'two-column',
  top: 'top',
} as const;

export const LAYOUT_MODE_LIST = [
  { key: LayoutModeMap.vertical, label: '垂直' },
  { key: LayoutModeMap.verticalTop, label: '顶部垂直' },
  { key: LayoutModeMap.twoColumn, label: '双列布局' },
  { key: LayoutModeMap.top, label: '顶部' },
];

export type { LayoutMode };
