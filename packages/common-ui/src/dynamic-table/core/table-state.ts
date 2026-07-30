import type { TableProps, TableRowSelection } from 'antdv-next';
import type { ComputedRef, Ref, ShallowRef } from 'vue';

import { isArray, isEqual } from 'lodash-es';
import { computed, reactive, ref, shallowRef } from 'vue';

import { createAttachGuard } from '../../internal/attach-guard';
import { bindApiMethods, createApiObject } from '../../internal/create-api';
import { DEFAULT_DYNAMIC_TABLE_PAGINATION, isPagedResult } from './request-utils';

import type {
  DynamicTableApi,
  DynamicTableChangeArgs,
  DynamicTableKey,
  DynamicTableNativeInstance,
  DynamicTableReloadOptions,
  DynamicTableRequest,
  DynamicTableRequestResult,
  DynamicTableSelection,
  UseDynamicTableOptions,
} from '../types';

type RequestMode = 'array' | 'paged' | undefined;

interface RequestQuery<TRecord extends object> {
  current: number;
  pageSize: number;
  filters: DynamicTableChangeArgs<TRecord>[1];
  sorter: DynamicTableChangeArgs<TRecord>[2];
}

/** 宿主组件把 emit 汇入这里，业务侧的 handleXxx 由宿主一并调用。 */
interface TableApiCallbacks<TRecord extends object> {
  onSelectedRowKeysChange?: (keys: DynamicTableKey[]) => void;
  onSelectionChange?: (keys: DynamicTableKey[], rows: TRecord[]) => void;
  onRequestSuccess?: (result: DynamicTableRequestResult<TRecord>) => void;
  onRequestError?: (error: unknown) => void;
  onFullscreenChange?: (fullscreen: boolean) => void;
}

interface DynamicTableAttachOptions<TRecord extends object> {
  tableRef: ShallowRef<DynamicTableNativeInstance | undefined>;
  callbacks: TableApiCallbacks<TRecord>;
}

export interface DynamicTableStateConfig<TRecord extends object> {
  /** 组件模式下配置由 props 驱动，此时 setState 会提示改动可能被覆盖。 */
  propsDriven?: boolean;
  /** 组合组件（如 DynamicPage）在构造期包裹 request，避免运行时改写 API 方法。 */
  requestDecorator?: (request: DynamicTableRequest<TRecord>) => DynamicTableRequest<TRecord>;
}

const TABLE_API_METHODS = [
  'reload',
  'clearSelection',
  'getSelectedRows',
  'getSelectedRowKeys',
  'toggleFullscreen',
  'getTableInstance',
  'setState',
] as const satisfies readonly (keyof DynamicTableApi)[];

/**
 * 表格状态与命令式 API 的唯一实现。
 * DynamicTable 组件和 useDynamicTable 都挂在这上面，不另起一套状态。
 * 只持有状态与纯派生，DOM 副作用（全屏锁定、键盘监听）和生命周期留给宿主组件。
 */
export class DynamicTableState<TRecord extends object = Record<string, unknown>> {
  readonly api: DynamicTableApi<TRecord>;
  readonly state: Ref<UseDynamicTableOptions<TRecord>>;

  readonly selectedRowKeys: Ref<DynamicTableKey[]>;
  readonly selectedRows: ShallowRef<TRecord[]>;
  readonly isFullscreen: Ref<boolean> = ref(false);
  readonly requestData: ShallowRef<TRecord[]> = shallowRef([]);
  readonly requestLoading: Ref<boolean> = shallowRef(false);
  readonly requestError: ShallowRef<unknown> = shallowRef();

  readonly selectionType: ComputedRef<DynamicTableSelection> = computed(() => {
    const options = this.state.value;

    // multiple 明确为 true 时优先级最高，覆盖 single=true。
    if (options.multiple === true) return 'checkbox';
    if (options.single === true) return 'radio';
    if (options.multiple === false) return false;

    // 旧 selection API 只在新开关都未配置时生效。
    if (options.multiple === undefined && options.single === undefined) {
      return options.selection ?? 'checkbox';
    }

    return 'checkbox';
  });

