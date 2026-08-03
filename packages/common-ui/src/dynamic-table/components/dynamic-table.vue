<template>
  <div
    ref="rootRef"
    class="dynamic-table"
    :class="[
      { 'dynamic-table--fullscreen': isFullscreen, 'dynamic-table--fill': props.fill },
      attrs.class,
    ]"
    :style="attrs.style"
  >
    <DynamicTableToolbar
      v-if="props.showToolbar"
      :batch-mode="selection.batchMode.value"
      :clear-selection="selection.clearSelection"
      :fullscreen="isFullscreen"
      :loading="requestLoading"
      :reload="reload"
      :selected-row-keys="selection.selectedRowKeys.value"
      :selected-rows="selection.selectedRows.value"
      :title="props.title"
      :show-fullscreen="props.showFullscreen"
      :show-refresh="props.showRefresh"
      :toolbar-class="props.toolbarClass"
      @refresh="handleRefresh"
      @toggle-fullscreen="toggleFullscreen()"
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
      class="dynamic-table__table"
      :bordered="props.bordered"
      :class="props.tableClass"
      :columns="props.columns"
      :data-source="tableData"
      :loading="mergedLoading"
      :pagination="pagination.pagination.value"
      :row-key="props.rowKey"
      :row-selection="selection.rowSelection.value"
      :scroll="mergedScroll"
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
import { computed, onMounted, ref, shallowRef, useAttrs, useSlots, watch } from 'vue';

import DynamicTableToolbar from './dynamic-table-toolbar.vue';
import { useDynamicTableFillEffect } from '../composables/use-dynamic-table-fill';
import { useDynamicTableFullscreenEffect } from '../composables/use-dynamic-table-fullscreen';
import { useTablePagination } from '../composables/use-table-pagination';
import { useTableRequest } from '../composables/use-table-request';
import { useTableSelection } from '../composables/use-table-selection';

import type {
  DynamicTableApi,
  DynamicTableChangeArgs,
  DynamicTableEmits,
  DynamicTableNativeInstance,
  DynamicTableProps,
  DynamicTableReloadOptions,
  DynamicTableFilters,
  DynamicTableSorter,
} from '../types';

defineOptions({ name: 'DynamicTable', inheritAttrs: false });

// 配置只从 props 来；默认值只写在这里一处。
const props = withDefaults(defineProps<DynamicTableProps<TRecord>>(), {
  columns: undefined,
  dataSource: undefined,
  rowKey: 'id',
  loading: undefined,
  pagination: undefined,
  scroll: undefined,
  fill: false,
  size: undefined,
  bordered: true,
  tableProps: undefined,
  request: undefined,
  paginationMode: 'server',
  immediate: true,
  selection: 'multiple',
  rowSelection: undefined,
  selectedRowKeys: undefined,
  title: undefined,
  showToolbar: true,
  showRefresh: true,
  showFullscreen: true,
  toolbarClass: undefined,
  tableClass: undefined,
  tableStyle: undefined,
});

const emit = defineEmits<DynamicTableEmits<TRecord>>();

const attrs = useAttrs();
const slots = useSlots();
const rootRef = shallowRef<HTMLElement | null>(null);
const tableRef = shallowRef<DynamicTableNativeInstance>();
const isFullscreen = ref(false);
/** 撑满模式下量出的表体高度，测量完成前为 undefined。 */
const fillScrollY = shallowRef<number | undefined>();

const filters = shallowRef<DynamicTableFilters<TRecord>>({});
const sorter = shallowRef<DynamicTableSorter<TRecord>>([]);

/** 服务端分页才把 total 交给底层 Table；本地分页由它按完整数据自己算。 */
const isServerPaged = () => Boolean(props.request) && props.paginationMode === 'server';

const pagination = useTablePagination<TRecord>({
  getPagination: () => props.pagination,
  isServerPaged,
});

const selection = useTableSelection<TRecord>({
  getMode: () => props.selection,
  getRowSelection: () => props.rowSelection,
  getSelectedRowKeys: () => props.selectedRowKeys,
  onChange(keys, rows) {
    emit('update:selectedRowKeys', keys);
    emit('selectionChange', keys, rows);
  },
});

const request = useTableRequest<TRecord>({
  getRequest: () => props.request,
  getQuery: () => ({
    current: pagination.state.current,
    pageSize: pagination.state.pageSize,
    filters: filters.value,
    sorter: sorter.value,
  }),
  onSuccess(result) {
    pagination.setTotal(result.total ?? result.list.length);
    emit('requestSuccess', result);
  },
  onError(error) {
    emit('requestError', error);
  },
});

