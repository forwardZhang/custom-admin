<template>
  <div
    class="dynamic-table"
    :class="[{ 'dynamic-table--fullscreen': isFullscreen }, attrs.class]"
    :style="attrs.style"
  >
    <DynamicTableToolbar
      v-if="props.showToolbar"
      :batch-mode="batchMode"
      :clear-selection="clearSelection"
      :fullscreen="isFullscreen"
      :loading="requestLoading"
      :reload="reload"
      :selected-row-keys="selectedRowKeys"
      :selected-rows="selectedRows"
      :title="tableTitle"
      :show-fullscreen="props.showFullscreen"
      :show-refresh="props.showRefresh"
      :toolbar-class="props.toolbarClass"
      @refresh="handleRefresh"
      @toggle-fullscreen="toggleFullscreen"
    >
      <template v-if="slots.title" #title><slot name="title" /></template>
      <template #toolbar-left><slot name="toolbar-left" /></template>
      <template #toolbar-right><slot name="toolbar-right" /></template>
      <template v-if="slots['toolbar-batch']" #toolbar-batch="slotProps">
        <slot name="toolbar-batch" v-bind="slotProps" />
      </template>
    </DynamicTableToolbar>

    <Table ref="tableRef" v-bind="mergedTableProps" @change="handleTableChange">
      <template v-if="slots.default" #default>
        <slot />
      </template>
      <template v-for="slotName in forwardedSlotNames" :key="slotName" #[slotName]="slotProps">
        <slot :name="slotName" v-bind="slotProps" />
      </template>
    </Table>
  </div>
</template>

<script setup lang="ts" generic="TRecord extends object = Record<string, unknown>">
import type { TableProps } from 'antdv-next';
import { Table } from 'antdv-next';
import { isArray } from 'lodash-es';
import { computed, shallowRef, useAttrs, useSlots } from 'vue';

import DynamicTableToolbar from './dynamic-table-toolbar.vue';
import { useDynamicTableFullscreen } from '../composables/use-dynamic-table-fullscreen';
import {
  type DynamicTableChangeArgs,
  useDynamicTableRequest,
} from '../composables/use-dynamic-table-request';
import { useDynamicTableSelection } from '../composables/use-dynamic-table-selection';

import type {
  DynamicTableInstance,
  DynamicTableKey,
  DynamicTableNativeInstance,
  DynamicTablePublicProps,
  DynamicTableRequestResult,
} from '../types';

defineOptions({ name: 'DynamicTable', inheritAttrs: false });

// DynamicTable 自有 props 与 Antdv Table props 混合，后续会在 mergedTableProps 中拆分处理。
const props = withDefaults(defineProps<DynamicTablePublicProps<TRecord>>(), {
  immediate: true,
  showFullscreen: true,
  showRefresh: true,
  showToolbar: true,
  toolbarClass: undefined,
  tableClass: undefined,
  tableStyle: undefined,
});

type ChangeArgs = DynamicTableChangeArgs<TRecord>;
type TableAttrs = Record<string, unknown>;

const emit = defineEmits<{
  change: ChangeArgs;
  'update:selectedRowKeys': [keys: DynamicTableKey[]];
  selectionChange: [keys: DynamicTableKey[], rows: TRecord[]];
  requestSuccess: [result: DynamicTableRequestResult<TRecord>];
  requestError: [error: unknown];
  refresh: [];
  fullscreenChange: [fullscreen: boolean];
  paginationChange: [current: number, pageSize: number];
}>();

const attrs = useAttrs();
const slots = useSlots();
const tableRef = shallowRef<DynamicTableNativeInstance>();
const rawAttrs = computed(() => attrs as TableAttrs);

// 原生 Table props 在不同 Vue 编译场景下可能出现在 props 或 attrs，统一从两处读取。
const tablePropSource = computed<TableAttrs>(() => ({
  ...(props as unknown as TableAttrs),
  ...rawAttrs.value,
}));
const tableTitle = computed(() => tablePropSource.value.title as string | undefined);
const nativePagination = computed(
  () => tablePropSource.value.pagination as TableProps<TRecord>['pagination'],
);
const nativeDataSource = computed(() => tablePropSource.value.dataSource as TRecord[] | undefined);
const nativeLoading = computed(
  () => tablePropSource.value.loading as TableProps<TRecord>['loading'],
);
const nativeOnChange = computed(() => tablePropSource.value.onChange);

// 选择、请求、全屏分别封装，组件这里只负责把状态拼装成 Table 和工具栏需要的 props。
const selectionState = useDynamicTableSelection({
  props,
  emitSelectedRowKeys: (keys) => emit('update:selectedRowKeys', keys),
  emitSelectionChange: (keys, rows) => emit('selectionChange', keys, rows),
});

const requestState = useDynamicTableRequest({
  request: () => props.request,
  immediate: () => props.immediate,
  pagination: () => nativePagination.value,
  onSuccess: (result) => emit('requestSuccess', result),
  onError: (error) => emit('requestError', error),
});

const fullscreenState = useDynamicTableFullscreen({
  onChange: (fullscreen) => emit('fullscreenChange', fullscreen),
});

