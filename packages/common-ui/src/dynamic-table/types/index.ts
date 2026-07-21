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

export interface DynamicTablePublicProps<
  TRecord extends object = Record<string, unknown>,
> extends /* @vue-ignore */ Omit<TableProps<TRecord>, 'rowSelection' | 'title'> {
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

export type DynamicTablePagination = false | TablePaginationConfig;
