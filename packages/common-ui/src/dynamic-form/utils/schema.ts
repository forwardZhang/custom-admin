import { normalizePath, pathToString, resolvePath } from './path';
import { cloneDeep, get, has, set, unset } from './value';

import type {
  DynamicFormArraySchema,
  DynamicFormContainerSchema,
  DynamicFormController,
  DynamicFormFieldSchema,
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
      componentProps: item.componentProps ? cloneDeep(item.componentProps) : undefined,
      dependencies: item.dependencies
        ? {
            ...item.dependencies,
            triggerFields: item.dependencies.triggerFields.map((path) => normalizePath(path)),
            rules: Array.isArray(item.dependencies.rules)
              ? [...item.dependencies.rules]
              : item.dependencies.rules,
          }
        : undefined,
    } as DynamicFormSchemaItem<T>;

    if ('rules' in item && item.rules) {
      next = { ...next, rules: [...item.rules] } as DynamicFormSchemaItem<T>;
    }
    if ('defaultValue' in item) {
      next = {
        ...next,
        defaultValue: cloneDeep(item.defaultValue),
      } as DynamicFormSchemaItem<T>;
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

/** 判断 Schema 是否为数组字段。 */
export const isArraySchema = <T extends FormData>(
  schema: DynamicFormSchemaItem<T>,
): schema is DynamicFormArraySchema<T> => schema.component === 'arrayField';

/** 判断 Schema 是否为普通字段。 */
export const isFieldSchema = <T extends FormData>(
  schema: DynamicFormSchemaItem<T>,
): schema is DynamicFormFieldSchema<T> => !isContainerSchema(schema) && !isArraySchema(schema);

/**
 * 递归应用字段默认值。
 * 容器只改变路径上下文，ArrayField 会为每个现有数组项继续应用子字段默认值。
 */
export const applySchemaDefaults = <T extends FormData>(
  schema: DynamicFormSchema<T>,
  source: T,
  basePath: Array<string | number> = [],
): T => {
  const result = cloneDeep(source);

  schema.forEach((item) => {
    if (isContainerSchema(item)) {
      const nextBase = resolvePath(basePath, item.fieldName);
      Object.assign(result, applySchemaDefaults(item.children, result, nextBase));
      return;
    }

    const path = resolvePath(basePath, item.fieldName);
    if (isArraySchema(item)) {
      if (!has(result, path)) set(result, path, cloneDeep(item.defaultValue ?? []));
      const list = get(result, path);
      if (Array.isArray(list)) {
        list.forEach((_entry, index) => {
          Object.assign(result, applySchemaDefaults(item.children, result, [...path, index]));
        });
      }
      return;
    }

    if (!has(result, path) && item.defaultValue !== undefined) {
      set(result, path, cloneDeep(item.defaultValue));
    }
  });

  return result;
};

/** 根据子 Schema 创建一条包含默认值的新数组项。 */
export const createArrayItem = <T extends FormData>(schema: DynamicFormSchema<T>) =>
  applySchemaDefaults(schema, {} as T) as Record<string, unknown>;

const evaluateDependency = <T extends FormData, R>(
  value: R | ((values: Readonly<T>, api: DynamicFormController<T>) => R) | undefined,
  values: T,
  api: DynamicFormController<T>,
  fallback: R,
) => {
  if (typeof value === 'function') {
    try {
      return (value as (values: Readonly<T>, api: DynamicFormController<T>) => R)(values, api);
    } catch (error) {
      console.error('[DynamicForm] dependency evaluation failed:', error);
      return fallback;
    }
  }

  return value ?? fallback;
};

/**
 * 根据 dependencies.if/show 生成提交数据。
 * 无 fieldName 的布局容器隐藏时，需要递归删除全部子字段而不是删除容器本身。
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
        const nextBase = resolvePath(currentBase, item.fieldName);
        if (item.fieldName !== undefined) unset(result, nextBase);
        else removeAll(item.children, nextBase);
        return;
      }
      unset(result, resolvePath(currentBase, item.fieldName));
    });
  };

  const walk = (items: DynamicFormSchema<T>, currentBase: Array<string | number>) => {
    items.forEach((item) => {
      const dependencies = item.dependencies;
      const exists = evaluateDependency(dependencies?.if, values, api, true);
      const visible = evaluateDependency(dependencies?.show, values, api, true);

      if (isContainerSchema(item)) {
        const nextBase = resolvePath(currentBase, item.fieldName);
        if (!exists || !visible) {
          if (item.fieldName !== undefined) unset(result, nextBase);
          else removeAll(item.children, nextBase);
          return;
        }
        walk(item.children, nextBase);
        return;
      }

      const path = resolvePath(currentBase, item.fieldName);
      if (!exists || !visible) {
        unset(result, path);
        return;
      }

      if (isArraySchema(item)) {
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
      const itemPath = resolvePath(basePath, item.fieldName);
      const key = item.fieldName === undefined ? '' : pathToString(itemPath);
      const patch = key ? patchMap.get(key) : undefined;
      let next = patch ? ({ ...item, ...patch } as DynamicFormSchemaItem<T>) : item;

      if (patch?.componentProps && 'componentProps' in item) {
        next = {
          ...next,
          componentProps: { ...item.componentProps, ...patch.componentProps },
        } as DynamicFormSchemaItem<T>;
      }
      if ('children' in next) {
        next = {
          ...next,
          children: walk(next.children, itemPath),
        } as DynamicFormSchemaItem<T>;
      }
      return next;
    });

  return cloneSchema(walk(schema));
};
