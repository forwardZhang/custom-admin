import { findLastIndex } from 'lodash-es';

import { get } from './value';
import { resolvePath } from './path';

import type {
  DynamicFormController,
  DynamicFormResolveContext,
  FormData,
  FormPath,
} from '../types';

const getAtPath = <T extends FormData>(values: T, path: Array<string | number>) =>
  path.length ? get(values, path) : values;

/**
 * 根据完整字段路径创建动态 Schema 上下文。
 * siblingBasePath 对普通字段是父路径，对无字段名容器则是当前作用域路径。
 */
export const createResolveContext = <T extends FormData, TValue = unknown>(
  values: T,
  formApi: DynamicFormController<T>,
  fieldName: Array<string | number>,
  siblingBasePath: Array<string | number>,
): DynamicFormResolveContext<T, TValue> => {
  const indices = fieldName.filter((segment): segment is number => typeof segment === 'number');
  const listIndexPosition = findLastIndex(fieldName, (segment) => typeof segment === 'number');
  const itemValue =
    listIndexPosition >= 0
      ? getAtPath(values, fieldName.slice(0, listIndexPosition + 1))
      : undefined;

  return {
    value: getAtPath(values, fieldName) as TValue,
    values,
    formApi,
    fieldName: [...fieldName],
    parentPath: [...siblingBasePath],
    parentValue: getAtPath(values, siblingBasePath),
    index: indices[indices.length - 1],
    indices,
    item:
      itemValue !== null && typeof itemValue === 'object' && !Array.isArray(itemValue)
        ? (itemValue as Readonly<Record<string, unknown>>)
        : undefined,
    getSibling: (siblingName: FormPath) =>
      getAtPath(values, resolvePath(siblingBasePath, siblingName)),
  };
};
