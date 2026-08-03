import type {
  Table,
  TableEmits,
  TablePaginationConfig,
  TableProps,
  TableRowSelection,
} from 'antdv-next';

import type { CSSProperties } from 'vue';

/** 行选择模式；默认多选。 */
export type DynamicTableSelectionMode = false | 'single' | 'multiple';
/** 服务端分页由后端返回 total，本地分页由底层 Table 自己切页。 */
export type DynamicTablePaginationMode = 'server' | 'local';
export type DynamicTableKey = string | number;
export type DynamicTableNativeInstance = InstanceType<typeof Table>;
export type DynamicTablePagination = false | TablePaginationConfig;

export type DynamicTableFilters<TRecord extends object = Record<string, unknown>> = Parameters<
  TableEmits<TRecord>['change']
>[1];

export type DynamicTableSorter<TRecord extends object = Record<string, unknown>> = Parameters<
  TableEmits<TRecord>['change']
>[2];

export type DynamicTableChangeArgs<TRecord extends object = Record<string, unknown>> = Parameters<
  TableEmits<TRecord>['change']
>;

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

/** request 的固定返回结构；分页模式由 paginationMode 声明，不再嗅探返回值。 */
export interface DynamicTableRequestResult<TRecord extends object = Record<string, unknown>> {
  /** 当前页数据。 */
  list: TRecord[];
  /** 服务端数据总数；本地分页可省略。 */
  total?: number;
}

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

export interface DynamicTableProps<TRecord extends object = Record<string, unknown>> {
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
  /**
   * 撑满父容器高度，表头与分页固定，表体内部滚动。
   * 需要父容器有确定高度；表体高度按容器剩余空间量出后填进 scroll.y，
   * 显式配置的 scroll.y 优先生效。
   */
  fill?: boolean;
  /** 表格尺寸。 */
  size?: TableProps<TRecord>['size'];
  /** 是否显示边框，默认为 true。 */
  bordered?: TableProps<TRecord>['bordered'];
  /** 不常用的 Antdv Table 属性，原样透传给底层组件。 */
  tableProps?: TableProps<TRecord>;
  /** 异步数据源；配置后优先于原生 dataSource。 */
  request?: DynamicTableRequest<TRecord>;
  /**
   * 分页模式，默认为 server。
   * server：翻页、筛选、排序都重新请求，总数取 request 返回的 total。
   * local：只请求一次，切页与排序由底层 Table 在本地完成。
   */
  paginationMode?: DynamicTablePaginationMode;
  /** 是否在挂载和 request 变化后立即请求，默认为 true。 */
  immediate?: boolean;
  /** 行选择模式，默认为 multiple；false 表示不显示选择列。 */
  selection?: DynamicTableSelectionMode;
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

export type DynamicTableEmits<TRecord extends object = Record<string, unknown>> = {
  change: DynamicTableChangeArgs<TRecord>;
  'update:selectedRowKeys': [keys: DynamicTableKey[]];
  selectionChange: [keys: DynamicTableKey[], rows: TRecord[]];
  requestSuccess: [result: DynamicTableRequestResult<TRecord>];
  requestError: [error: unknown];
  refresh: [];
  fullscreenChange: [fullscreen: boolean];
  paginationChange: [current: number, pageSize: number];
};

/** 事件的 onXxx prop 形式；Hook 生成的组件用它把 emits 表达成 props 类型。 */
export interface DynamicTableEventProps<TRecord extends object = Record<string, unknown>> {
  onChange?: (...args: DynamicTableChangeArgs<TRecord>) => void;
  'onUpdate:selectedRowKeys'?: (keys: DynamicTableKey[]) => void;
  onSelectionChange?: (keys: DynamicTableKey[], rows: TRecord[]) => void;
  onRequestSuccess?: (result: DynamicTableRequestResult<TRecord>) => void;
  onRequestError?: (error: unknown) => void;
  onRefresh?: () => void;
  onFullscreenChange?: (fullscreen: boolean) => void;
  onPaginationChange?: (current: number, pageSize: number) => void;
}

/**
 * DynamicTable 的命令式 API：组件 expose 与 useDynamicTable 返回的是同一份类型。
 * 只有「读状态 / 动作」，配置一律走 props。
 */
export interface DynamicTableApi<TRecord extends object = Record<string, unknown>> {
  /** 当前选中 key 的快照。 */
  readonly selectedRowKeys: readonly DynamicTableKey[];
  /** 当前选中行的快照。 */
  readonly selectedRows: readonly TRecord[];
  /** 内部请求是否进行中。 */
  readonly loading: boolean;
  /** 强制重新执行 request，可选择先重置页码。 */
  reload(options?: DynamicTableReloadOptions): Promise<void>;
  /** 清空内部选中状态并触发对应更新事件。 */
  clearSelection(): void;
  /** 切换全屏；传入 force 时设置为指定状态。 */
  toggleFullscreen(force?: boolean): void;
  /** 逃生舱：获取底层 Antdv Table 实例。 */
  getNativeInstance(): DynamicTableNativeInstance | undefined;
}
