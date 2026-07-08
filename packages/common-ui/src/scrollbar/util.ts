import type { CSSProperties } from 'vue';

/** top 2 + bottom 2 of bar instance */
export const GAP = 4;

export const BAR_MAP = {
  vertical: {
    offset: 'offsetHeight',
    scroll: 'scrollTop',
    scrollSize: 'scrollHeight',
    size: 'height',
    key: 'vertical',
    axis: 'Y',
    client: 'clientY',
    direction: 'top',
  },
  horizontal: {
    offset: 'offsetWidth',
    scroll: 'scrollLeft',
    scrollSize: 'scrollWidth',
    size: 'width',
    key: 'horizontal',
    axis: 'X',
    client: 'clientX',
    direction: 'left',
  },
} as const;

export type BarMap = (typeof BAR_MAP)[keyof typeof BAR_MAP];

export function renderThumbStyle({
  move,
  size,
  bar,
}: {
  move?: number;
  size?: string;
  bar: BarMap;
}): CSSProperties {
  return {
    [bar.size]: size,
    transform: `translate${bar.axis}(${move}%)`,
  } as CSSProperties;
}

// ── 辅助函数（替代 @element-plus/utils）──

export function isNumber(val: unknown): val is number {
  return typeof val === 'number' && !Number.isNaN(val);
}

export function addUnit(value?: string | number): string | undefined {
  if (value == null || value === '') return undefined;
  if (isNumber(value)) return `${value}px`;
  return String(value);
}

export function isGreaterThan(a: number, b: number): boolean {
  return a > b;
}
