import { cloneDeep, get, set } from 'lodash-es';

import { resolveFormPath } from './path';

import type { DeepPartial, DynamicFormSchema, FormData, FormPath } from '../types';

/** 深拷贝 schema，隔离调用方配置与运行时动态修改。 */
export function cloneSchema<T extends FormData>(
  schema: DynamicFormSchema<T>,
): DynamicFormSchema<T> {
  return cloneDeep(schema);
}

/** 仅为空值字段应用 schema.defaultValue，显式传入的初始值优先。 */
export function applySchemaDefaults<T extends FormData>(
  values: DeepPartial<T> | T | undefined,
  schema: DynamicFormSchema<T>,
): T {
  const result = cloneDeep(values ?? {}) as T;
  applyFieldDefaults(result, schema, []);
  return result;
}

/** 递归处理 List 子 schema，使嵌套字段的 defaultValue 与顶层字段行为一致。 */
function applyFieldDefaults<T extends FormData>(
  result: T,
  schema: DynamicFormSchema<T>,
  basePath: FormPath,
): void {
  for (const field of schema) {
    const path = resolveFormPath(basePath, field.fieldName);
    if (field.defaultValue !== undefined && get(result, path) === undefined) {
      set(result, path, cloneDeep(field.defaultValue));
    }

    if (field.component !== 'list') continue;
    const rows = get(result, path);
    if (!Array.isArray(rows)) continue;
    rows.forEach((_row, index) => applyFieldDefaults(result, field.schema, [...path, index]));
  }
}
