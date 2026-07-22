import type { Component } from 'vue';

import { defineComponent, h, shallowRef } from 'vue';

import DynamicTable from '../components/dynamic-table.vue';

import type {
  DynamicTableApi,
  DynamicTableChangeArgs,
  DynamicTableInstance,
  DynamicTableKey,
  DynamicTableRequestResult,
  UseDynamicTableOptions,
} from '../types';

type TableAttrs = Record<string, unknown>;

/** Vue 事件监听器可能是函数或函数数组，统一透传给包装组件。 */
function invokeListener(listener: unknown, args: unknown[]): void {
  if (Array.isArray(listener)) {
    listener.forEach((item) => invokeListener(item, args));
    return;
  }
  if (typeof listener === 'function') listener(...args);
}

/**
 * 创建由运行时状态驱动的动态表格组件，并返回对应的命令式 API。
 * 业务回调使用 handle 前缀，包装层会消费它们，避免回调继续落到底层 Antdv Table。
 */
export function useDynamicTable<TRecord extends object = Record<string, unknown>>(
  options: UseDynamicTableOptions<TRecord>,
) {
  const state = shallowRef({ ...options });
  const tableRef = shallowRef<DynamicTableInstance<TRecord>>();
  const selectedRowKeys = shallowRef<DynamicTableKey[]>([...(options.selectedRowKeys ?? [])]);
  const selectedRows = shallowRef<TRecord[]>([]);

  function setSelectedRowKeys(keys: DynamicTableKey[]): void {
    selectedRowKeys.value = [...keys];
  }

  const tableApi: DynamicTableApi<TRecord> = {
    get selectedRowKeys() {
      return [...(tableRef.value?.getSelectedRowKeys() ?? selectedRowKeys.value)];
    },
    get selectedRows() {
      return [...(tableRef.value?.getSelectedRows() ?? selectedRows.value)];
    },
    reload: (reloadOptions) => tableRef.value?.reload(reloadOptions) ?? Promise.resolve(),
    clearSelection: () => {
      tableRef.value?.clearSelection();
      setSelectedRowKeys([]);
      selectedRows.value = [];
    },
    getSelectedRows: () => [...(tableRef.value?.getSelectedRows() ?? selectedRows.value)],
    getSelectedRowKeys: () => [...(tableRef.value?.getSelectedRowKeys() ?? selectedRowKeys.value)],
    toggleFullscreen: (force) => tableRef.value?.toggleFullscreen(force),
    getTableInstance: () => tableRef.value?.getTableInstance(),
    setState: (nextState) => {
      state.value = { ...state.value, ...nextState };
      if ('selectedRowKeys' in nextState) {
        setSelectedRowKeys(nextState.selectedRowKeys ?? []);
      }
    },
  };

  const Table = defineComponent({
    name: 'UseDynamicTable',
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () => {
        const {
          handleChange,
          handleSelectionChange,
          handleSelectedRowKeysChange,
          handleRequestSuccess,
          handleRequestError,
          handleRefresh,
          handleFullscreenChange,
          handlePaginationChange,
          ...tableOptions
        } = state.value;

        const tableProps: TableAttrs = {
          ...tableOptions,
          ...attrs,
          selectedRowKeys: selectedRowKeys.value,
          ref: (instance: unknown) => {
            tableRef.value = instance as DynamicTableInstance<TRecord> | undefined;
          },
          onChange: (...args: DynamicTableChangeArgs<TRecord>) => {
            handleChange?.(...args);
            invokeListener(attrs.onChange, args);
          },
          'onUpdate:selectedRowKeys': (keys: DynamicTableKey[]) => {
            setSelectedRowKeys(keys);
            handleSelectedRowKeysChange?.([...keys]);
            invokeListener(attrs['onUpdate:selectedRowKeys'], [keys]);
          },
          onSelectionChange: (keys: DynamicTableKey[], rows: TRecord[]) => {
            setSelectedRowKeys(keys);
            selectedRows.value = [...rows];
            handleSelectionChange?.([...keys], [...rows]);
            invokeListener(attrs.onSelectionChange, [keys, rows]);
          },
          onRequestSuccess: (result: DynamicTableRequestResult<TRecord>) => {
            handleRequestSuccess?.(result);
            invokeListener(attrs.onRequestSuccess, [result]);
          },
          onRequestError: (error: unknown) => {
            handleRequestError?.(error);
            invokeListener(attrs.onRequestError, [error]);
          },
          onRefresh: () => {
            handleRefresh?.();
            invokeListener(attrs.onRefresh, []);
          },
          onFullscreenChange: (fullscreen: boolean) => {
            handleFullscreenChange?.(fullscreen);
            invokeListener(attrs.onFullscreenChange, [fullscreen]);
          },
          onPaginationChange: (current: number, pageSize: number) => {
            handlePaginationChange?.(current, pageSize);
            invokeListener(attrs.onPaginationChange, [current, pageSize]);
          },
        };

        return h(DynamicTable as Component, tableProps, slots);
      };
    },
  });

  return [Table, tableApi] as const;
}
