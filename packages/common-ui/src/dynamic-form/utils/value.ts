import { cloneDeep, get, has, isEqual, mergeWith, set, unset } from 'lodash-es';

import type { DeepPartial, FormData } from '../types';

export { cloneDeep, get, has, isEqual, set, unset };

/**
 * 合并表单局部数据。
 * 对象递归合并，数组整体替换，避免 lodash merge 按索引残留旧数组项。
 */
export const mergeValues = <T extends FormData>(current: T, patch: DeepPartial<T>): T =>
  mergeWith(cloneDeep(current), cloneDeep(patch), (_target, source) =>
    Array.isArray(source) ? source : undefined,
  ) as T;
