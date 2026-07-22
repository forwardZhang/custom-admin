import type {
  Table,
  TableEmits,
  TablePaginationConfig,
  TableProps,
  TableRowSelection,
} from 'antdv-next';

import type { CSSProperties } from 'vue';

export type DynamicTableSelection = false | 'checkbox' | 'radio';
export type DynamicTableKey = string | number;
export type DynamicTableNativeInstance = InstanceType<typeof Table>;

export type DynamicTableFilters<TRecord extends object = Record<string, unknown>> = Parameters<
  TableEmits<TRecord>['change']
>[1];

export type DynamicTableSorter<TRecord extends object = Record<string, unknown>> = Parameters<
  TableEmits<TRecord>['change']
>[2];

export type DynamicTableChangeArgs<TRecord extends object = Record<string, unknown>> = Parameters<
  TableEmits<TRecord>['change']
>;

export type DynamicTableChangeHandler<TRecord extends object = Record<string, unknown>> = (
  ...args: DynamicTableChangeArgs<TRecord>
) => void;

export interface DynamicTableRequestContext<TRecord extends object = Record<string, unknown>> {
  /** 当前页码。 */
  current: number;
  /** 每页条数。 */
  pageSize: number;
  /** Antdv Table 产生的筛选条件。 */
  filters: DynamicTableFilters<TRecord>;
  /** Antdv Table 产生的排序条件。 */
  sorter: DynamicTableSorter<TRecord>;
  /** 新请求发起或组件卸载时会中止旧信号。 */
  signal: AbortSignal;
}

export interface DynamicTablePageData<TRecord extends object = Record<string, unknown>> {
  /** 当前页数据。 */
  list: TRecord[];
  /** 服务端数据总数。 */
  total: number;
}

export type DynamicTableRequestResult<TRecord extends object = Record<string, unknown>> =
  | TRecord[]
  | { data: DynamicTablePageData<TRecord> };

export type DynamicTableRequest<TRecord extends object = Record<string, unknown>> = (
  context: DynamicTableRequestContext<TRecord>,
) => Promise<DynamicTableRequestResult<TRecord>>;

export type DynamicTableRowSelection<TRecord extends object = Record<string, unknown>> = Omit<
  TableRowSelection<TRecord>,
  'type' | 'selectedRowKeys'
>;

/** 低频 Antdv Table 配置；与顶层高频字段重名时，顶层字段优先。 */
export type DynamicTableNativeProps<TRecord extends object = Record<string, unknown>> =
  TableProps<TRecord>;

export interface DynamicTableReloadOptions {
  /** 刷新前是否回到第一页，默认为 false。 */
  resetPage?: boolean;
}

/** DynamicTable 通过组件 ref 暴露的命令式能力。 */
export interface DynamicTableInstance<TRecord extends object = Record<string, unknown>> {
  /** 强制重新执行 request，可选择先重置页码。 */
  reload(options?: DynamicTableReloadOptions): Promise<void>;
  /** 清空内部选中状态并触发对应更新事件。 */
  clearSelection(): void;
  /** 返回当前选中行的浅拷贝。 */
  getSelectedRows(): TRecord[];
  /** 返回当前选中行 key 的浅拷贝。 */
  getSelectedRowKeys(): DynamicTableKey[];
  /** 切换全屏；传入 force 时设置为指定状态。 */
  toggleFullscreen(force?: boolean): void;
  /** 获取底层 Antdv Table 实例。 */
  getTableInstance(): DynamicTableNativeInstance | undefined;
}

