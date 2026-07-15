import { toPath } from 'lodash-es';

import type { FormPath } from '../types';

/**
 * 将点路径、数组路径统一转换为 antdv Form 可识别的 NamePath。
 * 数字字符串会转换为 number，以便正确访问数组字段。
 */
export const normalizePath = (path?: FormPath): Array<string | number> => {
  if (path === undefined) return [];
  if (Array.isArray(path)) return [...path];

  return toPath(path).map((segment) => (/^\d+$/.test(segment) ? Number(segment) : segment));
};

/** 在容器或数组项路径后拼接字段的相对路径。 */
export const resolvePath = (
  basePath: Array<string | number>,
  fieldName?: FormPath,
): Array<string | number> => [...basePath, ...normalizePath(fieldName)];

/** 将 NamePath 转为稳定字符串，用于 Schema key 和 patch 匹配。 */
export const pathToString = (path: FormPath | Array<string | number>) =>
  normalizePath(path as FormPath)
    .map((segment, index) =>
      typeof segment === 'number' ? `[${segment}]` : `${index > 0 ? '.' : ''}${segment}`,
    )
    .join('');
