import type { TableColumnType } from 'antdv-next';
import type { Component } from 'vue';

import { computed, onMounted, ref, watch } from 'vue';
import { isEqual, isPlainObject } from 'lodash-es';

import { useDynamicFormFieldContext } from '../core/context';
import { createFieldApi } from '../core/field-api';
import { normalizePath, pathToString } from '../utils/path';
import { applySchemaDefaults } from '../utils/schema';
import { cloneValue } from '../utils/value';

import type {
  DynamicFormListActionApi,
  DynamicFormListFieldSchema,
  DynamicFormListItem,
  DynamicFormListLayout,
  DynamicFormFieldSchema,
  FormData,
  NormalizedFormPath,
} from '../types';

export interface ListTableColumn extends TableColumnType<DynamicFormListItem> {
  fieldIndex?: number;
}

/** 表格布局行上挂载稳定 key 的字段名，只在渲染副本上出现，不写回表单值。 */
export const LIST_ROW_KEY = '__dynamicFormListRowKey';

/**
 * List 字段逻辑：行 key、增删复制、table 列、onChange。
 * 模板只负责 card / table / custom 三种布局渲染。
 */
export function useFormList(disabled: () => boolean) {
  const { api, schema } = useDynamicFormFieldContext<FormData>();

  const listSchema = computed(() => schema.value as DynamicFormListFieldSchema<FormData>);
  const childSchema = computed(() => listSchema.value.schema);
  const listOptions = computed(() => listSchema.value.listOptions ?? {});
  const layout = computed<DynamicFormListLayout | Component>(
    () => listOptions.value.layout ?? 'card',
  );
  const isCustomLayout = computed(() => typeof layout.value !== 'string');
  const items = computed<DynamicFormListItem[]>(() =>
    Array.isArray(api.value) ? (api.value as DynamicFormListItem[]) : [],
  );
  const listPath = computed<NormalizedFormPath>(() => [...api.field.path]);
  const reachedMin = computed(() => items.value.length <= Math.max(listOptions.value.min ?? 0, 0));
  const reachedMax = computed(
    () => listOptions.value.max !== undefined && items.value.length >= listOptions.value.max,
  );
  const showActions = computed(
    () => listOptions.value.showCopy !== false || listOptions.value.showDelete !== false,
  );

  let rowKeySeed = 0;
  const rowKeys = ref<string[]>([]);

  function createRowKey(): string {
    rowKeySeed += 1;
    return `dynamic-form-list-${rowKeySeed}`;
  }

  watch(
    () => items.value.length,
    (length) => {
      if (rowKeys.value.length > length) rowKeys.value.splice(length);
      while (rowKeys.value.length < length) rowKeys.value.push(createRowKey());
    },
    { immediate: true },
  );

  onMounted(() => {
    const nextItems = items.value.map(
      (item) => applySchemaDefaults(normalizeItem(item), childSchema.value) as DynamicFormListItem,
    );
    if (!isEqual(nextItems, items.value)) api.setFieldValue(listPath.value, nextItems);
  });

  const tableColumns = computed<ListTableColumn[]>(() => {
    const columns: ListTableColumn[] = childSchema.value.map((field, fieldIndex) => ({
      key: `${fieldIndex}-${pathToString(field.fieldName)}`,
      title:
        field.label === undefined || typeof field.label === 'function'
          ? pathToString(field.fieldName)
          : field.label,
      fieldIndex,
      ...field.listColumnProps,
    }));

    if (showActions.value) {
      columns.push({
        key: 'dynamic-form-list-actions',
        title: '操作',
        align: 'center',
        fixed: 'end',
        width: 88,
      });
    }
    return columns;
  });

  /**
   * 表格布局的数据源：把稳定 rowKey 挂到行上，避免用底层 Table 已废弃的 `rowKey(item, index)`。
   */
  const tableRows = computed(() =>
    items.value.map((item, index) => ({ ...item, [LIST_ROW_KEY]: rowKeys.value[index] })),
  );

  function getColumnFieldIndex(column: TableColumnType<DynamicFormListItem>): number {
    return (column as ListTableColumn).fieldIndex ?? -1;
  }

  function normalizeItem(item: unknown): DynamicFormListItem {
    if (isPlainObject(item)) return cloneValue(item as DynamicFormListItem);
    console.warn('[DynamicForm] List createItem must return a plain object');
    return {};
  }

  function createActionContext(
    index: number,
    item: DynamicFormListItem,
    sourceIndex?: number,
  ): DynamicFormListActionApi<FormData> {
    const itemPath = [...listPath.value, index];
    return createFieldApi(
      api,
      () => ({
        field: {
          ...api.field,
          listIndex: index,
          itemPath,
        },
        value: items.value,
      }),
      {
        listPath: listPath.value,
        listIndex: index,
        itemPath,
        // 三个调用点传进来的 item 都已是脱离表单状态的独立对象
        // （空对象 / createItem 产物 / normalizeItem 克隆结果），不再重复克隆。
        item,
        sourceIndex,
      },
    );
  }

  function commitItems(nextItems: DynamicFormListItem[], nativeArgs: readonly unknown[]): void {
    const onChange = schema.value.onChange;
    // 写入是原地进行的，oldValue 必须在写之前取快照；没有 onChange 就整个跳过。
    const oldValue = onChange ? cloneValue(items.value) : undefined;
    api.setFieldValue(listPath.value, nextItems);
    if (!onChange) return;

    onChange(
      createFieldApi(
        api,
        () => ({
          field: api.field,
          // 写入已完成，直接读当前值的只读视图，不必再克隆 nextItems。
          value: api.value,
        }),
        { oldValue, nativeArgs },
      ),
    );
  }

  function addItem(): void {
    if (disabled() || reachedMax.value) return;

    const index = items.value.length;
    const emptyContext = createActionContext(index, {});
    const createdItem = normalizeItem(listOptions.value.createItem?.(emptyContext) ?? {});
    const item = applySchemaDefaults(createdItem, childSchema.value) as DynamicFormListItem;
    rowKeys.value.push(createRowKey());
    commitItems([...items.value, item], ['add', index]);
    listOptions.value.onAdd?.(createActionContext(index, item));
  }

  function copyItem(index: number): void {
    if (disabled() || reachedMax.value) return;

    const item = normalizeItem(items.value[index]);
    const insertIndex = index + 1;
    const nextItems = [...items.value];
    nextItems.splice(insertIndex, 0, item);
    rowKeys.value.splice(insertIndex, 0, createRowKey());
    commitItems(nextItems, ['copy', index, insertIndex]);
    listOptions.value.onCopy?.(createActionContext(insertIndex, item, index));
  }

  function removeItem(index: number): void {
    if (disabled() || reachedMin.value) return;

    const item = normalizeItem(items.value[index]);
    const nextItems = [...items.value];
    nextItems.splice(index, 1);
    rowKeys.value.splice(index, 1);

    const affectedPaths = childSchema.value.flatMap((field) =>
      Array.from({ length: items.value.length - index }, (_, offset) => [
        ...listPath.value,
        index + offset,
        ...normalizePath(field.fieldName),
      ]),
    );
    if (affectedPaths.length) api.clearValidate(affectedPaths);

    commitItems(nextItems, ['delete', index]);
    listOptions.value.onDelete?.(createActionContext(index, item));
  }

  return {
    childSchema,
    listOptions,
    layout,
    isCustomLayout,
    items,
    listPath,
    reachedMin,
    reachedMax,
    showActions,
    rowKeys,
    tableColumns,
    tableRows,
    getColumnFieldIndex,
    addItem,
    copyItem,
    removeItem,
  };
}
