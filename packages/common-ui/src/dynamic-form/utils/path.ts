import { toPath } from 'lodash-es';

import type { FormPath, NormalizedFormPath } from '../types';

const numericSegment = /^(0|[1-9]\d*)$/;

export function normalizePath(path: FormPath): NormalizedFormPath {
  const segments = Array.isArray(path) ? [...path] : toPath(path);
  return segments.map((segment) => {
    if (typeof segment === 'number') return segment;
    return numericSegment.test(segment) ? Number(segment) : segment;
  });
}

export function resolveFormPath(
  basePath: FormPath | undefined,
  fieldName: FormPath,
): NormalizedFormPath {
  return [...(basePath ? normalizePath(basePath) : []), ...normalizePath(fieldName)];
}

export function pathToString(path: FormPath): string {
  return normalizePath(path).map(String).join('.');
}
