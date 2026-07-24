import { get, isObject } from 'lodash-es';

import { pathToString } from './path';

import type { DynamicFormOptionRequest, DynamicFormOptionRequestApi, FormData } from '../types';

type OptionRecord = Record<string, unknown>;

/** 从数组响应或 resultField 指定路径提取选项数组。 */
export function extractOptions(response: unknown, resultField: string): unknown[] {
  const source = Array.isArray(response)
    ? response
    : isObject(response)
      ? get(response, resultField)
      : undefined;

  if (!Array.isArray(source)) {
    throw new TypeError(`[DynamicForm] Option request result "${resultField}" must be an array`);
  }
  return source;
}

/**
 * 将接口字段映射为 label/value/disabled/children。
 * children 递归处理，兼容 Cascader / TreeSelect。
 */
export function normalizeOptions<T extends FormData>(
  source: unknown[],
  config: DynamicFormOptionRequest<T>,
): unknown[] {
  const {
    labelField = 'label',
    valueField = 'value',
    childrenField = 'children',
    disabledField = 'disabled',
  } = config;

  return source.map((item) => {
    if (!isObject(item)) return { label: item, value: item };

    const record = item as OptionRecord;
    const children = get(record, childrenField);
    return {
      ...record,
      label: get(record, labelField),
      value: get(record, valueField),
      disabled: get(record, disabledField),
      ...(Array.isArray(children) ? { children: normalizeOptions(children, config) } : {}),
    };
  });
}

/** 优先字段自定义 onError，否则输出带字段路径的警告。 */
export function handleRequestError<T extends FormData>(
  error: unknown,
  config: DynamicFormOptionRequest<T>,
  api: DynamicFormOptionRequestApi<T>,
) {
  if (config.onError) return config.onError(error, api);
  console.warn(`[DynamicForm] Failed to load options for "${pathToString(api.field.path)}"`, error);
}
