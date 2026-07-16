import { normalizePath, pathToString, resolvePath } from './path';
import { createResolveContext } from './resolve-context';
import { cloneDeep, get, unset } from './value';

import type {
  DynamicFormContainerSchema,
  DynamicFormController,
  DynamicFormFieldSchema,
  DynamicFormListSchema,
  DynamicFormObjectSchema,
  DynamicFormResolvable,
  DynamicFormResolveContext,
  DynamicFormSchema,
  DynamicFormSchemaItem,
  FormData,
  FormPath,
} from '../types';

/** 深拷贝 Schema，同时保留 Vue Component 和回调函数引用。 */
export const cloneSchema = <T extends FormData>(
  schema: DynamicFormSchema<T>,
): DynamicFormSchema<T> =>
  schema.map((item) => {
    let next = {
      ...item,
      componentProps:
        'componentProps' in item && item.componentProps && typeof item.componentProps !== 'function'
          ? cloneDeep(item.componentProps)
          : 'componentProps' in item
            ? item.componentProps
            : undefined,
    } as DynamicFormSchemaItem<T>;

    if ('rules' in item && Array.isArray(item.rules)) {
      next = { ...next, rules: [...item.rules] } as DynamicFormSchemaItem<T>;
    }
    if ('children' in item) {
      next = { ...next, children: cloneSchema(item.children) } as DynamicFormSchemaItem<T>;
    }

    return next;
  });

/** 判断 Schema 是否为 Card 或 Collapse 布局容器。 */
export const isContainerSchema = <T extends FormData>(
  schema: DynamicFormSchemaItem<T>,
): schema is DynamicFormContainerSchema<T> =>
  schema.component === 'card' || schema.component === 'collapse';

/** 判断 Schema 是否为对象结构。 */
export const isObjectSchema = <T extends FormData>(
  schema: DynamicFormSchemaItem<T>,
): schema is DynamicFormObjectSchema<T> => schema.component === 'object';

/** 判断 Schema 是否为列表字段。 */
export const isListSchema = <T extends FormData>(
  schema: DynamicFormSchemaItem<T>,
): schema is DynamicFormListSchema<T> => schema.component === 'list';

/** 判断 Schema 是否为受控字段（包括列表字段）。 */
export const isFieldSchema = <T extends FormData>(
  schema: DynamicFormSchemaItem<T>,
): schema is DynamicFormFieldSchema<T> => !isContainerSchema(schema) && !isObjectSchema(schema);

const evaluateSchemaValue = <T extends FormData, R>(
  value: DynamicFormResolvable<T, R> | undefined,
  context: DynamicFormResolveContext<T>,
  fallback: R,
) => {
  if (typeof value === 'function') {
    try {
      return (value as (context: DynamicFormResolveContext<T>) => R)(context);
    } catch (error) {
      console.error('[DynamicForm] schema value evaluation failed:', error);
      return fallback;
    }
  }

  return value ?? fallback;
};

/**
 * 根据 if 生成提交数据；纯 UI 容器卸载时递归删除其全部子字段。
 */
export const removeHiddenValues = <T extends FormData>(
  schema: DynamicFormSchema<T>,
  values: T,
  api: DynamicFormController<T>,
  basePath: Array<string | number> = [],
) => {
  const result = cloneDeep(values);

  const removeAll = (items: DynamicFormSchema<T>, currentBase: Array<string | number>) => {
    items.forEach((item) => {
      if (isContainerSchema(item)) {
        removeAll(item.children, currentBase);
        return;
      }
      if (isObjectSchema(item)) {
        unset(result, resolvePath(currentBase, item.fieldName));
        return;
      }
      unset(result, resolvePath(currentBase, item.fieldName));
    });
  };

  const walk = (items: DynamicFormSchema<T>, currentBase: Array<string | number>) => {
    items.forEach((item) => {
      const path = isContainerSchema(item) ? currentBase : resolvePath(currentBase, item.fieldName);
      const siblingBasePath = isContainerSchema(item) ? currentBase : path.slice(0, -1);
      const resolveContext = createResolveContext(values, api, path, siblingBasePath);
      const exists = 'if' in item ? evaluateSchemaValue(item.if, resolveContext, true) : true;

      if (isContainerSchema(item)) {
        if (!exists) {
          removeAll(item.children, currentBase);
          return;
        }
        walk(item.children, currentBase);
        return;
      }

      if (isObjectSchema(item)) {
        walk(item.children, resolvePath(currentBase, item.fieldName));
        return;
      }

      if (!exists) {
        unset(result, path);
        return;
      }

      if (isListSchema(item)) {
        const list = get(values, path);
        if (Array.isArray(list)) {
          list.forEach((_entry, index) => walk(item.children, [...path, index]));
        }
      }
    });
  };

  walk(schema, basePath);
  return result;
};

/** 按完整字段路径递归更新 Schema，支持容器和数组内部的相对字段。 */
export const patchSchema = <T extends FormData>(
  schema: DynamicFormSchema<T>,
  patches: Array<Partial<DynamicFormFieldSchema<T>> & { fieldName: FormPath }>,
): DynamicFormSchema<T> => {
  const patchMap = new Map(patches.map((patch) => [pathToString(patch.fieldName), patch]));

  const walk = (
    items: DynamicFormSchema<T>,
    basePath: Array<string | number> = [],
  ): DynamicFormSchema<T> =>
    items.map((item) => {
      const itemPath = isContainerSchema(item) ? basePath : resolvePath(basePath, item.fieldName);
      const key = isContainerSchema(item) ? '' : pathToString(itemPath);
      const patch = key ? patchMap.get(key) : undefined;
      let next = patch ? ({ ...item, ...patch } as DynamicFormSchemaItem<T>) : item;

      if (
        patch?.componentProps &&
        typeof patch.componentProps !== 'function' &&
        'componentProps' in item &&
        typeof item.componentProps !== 'function'
      ) {
        next = {
          ...next,
          componentProps: { ...item.componentProps, ...patch.componentProps },
        } as DynamicFormSchemaItem<T>;
      }
      if ('children' in next) {
        next = {
          ...next,
          children: walk(next.children, isContainerSchema(next) ? basePath : itemPath),
        } as DynamicFormSchemaItem<T>;
      }
      return next;
    });

  return cloneSchema(walk(schema));
};
