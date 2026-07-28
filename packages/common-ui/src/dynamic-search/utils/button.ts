import { omit } from 'lodash-es';

import type { DynamicFormButtonOptions } from '../../dynamic-form';

const CONTROLLED_BUTTON_PROPS = ['content', 'show', 'type', 'htmlType'] as const;

/** 搜索组件接管按钮文案、显隐、类型和原生行为，其余 Antdv Button 属性继续透传。 */
export function resolveButtonProps(
  options?: DynamicFormButtonOptions,
): Omit<DynamicFormButtonOptions, (typeof CONTROLLED_BUTTON_PROPS)[number]> {
  return omit(options ?? {}, CONTROLLED_BUTTON_PROPS);
}
