import type { VNodeChild } from 'vue';

import type {
  DynamicButtonConfig,
  DynamicButtonRecord,
  DynamicButtonRecordContext,
} from '../types';

/**
 * 解析按钮文案。
 * 动态函数统一接收对象参数，后续增加 index 等字段时不会破坏调用签名。
 */
export function resolveDynamicButtonLabel(
  label: DynamicButtonConfig['label'],
  record: DynamicButtonRecord | undefined,
): VNodeChild {
  return typeof label === 'function' ? label({ record }) : label;
}

/** 根据当前 record 解析业务禁用状态。 */
export function resolveDynamicButtonDisabled(
  disabled: DynamicButtonConfig['disabled'],
  record: DynamicButtonRecord | undefined,
): boolean {
  const context: DynamicButtonRecordContext = { record };

  return typeof disabled === 'function' ? disabled(context) : Boolean(disabled);
}
