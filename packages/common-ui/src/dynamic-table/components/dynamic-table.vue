<template>
  <div
    ref="rootRef"
    class="dynamic-table"
    :class="[
      { 'dynamic-table--fullscreen': isFullscreen, 'dynamic-table--fill': resolved.fill },
      attrs.class,
    ]"
    :style="attrs.style"
  >
    <DynamicTableToolbar
      v-if="resolved.showToolbar"
      :batch-mode="batchMode"
      :clear-selection="handleClearSelection"
      :fullscreen="isFullscreen"
      :loading="requestLoading"
      :reload="handleReload"
      :selected-row-keys="selectedRowKeys"
      :selected-rows="selectedRows"
      :title="options.title"
      :show-fullscreen="resolved.showFullscreen"
      :show-refresh="resolved.showRefresh"
      :toolbar-class="options.toolbarClass"
      @refresh="handleRefresh"
      @toggle-fullscreen="handleToggleFullscreen"
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
      :bordered="options.bordered"
      :class="options.tableClass"
      :columns="options.columns"
      :data-source="tableData"
      :loading="mergedLoading"
      :pagination="mergedPagination"
      :row-key="resolved.rowKey"
      :row-selection="mergedRowSelection"
      :scroll="mergedScroll"
      :size="options.size"
      :style="options.tableStyle"
      v-bind="options.tableProps"
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

<script setup lang="ts">
import { Table } from 'antdv-next';
import { computed, onBeforeUnmount, onMounted, shallowRef, useAttrs, useSlots, watch } from 'vue';

import DynamicTableToolbar from './dynamic-table-toolbar.vue';
import { useDynamicTableFillEffect } from '../composables/use-dynamic-table-fill';
import { useDynamicTableFullscreenEffect } from '../composables/use-dynamic-table-fullscreen';
import { DynamicTableState } from '../core/table-state';

import type { DynamicTableInternalProps } from '../core/internal-props';
import type {
  DynamicTableApi,
  DynamicTableChangeArgs,
  DynamicTableKey,
  DynamicTableNativeInstance,
  DynamicTableReloadOptions,
  DynamicTableRequestResult,
  UseDynamicTableOptions,
} from '../types';

defineOptions({ name: 'DynamicTable', inheritAttrs: false });

// 组件模式读 props 自建 State；Hook / DynamicPage 模式通过 tableState prop 复用同一份 State。
const props = withDefaults(defineProps<DynamicTableInternalProps>(), {
  immediate: true,
  showFullscreen: true,
  showRefresh: true,
  showToolbar: true,
  toolbarClass: undefined,
  tableClass: undefined,
  tableStyle: undefined,
  rowKey: 'id',
  tableState: undefined,
});

/** 组件模式不声明 SFC 泛型，行数据按宽松记录类型处理；精确类型由 Hook 与公开类型提供。 */
type TableRecord = Record<string, unknown>;
type ChangeArgs = DynamicTableChangeArgs;

const emit = defineEmits<{
  change: ChangeArgs;
  'update:selectedRowKeys': [keys: DynamicTableKey[]];
  selectionChange: [keys: DynamicTableKey[], rows: TableRecord[]];
  requestSuccess: [result: DynamicTableRequestResult];
  requestError: [error: unknown];
  refresh: [];
  fullscreenChange: [fullscreen: boolean];
  paginationChange: [current: number, pageSize: number];
}>();

const attrs = useAttrs();
const slots = useSlots();
const rootRef = shallowRef<HTMLElement | null>(null);
const tableRef = shallowRef<DynamicTableNativeInstance>();

/** 从 props 里摘出配置部分，tableState 只是传递载体，不属于运行时配置。 */
function pickOptions(): UseDynamicTableOptions {
  const { tableState: _tableState, ...options } = props;
  return options as UseDynamicTableOptions;
}

const ownsState = !props.tableState;
const tableState =
  props.tableState ?? new DynamicTableState<TableRecord>(pickOptions(), { propsDriven: true });

const options = computed(() => tableState.state.value);
const {
  batchMode,
  fillScrollY,
  isFullscreen,
  mergedLoading,
  mergedPagination,
  mergedRowSelection,
  mergedScroll,
  requestLoading,
  resolved,
  selectedRowKeys,
  selectedRows,
  tableData,
} = tableState;

tableState.attach({
  tableRef,
  callbacks: {
    onSelectedRowKeysChange(keys) {
      emit('update:selectedRowKeys', keys);
      options.value.handleSelectedRowKeysChange?.([...keys]);
    },
    onSelectionChange(keys, rows) {
      emit('selectionChange', keys, rows);
      options.value.handleSelectionChange?.([...keys], [...rows]);
    },
    onRequestSuccess(result) {
      emit('requestSuccess', result);
      options.value.handleRequestSuccess?.(result);
    },
    onRequestError(error) {
      emit('requestError', error);
      options.value.handleRequestError?.(error);
    },
    onFullscreenChange(fullscreen) {
      emit('fullscreenChange', fullscreen);
      options.value.handleFullscreenChange?.(fullscreen);
    },
  },
});

useDynamicTableFullscreenEffect({
  isFullscreen,
  exit: () => tableState.toggleFullscreen(false),
});

// 撑满模式下把容器剩余高度量成 scroll.y，走 Table 的官方滚动配置。
useDynamicTableFillEffect({
  fill: computed(() => resolved.value.fill),
  rootRef,
  getTableElement: () => tableRef.value?.nativeElement ?? undefined,
  scrollY: fillScrollY,
});

// 组件模式下 props 是唯一配置来源；Hook 模式不建立这条同步，否则会与渲染成环。
if (ownsState) {
  watch(
    () => pickOptions(),
    (nextOptions) => tableState.syncOptions(nextOptions),
    { deep: true },
  );
}

watch(
  () => tableState.request,
  () => tableState.handleRequestChange(),
);

watch(
  () => options.value.pagination,
  () => tableState.syncPaginationConfig(),
  { deep: true },
);

onMounted(() => void tableState.flushMount());

onBeforeUnmount(() => tableState.detach());

const forwardedSlotNames = computed(() =>
  Object.keys(slots).filter(
    (name) =>
      !['default', 'title', 'toolbar-left', 'toolbar-right', 'toolbar-batch'].includes(name),
  ),
);

const handleClearSelection = () => tableState.clearSelection();
const handleReload = (reloadOptions?: DynamicTableReloadOptions) =>
  tableState.reload(reloadOptions);
const handleToggleFullscreen = () => tableState.toggleFullscreen();

/** 工具栏刷新同时通知外部并强制绕过查询去重。 */
function handleRefresh(): void {
  emit('refresh');
  options.value.handleRefresh?.();
  void tableState.reload();
}

/** 先同步请求分页/筛选/排序，再按原生 Table 约定透传 change 事件。 */
function handleTableChange(...args: ChangeArgs): void {
  const [pagination, nextFilters, nextSorter, extra] = args;
  const { current, pageSize } = tableState.handleTableChange(pagination, nextFilters, nextSorter);

  emit('change', pagination, nextFilters, nextSorter, extra);
  options.value.handleChange?.(...args);
  emit('paginationChange', current, pageSize);
  options.value.handlePaginationChange?.(current, pageSize);
}

defineExpose<DynamicTableApi>(tableState.api);
</script>

<style scoped>
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
</style>
