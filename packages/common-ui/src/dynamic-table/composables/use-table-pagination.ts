import type { TableProps } from 'antdv-next';

import { computed, reactive } from 'vue';

import { DEFAULT_DYNAMIC_TABLE_PAGINATION } from '../constants/pagination';

import type { DynamicTableChangeArgs } from '../types';

export interface UseTablePaginationOptions<TRecord extends object> {
  getPagination: () => TableProps<TRecord>['pagination'];
  /** 总数是否由 request 提供：配置了 request 且 paginationMode 为 server。 */
  isServerPaged: () => boolean;
}

/**
 * 分页状态：页码与每页条数由组件持有，总数只在服务端分页时参与合并。
 * 本地分页不传 total，让底层 Table 按完整 dataSource 自己算。
 */
export function useTablePagination<TRecord extends object>(
  options: UseTablePaginationOptions<TRecord>,
) {
  const state = reactive({ current: 1, pageSize: 10, total: 0 });

  /** 把配置里的分页同步到内部页码状态。 */
  function syncFromConfig(): void {
    const configured = options.getPagination();
    if (!configured) return;

    state.current = configured.current ?? configured.defaultCurrent ?? state.current;
    state.pageSize = configured.pageSize ?? configured.defaultPageSize ?? state.pageSize;
  }

  syncFromConfig();

  const pagination = computed<TableProps<TRecord>['pagination']>(() => {
    const configured = options.getPagination();
    if (configured === false) return false;

    const merged = {
      ...DEFAULT_DYNAMIC_TABLE_PAGINATION,
      ...(configured ?? {}),
      current: state.current,
      pageSize: state.pageSize,
    };

    return options.isServerPaged() ? { ...merged, total: state.total } : merged;
  });

  /** 底层 Table 的 change 事件带回新的页码与每页条数。 */
  function applyChange(next: DynamicTableChangeArgs<TRecord>[0]): {
    current: number;
    pageSize: number;
  } {
    state.current = next.current ?? 1;
    state.pageSize = next.pageSize ?? state.pageSize;

    return { current: state.current, pageSize: state.pageSize };
  }

  function resetPage(): void {
    state.current = 1;
  }

  function setTotal(total: number): void {
    state.total = total;
  }

  return { state, pagination, syncFromConfig, applyChange, resetPage, setTotal };
}
