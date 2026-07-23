<template>
  <div class="dynamic-form-list">
    <component
      :is="layout"
      v-if="isCustomLayout"
      :add-item="addItem"
      :copy-item="copyItem"
      :disabled="disabled"
      :items="items"
      :list-path="listPath"
      :reached-max="reachedMax"
      :reached-min="reachedMin"
      :remove-item="removeItem"
      :row-keys="rowKeys"
      :schema="childSchema"
      :show-add="listProps.showAdd !== false"
      :show-copy="listProps.showCopy !== false"
      :show-delete="listProps.showDelete !== false"
    >
      <template #field="fieldProps">
        <slot name="field" v-bind="fieldProps" />
      </template>
    </component>

    <template v-else-if="items.length">
      <div v-if="layout === 'card'" class="dynamic-form-list__cards">
        <Card
          v-for="(item, itemIndex) in items"
          :key="rowKeys[itemIndex]"
          class="dynamic-form-list__card"
          size="small"
          :title="`第 ${itemIndex + 1} 项`"
        >
          <template v-if="showActions" #extra>
            <div class="dynamic-form-list__actions">
              <Tooltip v-if="listProps.showCopy !== false" title="复制">
                <Button
                  aria-label="复制"
                  size="small"
                  type="text"
                  :disabled="disabled || reachedMax"
                  @click="copyItem(itemIndex)"
                >
                  <CopyOutlined />
                </Button>
              </Tooltip>
              <Tooltip v-if="listProps.showDelete !== false" title="删除">
                <Button
                  aria-label="删除"
                  danger
                  size="small"
                  type="text"
                  :disabled="disabled || reachedMin"
                  @click="removeItem(itemIndex)"
                >
                  <DeleteOutlined />
                </Button>
              </Tooltip>
            </div>
          </template>

          <div class="dynamic-form-list__card-fields">
            <template
              v-for="(field, fieldIndex) in childSchema"
              :key="`${rowKeys[itemIndex]}-${fieldIndex}`"
            >
              <slot
                name="field"
                :compact="false"
                :field="field"
                :field-index="fieldIndex"
                :item-index="itemIndex"
                :item-key="rowKeys[itemIndex]"
              />
            </template>
          </div>
        </Card>
      </div>

      <Table
        v-else
        class="dynamic-form-list__table"
        :columns="tableColumns"
        :data-source="items"
        :pagination="false"
        :row-key="getRowKey"
        :scroll="{ x: 'max-content' }"
        size="middle"
        bordered
      >
        <template #bodyCell="{ column, index }">
          <slot
            v-if="getColumnFieldIndex(column) >= 0"
            :compact="true"
            :field="childSchema[getColumnFieldIndex(column)]"
            :field-index="getColumnFieldIndex(column)"
            :item-index="index"
            :item-key="rowKeys[index]"
            name="field"
          />
          <div v-else class="dynamic-form-list__actions dynamic-form-list__table-actions">
            <Tooltip v-if="listProps.showCopy !== false" title="复制">
              <Button
                aria-label="复制"
                size="small"
                type="text"
                :disabled="disabled || reachedMax"
                @click="copyItem(index)"
              >
                <CopyOutlined />
              </Button>
            </Tooltip>
            <Tooltip v-if="listProps.showDelete !== false" title="删除">
              <Button
                aria-label="删除"
                danger
                size="small"
                type="text"
                :disabled="disabled || reachedMin"
                @click="removeItem(index)"
              >
                <DeleteOutlined />
              </Button>
            </Tooltip>
          </div>
        </template>
      </Table>
    </template>

    <Empty v-else :description="listProps.emptyText ?? '暂无数据'" />

    <Button
      v-if="!isCustomLayout && listProps.showAdd !== false"
      block
      class="dynamic-form-list__add"
      type="dashed"
      :disabled="disabled || reachedMax"
      @click="addItem"
    >
      <template #icon><PlusOutlined /></template>
      {{ listProps.addButtonText ?? '新增一项' }}
    </Button>
  </div>
</template>

<script setup lang="ts">
import type { TableColumnType } from 'antdv-next';
import type { Component } from 'vue';

import { computed, onMounted, ref, watch } from 'vue';
import { Button, Card, Empty, Table, Tooltip } from 'antdv-next';
import { CopyOutlined, DeleteOutlined, PlusOutlined } from '@antdv-next/icons';
import { cloneDeep, isEqual, isPlainObject } from 'lodash-es';

import { useDynamicFormFieldContext } from '../../core/context';
import { scopeDynamicFormApi } from '../../core/form-api';
import { normalizePath, pathToString } from '../../utils/path';
import { applySchemaDefaults } from '../../utils/schema';

import type {
  DynamicFormListActionApi,
  DynamicFormListFieldSchema,
  DynamicFormListItem,
  DynamicFormListLayout,
  DynamicFormFieldSchema,
  FormData,
  NormalizedFormPath,
} from '../../types';

interface ListTableColumn extends TableColumnType<DynamicFormListItem> {
  fieldIndex?: number;
}

defineOptions({ name: 'DynamicFormList', inheritAttrs: false });

const props = defineProps<{
  disabled: boolean;
}>();

defineSlots<{
  field(props: {
    compact: boolean;
    field: DynamicFormFieldSchema<FormData>;
    fieldIndex: number;
    itemIndex: number;
    itemKey: string;
  }): unknown;
}>();

const { api, schema } = useDynamicFormFieldContext<FormData>();

const listSchema = computed(() => schema.value as DynamicFormListFieldSchema<FormData>);
const childSchema = computed(() => listSchema.value.schema);
const listProps = computed(() => listSchema.value.listProps ?? {});
const layout = computed<DynamicFormListLayout | Component>(() => listProps.value.layout ?? 'card');
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
  return scopeDynamicFormApi(
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
    scopeDynamicFormApi(
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
  if (props.disabled || reachedMax.value) return;

  const index = items.value.length;
  const emptyContext = createActionContext(index, {});
  const createdItem = normalizeItem(listProps.value.createItem?.(emptyContext) ?? {});
  const item = applySchemaDefaults(createdItem, childSchema.value) as DynamicFormListItem;
  rowKeys.value.push(createRowKey());
  commitItems([...items.value, item], ['add', index]);
  listProps.value.onAdd?.(createActionContext(index, item));
}

function copyItem(index: number): void {
  if (props.disabled || reachedMax.value) return;

  const item = normalizeItem(items.value[index]);
  const insertIndex = index + 1;
  const nextItems = [...items.value];
  nextItems.splice(insertIndex, 0, item);
  rowKeys.value.splice(insertIndex, 0, createRowKey());
  commitItems(nextItems, ['copy', index, insertIndex]);
  listProps.value.onCopy?.(createActionContext(insertIndex, item, index));
}

function removeItem(index: number): void {
  if (props.disabled || reachedMin.value) return;

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
</script>

<style scoped>
.dynamic-form-list {
  min-width: 0;
  width: 100%;
}

.dynamic-form-list__cards {
  display: grid;
  gap: 12px;
}

.dynamic-form-list__card {
  border-radius: 6px;
}

.dynamic-form-list__card-fields {
  display: grid;
  min-width: 0;
  grid-template-columns: repeat(auto-fit, minmax(min(220px, 100%), 1fr));
  column-gap: 16px;
}

.dynamic-form-list__actions {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 2px;
}

.dynamic-form-list__table-actions {
  justify-content: center;
}

.dynamic-form-list__table :deep(.ant-form-item) {
  margin-bottom: 0;
}

.dynamic-form-list__add {
  margin-top: 12px;
}
</style>
