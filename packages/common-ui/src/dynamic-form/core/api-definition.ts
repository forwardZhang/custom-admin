import type { ApiProxyDefinition } from '../../internal/use-api-proxy';

import type { DynamicFormApi, FormData } from '../types';

/**
 * DynamicFormApi 的成员清单，供 Hook 的 API 代理决定挂载前的行为。
 * 返回 Promise 的命令排队补发，读取类方法给出空值兜底，写入类方法在挂载前告警。
 * DynamicSearch 在此基础上追加自己的成员，保证两套 API 的挂载前语义一致。
 */
export function createFormApiDefinition<T extends FormData>(): ApiProxyDefinition<
  DynamicFormApi<T>
> {
  return {
    commands: ['validate', 'submit'],
    methods: [
      'getValues',
      'setValues',
      'getFieldValue',
      'setFieldValue',
      'resetFields',
      'clearValidate',
      'scrollToField',
      'getSchema',
      'getNativeInstance',
    ],
    properties: ['values'],
    fallbacks: {
      values: () => ({}),
      getValues: () => ({}),
      getFieldValue: () => undefined,
      getSchema: () => [],
      getNativeInstance: () => undefined,
    },
  };
}