  readonly batchMode: ComputedRef<boolean> = computed(
    () => this.selectionType.value === 'checkbox' && this.selectedRowKeys.value.length > 0,
  );

  // 受控 selectedRowKeys 只作为输入同步到内部状态，事件回调始终返回新数组，避免引用被外部修改。
  readonly mergedRowSelection: ComputedRef<TableRowSelection<TRecord> | undefined> = computed(
    () => {
      if (this.selectionType.value === false) return undefined;

      const configuredSelection = this.state.value.rowSelection;
      const configuredOnChange = configuredSelection?.onChange;

      return {
        ...configuredSelection,
        type: this.selectionType.value,
        selectedRowKeys: this.selectedRowKeys.value,
        onChange: (
          keys: DynamicTableKey[],
          rows: TRecord[],
          info: Parameters<NonNullable<typeof configuredOnChange>>[2],
        ) => {
          this.selectedRowKeys.value = [...keys];
          this.selectedRows.value = [...rows];
          this.callbacks.onSelectedRowKeysChange?.([...keys]);
          this.callbacks.onSelectionChange?.([...keys], [...rows]);
          configuredOnChange?.(keys, rows, info);
        },
      };
    },
  );

  readonly mergedPagination: ComputedRef<TableProps<TRecord>['pagination']> = computed(() => {
    const configuredPagination = this.state.value.pagination;
    if (configuredPagination === false) return false;

    const merged = {
      ...DEFAULT_DYNAMIC_TABLE_PAGINATION,
      ...(configuredPagination ?? {}),
      current: this.pageState.current,
      pageSize: this.pageState.pageSize,
    };

    if (this.request && this.requestMode.value === 'paged') {
      return { ...merged, total: this.pageState.total };
    }

    return merged;
  });

  // 配置 request 时完全使用异步结果；未配置时保留原生 dataSource 行为。
  readonly tableData: ComputedRef<TableProps<TRecord>['dataSource']> = computed(() =>
    this.state.value.request ? this.requestData.value : this.state.value.dataSource,
  );

  readonly mergedLoading: ComputedRef<TableProps<TRecord>['loading']> = computed(() => {
    const configuredLoading = this.state.value.loading;
    if (!this.requestLoading.value) return configuredLoading;
    if (configuredLoading && typeof configuredLoading === 'object') {
      return { ...configuredLoading, spinning: true };
    }
    return true;
  });

  /** 带默认值的配置；组件模式和 Hook 模式共用同一套默认值。 */
  readonly resolved = computed(() => {
    const options = this.state.value;

    return {
      showToolbar: options.showToolbar !== false,
      showRefresh: options.showRefresh !== false,
      showFullscreen: options.showFullscreen !== false,
      rowKey: options.rowKey ?? 'id',
    };
  });

  private readonly attachGuard = createAttachGuard('DynamicTable');
  private readonly pageState = reactive({ current: 1, pageSize: 10, total: 0 });
  private readonly filters: ShallowRef<DynamicTableChangeArgs<TRecord>[1]> = shallowRef({});
  private readonly sorter: ShallowRef<DynamicTableChangeArgs<TRecord>[2]> = shallowRef([]);
  private readonly requestMode: ShallowRef<RequestMode> = shallowRef();
  private readonly requestVersion: ShallowRef<number> = shallowRef(0);
  private readonly lastRequestQuery: ShallowRef<RequestQuery<TRecord> | undefined> = shallowRef();
  private readonly propsDriven: boolean;
  private readonly requestDecorator?: DynamicTableStateConfig<TRecord>['requestDecorator'];

  private hostTableRef: ShallowRef<DynamicTableNativeInstance | undefined> | undefined;
  private callbacks: TableApiCallbacks<TRecord> = {};
  private abortController: AbortController | undefined;
  private pendingReload: DynamicTableReloadOptions | undefined;
  private decoratedSource: DynamicTableRequest<TRecord> | undefined;
  private decoratedRequest: DynamicTableRequest<TRecord> | undefined;
  private setStateWarned = false;

