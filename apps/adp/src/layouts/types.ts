export type LayoutType = 'vertical' | 'horizontal' | 'mixed';

export interface LayoutOption {
  type: LayoutType;
  label: string;
}

export const layoutOptions: LayoutOption[] = [
  { type: 'vertical', label: '垂直布局' },
  { type: 'horizontal', label: '水平布局' },
  { type: 'mixed', label: '混合布局' },
];
