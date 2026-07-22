import type { TablePaginationConfig, TableProps } from 'antdv-next';
import { computed, onBeforeUnmount, onMounted, reactive, shallowRef, watch } from 'vue';
import { isArray, isEqual, isObject } from 'lodash-es';

import type {
  DynamicTableChangeArgs,
  DynamicTableReloadOptions,
  DynamicTableRequest,
  DynamicTableRequestResult,
} from '../types';

export type { DynamicTableChangeArgs } from '../types';

type RequestMode = 'array' | 'paged' | undefined;
type RequestQuery<TRecord extends object> = {
  current: number;
  pageSize: number;
  filters: DynamicTableChangeArgs<TRecord>[1];
  sorter: DynamicTableChangeArgs<TRecord>[2];
};

interface UseDynamicTableRequestOptions<TRecord extends object> {
  request: () => DynamicTableRequest<TRecord> | undefined;
  immediate: () => boolean;
  pagination: () => TableProps<TRecord>['pagination'];
  onSuccess: (result: DynamicTableRequestResult<TRecord>) => void;
  onError: (error: unknown) => void;
}

export const DEFAULT_DYNAMIC_TABLE_PAGINATION: TablePaginationConfig = {
  defaultCurrent: 1,
  defaultPageSize: 10,
  pageSizeOptions: [10, 20, 50, 100],
  showQuickJumper: true,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`,
};

/** 统一处理异步数据源、服务端分页和表格变更查询参数。 */
export function useDynamicTableRequest<TRecord extends object>({
  request,
  immediate,
  pagination,
  onSuccess,
  onError,
}: UseDynamicTableRequestOptions<TRecord>) {
  const requestData = shallowRef<TRecord[]>([]);
  const requestLoading = shallowRef(false);
  const requestError = shallowRef<unknown>();
  const requestMode = shallowRef<RequestMode>();
  const filters = shallowRef<DynamicTableChangeArgs<TRecord>[1]>({});
  const sorter = shallowRef<DynamicTableChangeArgs<TRecord>[2]>([]);
  const requestVersion = shallowRef(0);
  const lastRequestQuery = shallowRef<RequestQuery<TRecord>>();
  const pageState = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  let abortController: AbortController | undefined;

  const mergedPagination = computed<TableProps<TRecord>['pagination']>(() => {
    const configuredPagination = pagination();
    if (configuredPagination === false) return false;

    const merged = {
      ...DEFAULT_DYNAMIC_TABLE_PAGINATION,
      ...(configuredPagination ?? {}),
      current: pageState.current,
      pageSize: pageState.pageSize,
    };

    if (request() && requestMode.value === 'paged') {
      return {
        ...merged,
        total: pageState.total,
      };
    }

    return merged;
  });

  /** 只把 request 关心的分页/筛选/排序字段纳入去重比较。 */
  function getRequestQuery(): RequestQuery<TRecord> {
    return {
      current: pageState.current,
      pageSize: pageState.pageSize,
      filters: filters.value,
      sorter: sorter.value,
    };
  }

  /** 判断 request 是否返回服务端分页格式，而不是一次性数组。 */
  function isPagedResult(
    result: DynamicTableRequestResult<TRecord>,
  ): result is Extract<
    DynamicTableRequestResult<TRecord>,
    { data: { list: TRecord[]; total: number } }
  > {
    return (
      isObject(result) &&
      !isArray(result) &&
      isObject(result.data) &&
      isArray(result.data.list) &&
      typeof result.data.total === 'number'
    );
  }

  /** 执行一次请求；新请求会取消旧请求，版本号再过滤无法取消的过期响应。 */
  async function loadData(force = false): Promise<void> {
    const currentRequest = request();
    if (!currentRequest) return;

    const query = getRequestQuery();
    if (!force && isEqual(lastRequestQuery.value, query)) return;
    lastRequestQuery.value = query;

    abortController?.abort();
    const controller = new AbortController();
    abortController = controller;
    const currentVersion = requestVersion.value + 1;
    requestVersion.value = currentVersion;
    requestLoading.value = true;
    requestError.value = undefined;

    try {
      const result = await currentRequest({ ...query, signal: controller.signal });
      if (controller.signal.aborted || currentVersion !== requestVersion.value) return;

      if (isPagedResult(result)) {
        requestMode.value = 'paged';
        requestData.value = result.data.list;
        pageState.total = result.data.total;
      } else if (isArray(result)) {
        requestMode.value = 'array';
        requestData.value = result;
        pageState.total = result.length;
      } else {
        throw new TypeError(
          '[DynamicTable] request must return an array or { data: { list, total } }',
        );
      }

      onSuccess(result);
    } catch (error) {
      if (controller.signal.aborted || currentVersion !== requestVersion.value) return;
      requestError.value = error;
      onError(error);
    } finally {
      if (currentVersion === requestVersion.value) {
        requestLoading.value = false;
        abortController = undefined;
      }
    }
  }

  /** 对外刷新入口，force 确保相同查询条件也会重新请求。 */
  async function reload(options: DynamicTableReloadOptions = {}): Promise<void> {
    if (options.resetPage) pageState.current = 1;
    await loadData(true);
  }

  /** 同步 Table 变化到请求状态；数组模式下不重复触发服务端分页请求。 */
  function handleTableChange(
    paginationValue: DynamicTableChangeArgs<TRecord>[0],
    nextFilters: DynamicTableChangeArgs<TRecord>[1],
    nextSorter: DynamicTableChangeArgs<TRecord>[2],
  ): { current: number; pageSize: number } {
    const nextCurrent = paginationValue.current ?? 1;
    const nextPageSize = paginationValue.pageSize ?? pageState.pageSize;
    pageState.current = nextCurrent;
    pageState.pageSize = nextPageSize;
    filters.value = nextFilters;
    sorter.value = nextSorter;

    if (request() && requestMode.value !== 'array') void loadData();

    return { current: nextCurrent, pageSize: nextPageSize };
  }

  watch(
    pagination,
    (configuredPagination) => {
      if (!configuredPagination) return;
      pageState.current =
        configuredPagination.current ?? configuredPagination.defaultCurrent ?? pageState.current;
      pageState.pageSize =
        configuredPagination.pageSize ?? configuredPagination.defaultPageSize ?? pageState.pageSize;
    },
    { immediate: true, deep: true },
  );

  watch(request, () => {
    abortController?.abort();
    requestMode.value = undefined;
    lastRequestQuery.value = undefined;
    if (immediate()) void loadData(true);
  });

  onMounted(() => {
    if (request() && immediate()) void loadData(true);
  });

  onBeforeUnmount(() => {
    abortController?.abort();
  });

  return {
    handleTableChange,
    loadData,
    mergedPagination,
    pageState,
    reload,
    requestData,
    requestError,
    requestLoading,
    requestMode,
  };
}