export interface DynamicTablePublicProps<TRecord extends object = Record<string, unknown>> {
  /** 表格列配置。 */
  columns?: TableProps<TRecord>['columns'];
  /** 静态数据源；配置 request 后由异步结果覆盖。 */
  dataSource?: TableProps<TRecord>['dataSource'];
  /** 行数据唯一键，默认为 id。 */
  rowKey?: TableProps<TRecord>['rowKey'];
  /** 外部加载状态；异步请求中会与内部加载状态合并。 */
  loading?: TableProps<TRecord>['loading'];
  /** 分页配置。 */
  pagination?: TableProps<TRecord>['pagination'];
  /** 表格滚动配置。 */
  scroll?: TableProps<TRecord>['scroll'];
  /** 表格尺寸。 */
  size?: TableProps<TRecord>['size'];
  /** 是否显示边框。 */
  bordered?: TableProps<TRecord>['bordered'];
  /** 不常用的 Antdv Table 属性，类型与官方 TableProps 保持同步。 */
  tableProps?: DynamicTableNativeProps<TRecord>;
  /** 异步数据源；配置后优先于原生 dataSource。 */
  request?: DynamicTableRequest<TRecord>;
  /** 是否在挂载和 request 函数变化后立即请求，默认为 true。 */
  immediate?: boolean;
  /** 多选开关，未配置时默认为 true。multiple 和 single 同时为 true 时多选优先。 */
  multiple?: boolean;
  /** 单选开关，未配置时默认为 false。 */
  single?: boolean;
  /** @deprecated 请使用 multiple / single。 */
  selection?: DynamicTableSelection;
  /** 透传给 Antdv Table 的行选择配置，type 和 selectedRowKeys 由组件接管。 */
  rowSelection?: DynamicTableRowSelection<TRecord>;
  /** 受控选中 key；用户选择时通过 update:selectedRowKeys 回传。 */
  selectedRowKeys?: DynamicTableKey[];
  /** 工具栏标题，也可使用 title 插槽覆盖。 */
  title?: string;
  /** 是否显示工具栏，默认为 true。 */
  showToolbar?: boolean;
  /** 是否显示刷新按钮，默认为 true。 */
  showRefresh?: boolean;
  /** 是否显示全屏按钮，默认为 true。 */
  showFullscreen?: boolean;
  /** 工具栏附加 class。 */
  toolbarClass?: string;
  /** 底层 Table 附加 class。 */
  tableClass?: string;
  /** 底层 Table 内联样式。 */
  tableStyle?: CSSProperties;
}

/** useDynamicTable 创建包装组件时使用的运行时配置和业务回调。 */
export interface UseDynamicTableOptions<
  TRecord extends object = Record<string, unknown>,
> extends DynamicTablePublicProps<TRecord> {
  /** 表格分页、筛选或排序变化后的回调。 */
  handleChange?: DynamicTableChangeHandler<TRecord>;
  /** 选中行变化后的回调。 */
  handleSelectionChange?: (keys: DynamicTableKey[], rows: TRecord[]) => void;
  /** 受控选中 key 更新后的回调。 */
  handleSelectedRowKeysChange?: (keys: DynamicTableKey[]) => void;
  /** 异步请求成功后的回调。 */
  handleRequestSuccess?: (result: DynamicTableRequestResult<TRecord>) => void;
  /** 异步请求失败后的回调。 */
  handleRequestError?: (error: unknown) => void;
  /** 工具栏刷新后的回调。 */
  handleRefresh?: () => void;
  /** 全屏状态变化后的回调。 */
  handleFullscreenChange?: (fullscreen: boolean) => void;
  /** 分页状态变化后的回调。 */
  handlePaginationChange?: (current: number, pageSize: number) => void;
}

/** useDynamicTable 返回的命令式 API。 */
export interface DynamicTableApi<
  TRecord extends object = Record<string, unknown>,
> extends DynamicTableInstance<TRecord> {
  /** 当前选中 key 的快照。 */
  readonly selectedRowKeys: readonly DynamicTableKey[];
  /** 当前选中行的快照。 */
  readonly selectedRows: readonly TRecord[];
  /** 更新包装组件的运行时配置。 */
  setState(state: Partial<UseDynamicTableOptions<TRecord>>): void;
}

export type DynamicTablePagination = false | TablePaginationConfig;
