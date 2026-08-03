import { defineComponent } from 'vue';

import DynamicTable from '../components/dynamic-table.vue';
import { renderDynamicHost, useDynamicHost } from '../../internal/define-dynamic-hook';
import { createTableApiDefinition } from '../core/api-definition';

import type { DynamicTableApi, DynamicTableEventProps, DynamicTableProps } from '../types';

/**
 * 返回绑定了泛型的表格组件与引用稳定的命令式 API。
 * 配置全部写在模板上（与直接使用 DynamicTable 完全一致），Hook 只解决泛型推断与 api 取用。
 */
export function useDynamicTable<TRecord extends object = Record<string, unknown>>() {
  const { instance, api } = useDynamicHost<DynamicTableApi<TRecord>>(
    'DynamicTable',
    createTableApiDefinition<TRecord>(),
  );

  const Table = defineComponent(
    (_props: DynamicTableProps<TRecord> & DynamicTableEventProps<TRecord>, ctx) =>
      renderDynamicHost(DynamicTable, instance, ctx),
    { name: 'UseDynamicTable', inheritAttrs: false },
  );

  return [Table, api] as const;
}
