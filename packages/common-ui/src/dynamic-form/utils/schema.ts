import { cloneDeep, get, set } from 'lodash-es';

import { normalizePath, pathToString } from './path';

import type { DeepPartial, DynamicFormFieldSchema, DynamicFormSchema, FormData } from '../types';

/** 深拷贝 schema，隔离调用方配置与运行时动态修改。 */
export function cloneSchema<T extends FormData>(
  schema: DynamicFormSchema<T>,
): DynamicFormSchema<T> {
  return cloneDeep(schema);
}

/** 仅为空值字段应用 schema.defaultValue，显式传入的初始值优先。 */
export function applySchemaDefaults<T extends FormData>(
  values: DeepPartial<T> | undefined,
  schema: DynamicFormSchema<T>,
): T {
  const result = cloneDeep((values ?? {}) as T);
  for (const field of schema) {
    if (field.defaultValue === undefined) continue;
    const path = normalizePath(field.fieldName);
    if (get(result, path) === undefined) set(result, path, cloneDeep(field.defaultValue));
  }
  return result;
}

/** 按规范化字段路径批量浅合并 schema，未命中的字段保持原顺序。 */
export function patchSchema<T extends FormData>(
  schema: DynamicFormSchema<T>,
  patches: Array<
    Partial<DynamicFormFieldSchema<T>> & { fieldName: string | readonly (string | number)[] }
  >,
): DynamicFormSchema<T> {
  const patchMap = new Map(patches.map((patch) => [pathToString(patch.fieldName), patch]));
  return schema.map((field) => {
    const patch = patchMap.get(pathToString(field.fieldName));
    return patch ? ({ ...field, ...cloneDeep(patch) } as DynamicFormFieldSchema<T>) : field;
  });
}
