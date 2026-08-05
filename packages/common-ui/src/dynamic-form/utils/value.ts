import { cloneDeep, isEqual, isObjectLike, isPlainObject, mergeWith } from 'lodash-es';
import { readonly, toRaw } from 'vue';

import type { DeepPartial, FormData } from '../types';

export function cloneValue<T>(value: T): T {
  return cloneDeep(toRaw(value));
}

/**
 * 包一层只读视图：对象走 Vue 的 readonly 代理（内部有缓存，重复调用是 O(1)），
 * 其余原样返回。
 *
 * 用 isObjectLike 而不是 isObject：后者对函数也返回 true，
 * 而 readonly() 只接受 typeof 'object'，传函数会在开发期告警。
 */
export function toReadonlyValue<V>(value: V): V {
  return isObjectLike(value) ? (readonly(value as object) as V) : value;
}

/**
 * 深度合并部分表单值；对象递归合并，数组整体替换。
 * 从 toRaw 起步再克隆，避免穿过响应式代理逐属性读取；
 * nextValues 不预先克隆——数组由 customizer 复制，其余叶子由 syncValues 写入时再克隆，
 * 因此这里的合并结果不会把 nextValues 的引用留在表单状态里。
 */
export function mergeValues<T extends FormData>(values: T, nextValues: DeepPartial<T>): T {
  return mergeWith(cloneValue(values), nextValues, (current, next) => {
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
