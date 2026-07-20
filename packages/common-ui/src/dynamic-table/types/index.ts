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
  current: number;
  pageSize: number;
  filters: DynamicTableFilters<TRecord>;
  sorter: DynamicTableSorter<TRecord>;
  signal: AbortSignal;
}

export interface DynamicTablePageData<TRecord extends object = Record<string, unknown>> {
  list: TRecord[];
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
  resetPage?: boolean;
}

export interface DynamicTableInstance<TRecord extends object = Record<string, unknown>> {
  reload(options?: DynamicTableReloadOptions): Promise<void>;
  clearSelection(): void;
  getSelectedRows(): TRecord[];
  getSelectedRowKeys(): DynamicTableKey[];
  toggleFullscreen(force?: boolean): void;
  getTableInstance(): DynamicTableNativeInstance | undefined;
}

export interface DynamicTablePublicProps<
  TRecord extends object = Record<string, unknown>,
> extends /* @vue-ignore */ Omit<TableProps<TRecord>, 'rowSelection' | 'title'> {
  request?: DynamicTableRequest<TRecord>;
  immediate?: boolean;
  /** 多选开关，未配置时默认为 true。multiple 和 single 同时为 true 时多选优先。 */
  multiple?: boolean;
  /** 单选开关，未配置时默认为 false。 */
  single?: boolean;
  /** @deprecated 请使用 multiple / single。 */
  selection?: DynamicTableSelection;
  rowSelection?: DynamicTableRowSelection<TRecord>;
  selectedRowKeys?: DynamicTableKey[];
  title?: string;
  showToolbar?: boolean;
  showRefresh?: boolean;
  showFullscreen?: boolean;
  toolbarClass?: string;
  tableClass?: string;
  tableStyle?: CSSProperties;
}

export type DynamicTablePagination = false | TablePaginationConfig;
