import type { DynamicFormApi, DynamicFormFieldApi, DynamicFormFieldInfo, FormData } from '../types';

/** 表单级方法名单；字段作用域 API 与 Hook 的 API 代理共用，避免重复罗列。 */
export const FORM_API_METHODS = [
  'getValues',
  'setValues',
  'getFieldValue',
  'setFieldValue',
  'resetFields',
  'validate',
  'submit',
  'clearValidate',
  'scrollToField',
  'getSchema',
  'getNativeInstance',
] as const satisfies readonly (keyof DynamicFormApi)[];

/**
 * 在同一套表单 API 上附加字段 scope（当前值 + 字段元信息）。
 * 字段回调、options 请求、list 动作都复用它，不另造一套 API。
 */
export function createFieldApi<T extends FormData, TValue, TExtra extends object = object>(
  api: DynamicFormApi<T>,
  getScope: () => { field: DynamicFormFieldInfo; value: TValue },
  extra?: TExtra,
): DynamicFormFieldApi<T, TValue> & Readonly<TExtra> {
  const fieldApi: Partial<DynamicFormFieldApi<T, TValue>> = {};

  Object.defineProperties(fieldApi, {
    values: {
      enumerable: true,
      get: () => api.values,
    },
    value: {
      enumerable: true,
      get: () => getScope().value,
    },
    field: {
      enumerable: true,
      get: () => getScope().field,
    },
  });

  for (const method of FORM_API_METHODS) {
    fieldApi[method] = api[method] as never;
  }

  return Object.assign(fieldApi, extra) as DynamicFormFieldApi<T, TValue> & Readonly<TExtra>;
}
