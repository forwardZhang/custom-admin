import { isVNode } from 'vue';

import type { BuiltinComponentName } from '../types';

type Placeholder = string | [string, string];

const INPUT_COMPONENTS = new Set<BuiltinComponentName>(['text', 'textarea', 'number']);
const SELECT_COMPONENTS = new Set<BuiltinComponentName>([
  'select',
  'cascader',
  'treeSelect',
  'datePicker',
  'timePicker',
]);

/**
 * 根据字段控件类型和 label 生成默认 placeholder。
 * RangePicker 的两端文案固定，不依赖字段 label。
 */
export function getDefaultPlaceholder(
  component: BuiltinComponentName,
  label: unknown,
): Placeholder | undefined {
  if (component === 'rangePicker') {
    return ['请选择开始时间', '请选择结束时间'];
  }

  const labelText = getVNodeText(label).trim();
  if (!labelText) return undefined;

  if (INPUT_COMPONENTS.has(component)) return `请输入${labelText}`;
  if (SELECT_COMPONENTS.has(component)) return `请选择${labelText}`;

  return undefined;
}

/** 将 VNodeChild 中可见的文本递归提取为 placeholder 可用的纯文本。 */
function getVNodeText(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(getVNodeText).join('');
  if (!isVNode(value)) return '';

  return getVNodeText(value.children);
}
