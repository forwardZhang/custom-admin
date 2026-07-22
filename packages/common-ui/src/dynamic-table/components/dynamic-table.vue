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

    <Table
      ref="tableRef"
      :bordered="props.bordered"
      :class="props.tableClass"
      :columns="props.columns"
      :data-source="tableData"
      :loading="mergedLoading"
      :pagination="mergedPagination"
      :row-key="props.rowKey"
      :row-selection="mergedRowSelection"
      :scroll="props.scroll"
      :size="props.size"
      :style="props.tableStyle"
      v-bind="props.tableProps"
      @change="handleTableChange"
    >
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

const props = withDefaults(defineProps<DynamicTablePublicProps<TRecord>>(), {
  immediate: true,
  showFullscreen: true,
  showRefresh: true,
  showToolbar: true,
  toolbarClass: undefined,
  tableClass: undefined,
  tableStyle: undefined,
  rowKey: 'id',
});

type ChangeArgs = DynamicTableChangeArgs<TRecord>;

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
const tableTitle = computed(() => props.title);

// 选择、请求、全屏分别封装，组件这里只负责把状态拼装成 Table 和工具栏需要的 props。
const selectionState = useDynamicTableSelection({
  props,
  emitSelectedRowKeys: (keys) => emit('update:selectedRowKeys', keys),
  emitSelectionChange: (keys, rows) => emit('selectionChange', keys, rows),
});

const requestState = useDynamicTableRequest({
  request: () => props.request,
  immediate: () => props.immediate,
  pagination: () => props.pagination,
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
const tableData = computed(() => (props.request ? requestData.value : props.dataSource));

const mergedLoading = computed<TableProps<TRecord>['loading']>(() => {
  if (!requestLoading.value) return props.loading;
  if (props.loading && typeof props.loading === 'object') {
    return { ...props.loading, spinning: true };
  }
  return true;
});

/** 工具栏刷新同时通知外部并强制绕过查询去重。 */
function handleRefresh(): void {
  emit('refresh');
  void reload();
}

/** 先同步请求分页/筛选/排序，再按原生 Table 约定透传 change 事件。 */
function handleTableChange(...args: ChangeArgs): void {
  const [pagination, nextFilters, nextSorter, extra] = args;
  const { current, pageSize } = handleRequestTableChange(pagination, nextFilters, nextSorter);

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
</style>
