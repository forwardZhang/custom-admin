import { onBeforeUnmount, ref, shallowRef } from 'vue';
import { isEqual } from 'lodash-es';

import type {
  DynamicTableFilters,
  DynamicTableRequest,
  DynamicTableRequestResult,
  DynamicTableSorter,
} from '../types';

/** 参与去重比较的查询条件；只包含 request 真正关心的字段。 */
export interface TableRequestQuery<TRecord extends object> {
  current: number;
  pageSize: number;
  filters: DynamicTableFilters<TRecord>;
  sorter: DynamicTableSorter<TRecord>;
}

export interface UseTableRequestOptions<TRecord extends object> {
  getRequest: () => DynamicTableRequest<TRecord> | undefined;
  getQuery: () => TableRequestQuery<TRecord>;
  onSuccess: (result: DynamicTableRequestResult<TRecord>) => void;
  onError: (error: unknown) => void;
}

/**
 * 表格的异步数据源。
 *
 * 三个不变量：新请求取消旧请求（AbortController）、无法取消的过期响应由版本号过滤、
 * 查询条件未变时不重复请求（force 可绕过）。
 */
export function useTableRequest<TRecord extends object>(options: UseTableRequestOptions<TRecord>) {
  const data = shallowRef<TRecord[]>([]);
  const loading = ref(false);
  const error = shallowRef<unknown>();

  let controller: AbortController | undefined;
  let version = 0;
  let lastQuery: TableRequestQuery<TRecord> | undefined;

  /** request 变化时清掉去重记录并中止在途请求，让下一次请求必然发出。 */
  function reset(): void {
    controller?.abort();
    controller = undefined;
    lastQuery = undefined;
  }

  async function load(force = false): Promise<void> {
    const request = options.getRequest();
    if (!request) return;

    const query = options.getQuery();
    if (!force && isEqual(lastQuery, query)) return;
    lastQuery = query;

    controller?.abort();
    const currentController = new AbortController();
    controller = currentController;
    version += 1;
    const currentVersion = version;
    loading.value = true;
    error.value = undefined;

    try {
      const result = await request({ ...query, signal: currentController.signal });
      if (currentController.signal.aborted || currentVersion !== version) return;

      if (!result || !Array.isArray(result.list)) {
        throw new TypeError('[DynamicTable] request 必须返回 { list, total? }');
      }

      data.value = result.list;
      options.onSuccess(result);
    } catch (requestError) {
      if (currentController.signal.aborted || currentVersion !== version) return;
      error.value = requestError;
      options.onError(requestError);
    } finally {
      if (currentVersion === version) {
        loading.value = false;
        controller = undefined;
      }
    }
  }

  onBeforeUnmount(reset);

  return { data, loading, error, load, reset };
}
