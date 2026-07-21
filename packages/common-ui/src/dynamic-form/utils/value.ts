import { cloneDeep, get, isEqual, isPlainObject, mergeWith } from 'lodash-es';

import type { DeepPartial, FormData, FormPath } from '../types';

export function cloneValue<T>(value: T): T {
  return cloneDeep(value);
}

export function getValue<T extends FormData>(values: T, path: FormPath): unknown {
  return get(values, path);
}

/** 深度合并部分表单值；对象递归合并，数组整体替换。 */
export function mergeValues<T extends FormData>(values: T, nextValues: DeepPartial<T>): T {
  return mergeWith(cloneDeep(values), cloneDeep(nextValues), (current, next) => {
    if (Array.isArray(next)) return cloneDeep(next);
    return undefined;
  }) as T;
}

/** 原地同步对象内容，保留表单根对象及已有嵌套对象/数组的响应式引用。 */
export function syncValues<T extends FormData>(target: T, source: T): void {
  syncObject(target as Record<string, unknown>, source as Record<string, unknown>);
}

/** 递归删除旧键并同步新值，是 syncValues 保持引用稳定的核心实现。 */
function syncObject(target: Record<string, unknown>, source: Record<string, unknown>): void {
  for (const key of Object.keys(target)) {
    if (!Object.prototype.hasOwnProperty.call(source, key)) {
      delete target[key];
    }
  }

  for (const [key, sourceValue] of Object.entries(source)) {
    const targetValue = target[key];
    if (isEqual(targetValue, sourceValue)) continue;

    if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
      syncObject(targetValue as Record<string, unknown>, sourceValue as Record<string, unknown>);
      continue;
    }

    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      targetValue.splice(0, targetValue.length, ...cloneDeep(sourceValue));
      continue;
    }

    target[key] = cloneDeep(sourceValue);
  }
}

export function valuesEqual(left: unknown, right: unknown): boolean {
  return isEqual(left, right);
}