const { batchMode, clearSelection, mergedRowSelection, selectedRowKeys, selectedRows } =
  selectionState;
const { isFullscreen, toggleFullscreen } = fullscreenState;
const {
  handleTableChange: handleRequestTableChange,
  mergedPagination,
  reload,
  requestData,
  requestLoading,
} = requestState;

const forwardedSlotNames = computed(() =>
  Object.keys(slots).filter(
    (name) =>
      !['default', 'title', 'toolbar-left', 'toolbar-right', 'toolbar-batch'].includes(name),
  ),
);

// 配置 request 时完全使用异步结果；未配置时保留原生 dataSource 行为。
const tableData = computed(() => (props.request ? requestData.value : nativeDataSource.value));

const mergedLoading = computed<TableProps<TRecord>['loading']>(() => {
  if (!requestLoading.value) return nativeLoading.value;
  if (nativeLoading.value && typeof nativeLoading.value === 'object') {
    return { ...nativeLoading.value, spinning: true };
  }
  return true;
});

/** 清除 DynamicTable 专属 props，并合并请求、选择和样式状态后交给原生 Table。 */
const mergedTableProps = computed(() => {
  const nextAttrs: TableAttrs = { ...tablePropSource.value };
  [
    'immediate',
    'multiple',
    'single',
    'selection',
    'selectedRowKeys',
    'showToolbar',
    'showRefresh',
    'showFullscreen',
    'toolbarClass',
    'tableClass',
    'tableStyle',
    'title',
  ].forEach((name) => delete nextAttrs[name]);
  delete nextAttrs.class;
  delete nextAttrs.style;
  delete nextAttrs.onChange;
  delete nextAttrs.dataSource;
  delete nextAttrs.loading;
  delete nextAttrs.pagination;
  delete nextAttrs.rowSelection;

  return {
    ...nextAttrs,
    class: props.tableClass,
    dataSource: tableData.value,
    loading: mergedLoading.value,
    pagination: mergedPagination.value,
    rowKey: (nextAttrs.rowKey as TableProps<TRecord>['rowKey']) ?? 'id',
    rowSelection: mergedRowSelection.value,
    style: props.tableStyle,
  } as Partial<TableProps<TRecord>>;
});

/** Vue 事件监听器可能是函数或函数数组，统一透传给原生 Table。 */
function invokeListener(listener: unknown, args: unknown[]): void {
  if (isArray(listener)) {
    listener.forEach((item) => invokeListener(item, args));
    return;
  }
  if (typeof listener === 'function') listener(...args);
}

/** 工具栏刷新同时通知外部并强制绕过查询去重。 */
function handleRefresh(): void {
  emit('refresh');
  void reload();
}

/** 先同步请求分页/筛选/排序，再按原生 Table 约定透传 change 事件。 */
function handleTableChange(...args: ChangeArgs): void {
  const [pagination, nextFilters, nextSorter, extra] = args;
  const { current, pageSize } = handleRequestTableChange(pagination, nextFilters, nextSorter);

  invokeListener(nativeOnChange.value, args);
  emit('change', pagination, nextFilters, nextSorter, extra);
  emit('paginationChange', current, pageSize);
}

defineExpose<DynamicTableInstance<TRecord>>({
  reload,
  clearSelection,
  getSelectedRows: () => [...selectedRows.value],
  getSelectedRowKeys: () => [...selectedRowKeys.value],
  toggleFullscreen,
  getTableInstance: () => tableRef.value,
});
</script>

<style scoped>
.dynamic-table {
  position: relative;
  min-width: 0;
  background: var(--ant-color-bg-container);
}

.dynamic-table :deep(.ant-table-container) {
  overflow: hidden;
  border: 1px solid var(--ant-color-border-secondary);
  border-radius: 6px;
}

.dynamic-table :deep(.ant-table-thead > tr > th) {
  padding-block: 11px;
  border-bottom-color: var(--ant-color-border-secondary);
  background: var(--ant-color-fill-quaternary);
  color: var(--ant-color-text-secondary);
  font-size: 13px;
  font-weight: 600;
}

.dynamic-table :deep(.ant-table-tbody > tr > td) {
  padding-block: 11px;
  border-bottom-color: var(--ant-color-border-secondary);
}

.dynamic-table :deep(.ant-table-tbody > tr:last-child > td) {
  border-bottom: 0;
}

.dynamic-table :deep(.ant-table-tbody > tr.ant-table-row:hover > td) {
  background: var(--ant-color-fill-quaternary);
}

.dynamic-table :deep(.ant-pagination) {
  margin-block: 16px 0;
}

.dynamic-table--fullscreen {
  position: fixed;
  z-index: 900;
  inset: 0;
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  padding: 20px;
  overflow: auto;
  background: var(--ant-color-bg-container);
}

.dynamic-table--fullscreen :deep(.ant-table-wrapper) {
  min-height: 0;
  flex: 1;
}

@media (max-width: 640px) {
  .dynamic-table :deep(.ant-table-thead > tr > th),
  .dynamic-table :deep(.ant-table-tbody > tr > td) {
    padding-block: 10px;
  }

  .dynamic-table--fullscreen {
    padding: 12px;
  }
}
</style>