  constructor(
    options: UseDynamicTableOptions<TRecord>,
    config: DynamicTableStateConfig<TRecord> = {},
  ) {
    this.propsDriven = config.propsDriven ?? false;
    this.requestDecorator = config.requestDecorator;
    this.state = shallowRef({ ...options }) as Ref<UseDynamicTableOptions<TRecord>>;
    this.selectedRowKeys = ref([...(options.selectedRowKeys ?? [])]);
    this.selectedRows = shallowRef([]);
    this.syncPaginationConfig();
    this.api = this.createPublicApi();
  }

  /** 宿主组件挂载：登记底层 Table 实例与事件桥接。 */
  attach(options: DynamicTableAttachOptions<TRecord>) {
    this.attachGuard.attach();
    this.hostTableRef = options.tableRef;
    this.callbacks = options.callbacks;
  }

  /** 宿主组件卸载：中止在途请求并摘掉底层实例，状态与 API 继续存活。 */
  detach() {
    this.attachGuard.detach();
    this.abortController?.abort();
    this.abortController = undefined;
    this.hostTableRef = undefined;
    this.callbacks = {};
  }

  /** 经过组合层装饰后的 request；同一个源函数只装饰一次，保证引用稳定可被 watch。 */
  get request(): DynamicTableRequest<TRecord> | undefined {
    const source = this.state.value.request;
    if (!source || !this.requestDecorator) return source;

    if (this.decoratedSource !== source) {
      this.decoratedSource = source;
      this.decoratedRequest = this.requestDecorator(source);
    }

    return this.decoratedRequest;
  }

  get immediate(): boolean {
    return this.state.value.immediate !== false;
  }

  /** 宿主挂载完成后补发挂载前记录的 reload，否则按 immediate 执行首次请求。 */
  async flushMount(): Promise<void> {
    const pending = this.pendingReload;
    this.pendingReload = undefined;

    if (pending) {
      if (pending.resetPage) this.pageState.current = 1;
      await this.loadData(true);
      return;
    }

    if (this.request && this.immediate) await this.loadData(true);
  }

  /** request 变化：中止在途请求、清空去重与分页模式，必要时立即重新请求。 */
  handleRequestChange() {
    this.abortController?.abort();
    this.requestMode.value = undefined;
    this.lastRequestQuery.value = undefined;
    if (this.immediate) void this.loadData(true);
  }

  /** 把配置里的分页同步到内部页码状态。 */
  syncPaginationConfig() {
    const configured = this.state.value.pagination;
    if (!configured) return;

    this.pageState.current =
      configured.current ?? configured.defaultCurrent ?? this.pageState.current;
    this.pageState.pageSize =
      configured.pageSize ?? configured.defaultPageSize ?? this.pageState.pageSize;
  }

  /** 对外刷新入口，force 确保相同查询条件也会重新请求。 */
  async reload(options: DynamicTableReloadOptions = {}): Promise<void> {
    // 挂载前记录意图，挂载后由 flushMount 补发，避免与首次请求重复。
    if (!this.attachGuard.attached) {
      this.pendingReload = { ...this.pendingReload, ...options };
      return;
    }

    if (options.resetPage) this.pageState.current = 1;
    await this.loadData(true);
  }

  /** 同步 Table 变化到请求状态；数组模式下不重复触发服务端分页请求。 */
  handleTableChange(
    pagination: DynamicTableChangeArgs<TRecord>[0],
    nextFilters: DynamicTableChangeArgs<TRecord>[1],
    nextSorter: DynamicTableChangeArgs<TRecord>[2],
  ): { current: number; pageSize: number } {
    const nextCurrent = pagination.current ?? 1;
    const nextPageSize = pagination.pageSize ?? this.pageState.pageSize;
    this.pageState.current = nextCurrent;
    this.pageState.pageSize = nextPageSize;
    this.filters.value = nextFilters;
    this.sorter.value = nextSorter;

    if (this.request && this.requestMode.value !== 'array') void this.loadData();

    return { current: nextCurrent, pageSize: nextPageSize };
  }

  clearSelection() {
    this.selectedRowKeys.value = [];
    this.selectedRows.value = [];
    this.callbacks.onSelectedRowKeysChange?.([]);
    this.callbacks.onSelectionChange?.([], []);
  }

