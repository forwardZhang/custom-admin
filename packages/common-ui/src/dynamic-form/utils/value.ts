import { cloneDeep, get, isEqual, isPlainObject, mergeWith } from 'lodash-es';

import type { DeepPartial, FormData, FormPath } from '../types';

export function cloneValue<T>(value: T): T {
  return cloneDeep(value);
}

export function getValue<T extends FormData>(values: T, path: FormPath): unknown {
  return get(values, path);
}

export function mergeValues<T extends FormData>(values: T, nextValues: DeepPartial<T>): T {
  return mergeWith(cloneDeep(values), cloneDeep(nextValues), (current, next) => {
    if (Array.isArray(next)) return cloneDeep(next);
    return undefined;
  }) as T;
}

export function syncValues<T extends FormData>(target: T, source: T): void {
  syncObject(target as Record<string, unknown>, source as Record<string, unknown>);
}

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
