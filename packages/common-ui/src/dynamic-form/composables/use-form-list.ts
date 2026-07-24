import type { TableColumnType } from 'antdv-next';
import type { Component } from 'vue';

import { computed, onMounted, ref, watch } from 'vue';
import { cloneDeep, isEqual, isPlainObject } from 'lodash-es';

import { useDynamicFormFieldContext } from '../core/context';
import { createFieldApi } from '../core/form-api';
import { normalizePath, pathToString } from '../utils/path';
import { applySchemaDefaults } from '../utils/schema';

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

/**
 * List 字段逻辑：行 key、增删复制、table 列、onChange。
 * 模板只负责 card / table / custom 三种布局渲染。
 */
export function useFormList(disabled: () => boolean) {
  const { api, schema } = useDynamicFormFieldContext<FormData>();

  const listSchema = computed(() => schema.value as DynamicFormListFieldSchema<FormData>);
  const childSchema = computed(() => listSchema.value.schema);
  const listProps = computed(() => listSchema.value.listProps ?? {});
  const layout = computed<DynamicFormListLayout | Component>(
    () => listProps.value.layout ?? 'card',
  );
  const isCustomLayout = computed(() => typeof layout.value !== 'string');
  const items = computed<DynamicFormListItem[]>(() =>
    Array.isArray(api.state) ? (api.state as DynamicFormListItem[]) : [],
  );
  const listPath = computed<NormalizedFormPath>(() => [...api.field.path]);
  const reachedMin = computed(() => items.value.length <= Math.max(listProps.value.min ?? 0, 0));
  const reachedMax = computed(
    () => listProps.value.max !== undefined && items.value.length >= listProps.value.max,
  );
  const showActions = computed(
    () => listProps.value.showCopy !== false || listProps.value.showDelete !== false,
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
    if (!isEqual(nextItems, items.value)) api.setState(listPath.value, nextItems);
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

  function getRowKey(_item: DynamicFormListItem, index?: number): string {
    return rowKeys.value[index ?? 0];
  }

  function getColumnFieldIndex(column: TableColumnType<DynamicFormListItem>): number {
    return (column as ListTableColumn).fieldIndex ?? -1;
  }

  function normalizeItem(item: unknown): DynamicFormListItem {
    if (isPlainObject(item)) return cloneDeep(item as DynamicFormListItem);
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
        state: items.value,
      }),
      {
        listPath: listPath.value,
        listIndex: index,
        itemPath,
        item: cloneDeep(item),
        sourceIndex,
      },
    );
  }

  function commitItems(nextItems: DynamicFormListItem[], nativeArgs: readonly unknown[]): void {
    const oldValue = cloneDeep(items.value);
    api.setState(listPath.value, nextItems);

    schema.value.onChange?.(
      createFieldApi(
        api,
        () => ({
          field: api.field,
          state: cloneDeep(nextItems),
        }),
        { oldValue, nativeArgs },
      ),
    );
  }

  function addItem(): void {
    if (disabled() || reachedMax.value) return;

    const index = items.value.length;
    const emptyContext = createActionContext(index, {});
    const createdItem = normalizeItem(listProps.value.createItem?.(emptyContext) ?? {});
    const item = applySchemaDefaults(createdItem, childSchema.value) as DynamicFormListItem;
    rowKeys.value.push(createRowKey());
    commitItems([...items.value, item], ['add', index]);
    listProps.value.onAdd?.(createActionContext(index, item));
  }

  function copyItem(index: number): void {
    if (disabled() || reachedMax.value) return;

    const item = normalizeItem(items.value[index]);
    const insertIndex = index + 1;
    const nextItems = [...items.value];
    nextItems.splice(insertIndex, 0, item);
    rowKeys.value.splice(insertIndex, 0, createRowKey());
    commitItems(nextItems, ['copy', index, insertIndex]);
    listProps.value.onCopy?.(createActionContext(insertIndex, item, index));
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
    listProps.value.onDelete?.(createActionContext(index, item));
  }

  return {
    childSchema,
    listProps,
    layout,
    isCustomLayout,
    items,
    listPath,
    reachedMin,
    reachedMax,
    showActions,
    rowKeys,
    tableColumns,
    getRowKey,
    getColumnFieldIndex,
    addItem,
    copyItem,
    removeItem,
  };
}