  getSelectedRows(): TRecord[] {
    return [...this.selectedRows.value];
  }

  getSelectedRowKeys(): DynamicTableKey[] {
    return [...this.selectedRowKeys.value];
  }

  /** 切换全屏状态；body 滚动锁定等 DOM 副作用由宿主组件监听 isFullscreen 完成。 */
  toggleFullscreen(force?: boolean) {
    const nextValue = force ?? !this.isFullscreen.value;
    if (nextValue === this.isFullscreen.value) return;

    this.isFullscreen.value = nextValue;
    this.callbacks.onFullscreenChange?.(nextValue);
  }

  getTableInstance(): DynamicTableNativeInstance | undefined {
    return this.hostTableRef?.value;
  }

  setState(nextState: Partial<UseDynamicTableOptions<TRecord>>) {
    if (this.propsDriven && !this.setStateWarned && import.meta.env.DEV) {
      this.setStateWarned = true;
      console.warn(
        '[DynamicTable] 组件模式下配置由 props 驱动，setState 的改动会被下一次 props 更新覆盖。',
      );
    }

    this.syncOptions(nextState);
  }

  /** 组件模式下 props 是唯一配置来源，内部同步走这里，不触发 setState 的告警。 */
  syncOptions(nextState: Partial<UseDynamicTableOptions<TRecord>>) {
    this.state.value = { ...this.state.value, ...nextState };
    // 受控 selectedRowKeys 只在明确给出时同步，避免其他配置变更把选中项清空。
    if (nextState.selectedRowKeys) this.selectedRowKeys.value = [...nextState.selectedRowKeys];
  }

  /** 只把 request 关心的分页/筛选/排序字段纳入去重比较。 */
  private getRequestQuery(): RequestQuery<TRecord> {
    return {
      current: this.pageState.current,
      pageSize: this.pageState.pageSize,
      filters: this.filters.value,
      sorter: this.sorter.value,
    };
  }

  /** 执行一次请求；新请求会取消旧请求，版本号再过滤无法取消的过期响应。 */
  private async loadData(force = false): Promise<void> {
    const request = this.request;
    if (!request) return;

    const query = this.getRequestQuery();
    if (!force && isEqual(this.lastRequestQuery.value, query)) return;
    this.lastRequestQuery.value = query;

    this.abortController?.abort();
    const controller = new AbortController();
    this.abortController = controller;
    const currentVersion = this.requestVersion.value + 1;
    this.requestVersion.value = currentVersion;
    this.requestLoading.value = true;
    this.requestError.value = undefined;

    try {
      const result = await request({ ...query, signal: controller.signal });
      if (controller.signal.aborted || currentVersion !== this.requestVersion.value) return;

      if (isPagedResult(result)) {
        this.requestMode.value = 'paged';
        this.requestData.value = result.data.list;
        this.pageState.total = result.data.total;
      } else if (isArray(result)) {
        this.requestMode.value = 'array';
        this.requestData.value = result;
        this.pageState.total = result.length;
      } else {
        throw new TypeError(
          '[DynamicTable] request must return an array or { data: { list, total } }',
        );
      }

      this.callbacks.onRequestSuccess?.(result);
    } catch (error) {
      if (controller.signal.aborted || currentVersion !== this.requestVersion.value) return;
      this.requestError.value = error;
      this.callbacks.onRequestError?.(error);
    } finally {
      if (currentVersion === this.requestVersion.value) {
        this.requestLoading.value = false;
        this.abortController = undefined;
      }
    }
  }

  /** 创建普通对象 API，方法是自身属性，便于调试与解构。 */
  private createPublicApi(): DynamicTableApi<TRecord> {
    return createApiObject<DynamicTableApi<TRecord>>(
      bindApiMethods<DynamicTableApi<TRecord>, DynamicTableState<TRecord>>(this, TABLE_API_METHODS),
      {
        selectedRowKeys: () => [...this.selectedRowKeys.value],
        selectedRows: () => [...this.selectedRows.value],
      },
    );
  }
}
