import { cloneDeep, get, set } from 'lodash-es';

import { resolveFormPath } from './path';

import type {
  DeepPartial,
  DynamicFormFieldSchema,
  DynamicFormSchema,
  FormData,
  FormPath,
} from '../types';

/**
 * 逐字段浅拷贝 schema，嵌套 List 的子 schema 递归处理。
 *
 * 这里刻意不做深拷贝：schema 上挂着 Vue 组件（component、listOptions.layout）和解析函数，
 * 而组件定义本身是普通对象，深拷贝会把它复制成另一个「组件」——
 * 身份一变，调用方把结果喂回渲染就会触发重新挂载，而且要连组件内部结构一起复制。
 * 浅拷贝足以隔离字段级改动（增删字段、改 label），组件与函数按引用透传。
 */
export function cloneSchema<T extends FormData>(
  schema: DynamicFormSchema<T>,
): DynamicFormSchema<T> {
  return schema.map((field) => {
    const next = { ...field } as DynamicFormFieldSchema<T>;
    if (next.component === 'list') next.schema = cloneSchema(next.schema);
    return next;
  });
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
