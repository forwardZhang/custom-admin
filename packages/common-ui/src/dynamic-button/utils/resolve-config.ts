import type { VNodeChild } from 'vue';

import type { DynamicButtonConfig, DynamicButtonRecordContext } from '../types';

/**
 * 解析按钮文案。
 * 动态函数统一接收对象参数，后续增加 index 等字段时不会破坏调用签名。
 */
export function resolveDynamicButtonLabel<TRecord, TValue>(
  label: DynamicButtonConfig<TRecord, TValue>['label'],
  record: TRecord | undefined,
): VNodeChild {
  return typeof label === 'function' ? label({ record }) : label;
}

/** 根据当前 record 解析业务禁用状态。 */
export function resolveDynamicButtonDisabled<TRecord, TValue>(
  disabled: DynamicButtonConfig<TRecord, TValue>['disabled'],
  record: TRecord | undefined,
): boolean {
  const context: DynamicButtonRecordContext<TRecord> = { record };

  return typeof disabled === 'function' ? disabled(context) : Boolean(disabled);
}