const { data: requestData, loading: requestLoading } = request;

// 配置 request 时完全使用异步结果；未配置时保留原生 dataSource 行为。
const tableData = computed<TableProps<TRecord>['dataSource']>(() =>
  props.request ? requestData.value : props.dataSource,
);

const mergedLoading = computed<TableProps<TRecord>['loading']>(() => {
  if (!requestLoading.value) return props.loading;
  if (props.loading && typeof props.loading === 'object') {
    return { ...props.loading, spinning: true };
  }
  return true;
});

/**
 * 撑满模式只是把量出的高度填进官方 scroll.y，让底层 Table 自己渲染固定表头与滚动表体。
 * 显式配置的 scroll.y 优先，测量结果不覆盖业务给定的上限。
 */
const mergedScroll = computed<TableProps<TRecord>['scroll']>(() => {
  if (!props.fill) return props.scroll;

  const y = props.scroll?.y ?? fillScrollY.value;
  return y === undefined ? props.scroll : { ...props.scroll, y };
});

async function reload(options: DynamicTableReloadOptions = {}): Promise<void> {
  if (options.resetPage) pagination.resetPage();
  await request.load(true);
}

/** 切换全屏；body 滚动锁定与 Escape 监听由 useDynamicTableFullscreenEffect 负责。 */
function toggleFullscreen(force?: boolean): void {
  const nextValue = force ?? !isFullscreen.value;
  if (nextValue === isFullscreen.value) return;

  isFullscreen.value = nextValue;
  emit('fullscreenChange', nextValue);
}

useDynamicTableFullscreenEffect({
  isFullscreen,
  exit: () => toggleFullscreen(false),
});

// 撑满模式下把容器剩余高度量成 scroll.y，走 Table 的官方滚动配置。
useDynamicTableFillEffect({
  fill: computed(() => props.fill),
  rootRef,
  getTableElement: () => tableRef.value?.nativeElement ?? undefined,
  scrollY: fillScrollY,
});

// request 换了函数就重新取数：先中止在途请求并清掉去重记录。
watch(
  () => props.request,
  () => {
    request.reset();
    if (props.immediate) void request.load(true);
  },
);

watch(() => props.pagination, pagination.syncFromConfig, { deep: true });

// 不强制请求：挂载前排队的 reload 已经取过一次数，这里会被查询去重挡掉。
onMounted(() => {
  if (props.request && props.immediate) void request.load();
});

const forwardedSlotNames = computed(() =>
  Object.keys(slots).filter(
    (name) =>
      !['default', 'title', 'toolbar-left', 'toolbar-right', 'toolbar-batch'].includes(name),
  ),
);

/** 工具栏刷新同时通知外部并强制绕过查询去重。 */
function handleRefresh(): void {
  emit('refresh');
  void reload();
}

/** 先同步请求条件，再按原生 Table 约定透传 change 事件。 */
function handleTableChange(...args: DynamicTableChangeArgs<TRecord>): void {
  const [nextPagination, nextFilters, nextSorter, extra] = args;
  filters.value = nextFilters;
  sorter.value = nextSorter;
  const { current, pageSize } = pagination.applyChange(nextPagination);

  // 本地分页下切页与排序都由底层 Table 完成，不重新请求。
  if (isServerPaged()) void request.load();

  emit('change', nextPagination, nextFilters, nextSorter, extra);
  emit('paginationChange', current, pageSize);
}

const tableApi: DynamicTableApi<TRecord> = {
  get selectedRowKeys() {
    return [...selection.selectedRowKeys.value];
  },
  get selectedRows() {
    return [...selection.selectedRows.value];
  },
  get loading() {
    return requestLoading.value;
  },
  reload,
  clearSelection: selection.clearSelection,
  toggleFullscreen,
  getNativeInstance: () => tableRef.value,
};

defineExpose<DynamicTableApi<TRecord>>(tableApi);
</script>

<style scoped lang="less">
.dynamic-table {
  position: relative;
  min-width: 0;
  background: var(--ant-color-bg-container);
}

/* 撑满模式：根节点吃满父容器高度，表体高度由量出的 scroll.y 决定，不改底层结构样式。 */
.dynamic-table--fill {
  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
}
.dynamic-table__table {
  :deep(.ant-pagination) {
    margin-bottom: 0;
  }
}
</style>
