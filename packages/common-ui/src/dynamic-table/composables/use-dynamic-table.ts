import type { Component } from 'vue';

import { defineComponent, h } from 'vue';

import DynamicTable from '../components/dynamic-table.vue';
import { DynamicTableState } from '../core/table-state';

import type { UseDynamicTableOptions } from '../types';

/**
 * 创建由运行时状态驱动的动态表格组件，并返回对应的命令式 API。
 * State 在这里创建，通过 tableState prop 交给 DynamicTable 复用；
 * 业务回调（handle 前缀）由 DynamicTable 从 State 里读取并调用，不会落到底层 Antdv Table。
 */
export function useDynamicTable<TRecord extends object = Record<string, unknown>>(
  options: UseDynamicTableOptions<TRecord>,
) {
  const tableState = new DynamicTableState<TRecord>(options);

  const Table = defineComponent(
    (_props, { attrs, slots }) => {
      return () => h(DynamicTable as Component, { ...attrs, tableState }, slots);
    },
    {
      name: 'UseDynamicTable',
      inheritAttrs: false,
    },
  );

  return [Table, tableState.api] as const;
}
