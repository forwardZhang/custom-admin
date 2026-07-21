import { toPath } from 'lodash-es';

import type { FormPath, NormalizedFormPath } from '../types';

const numericSegment = /^(0|[1-9]\d*)$/;

/** 将点路径或路径数组统一为数组，并把纯数字片段转换为数组索引。 */
export function normalizePath(path: FormPath): NormalizedFormPath {
  const segments = Array.isArray(path) ? [...path] : toPath(path);
  return segments.map((segment) => {
    if (typeof segment === 'number') return segment;
    return numericSegment.test(segment) ? Number(segment) : segment;
  });
}

/** 拼接嵌套表单基础路径与字段自身路径。 */
export function resolveFormPath(
  basePath: FormPath | undefined,
  fieldName: FormPath,
): NormalizedFormPath {
  return [...(basePath ? normalizePath(basePath) : []), ...normalizePath(fieldName)];
}

/** 将任意表单路径转换为稳定字符串，用于字段 key 和 schema 匹配。 */
export function pathToString(path: FormPath): string {
  return normalizePath(path).map(String).join('.');
}
