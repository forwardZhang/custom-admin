import type { FormData } from '../../dynamic-form';
import type {
  DynamicSearchApi,
  DynamicSearchEventProps,
  DynamicSearchProps,
} from '../../dynamic-search';
import type {
  DynamicTableApi,
  DynamicTableEventProps,
  DynamicTableProps,
  DynamicTableRequestContext,
  DynamicTableRequestResult,
} from '../../dynamic-table';

export interface DynamicPageRequestContext<
  TSearch extends FormData = FormData,
  TRecord extends object = Record<string, unknown>,
> extends DynamicTableRequestContext<TRecord> {
  /** 最近一次成功查询或重置后的搜索条件。 */
  searchValues: Readonly<TSearch>;
}

/** 页面级 request：在表格请求上下文之上多拿到一份搜索条件。 */
export type DynamicPageRequest<
  TSearch extends FormData = FormData,
  TRecord extends object = Record<string, unknown>,
> = (
  context: DynamicPageRequestContext<TSearch, TRecord>,
) => Promise<DynamicTableRequestResult<TRecord>>;

/** 搜索区配置：DynamicSearch 的 props 与事件原样透传。 */
export type DynamicPageSearchProps<TSearch extends FormData = FormData> =
  DynamicSearchProps<TSearch> & DynamicSearchEventProps<TSearch>;

/**
 * 表格区配置：DynamicTable 的 props 与事件原样透传，只有三处由页面接管——
 * request 换成页面级签名，fill 只有页面一个来源，immediate 由页面编排首屏请求。
 */
export type DynamicPageTableProps<
  TSearch extends FormData = FormData,
  TRecord extends object = Record<string, unknown>,
> = Omit<DynamicTableProps<TRecord>, 'request' | 'fill'> &
  DynamicTableEventProps<TRecord> & {
    request?: DynamicPageRequest<TSearch, TRecord>;
  };

export interface DynamicPageProps<
  TSearch extends FormData = FormData,
  TRecord extends object = Record<string, unknown>,
> {
  /** 搜索区配置。 */
  search: DynamicPageSearchProps<TSearch>;
  /** 表格区配置。 */
  table: DynamicPageTableProps<TSearch, TRecord>;
  /** 查询或重置后是否自动回到第一页刷新，默认为 true。 */
  autoReload?: boolean;
  /** 查询或重置后是否自动清除选中行，默认为 true。 */
  clearSelectionOnSearch?: boolean;
  /** 页面撑满父容器高度：整页不滚动，只有表体内部滚动，默认为 false。 */
  fill?: boolean;
}

export type DynamicPageEmits<TSearch extends FormData = FormData> = {
  /** 查询校验通过、搜索条件快照已更新之后触发。 */
  search: [values: TSearch];
  /** 重置完成、搜索条件快照已更新之后触发。 */
  reset: [values: TSearch];
};

/** 事件的 onXxx prop 形式；Hook 生成的组件用它把 emits 表达成 props 类型。 */
export interface DynamicPageEventProps<TSearch extends FormData = FormData> {
  onSearch?: (values: TSearch) => void;
  onReset?: (values: TSearch) => void;
}

/**
 * DynamicPage 的命令式 API：两个子 API 以命名空间形式组合，不做类型拼接。
 */
export interface DynamicPageApi<
  TSearch extends FormData = FormData,
  TRecord extends object = Record<string, unknown>,
> {
  /** 搜索区 API。 */
  readonly search: DynamicSearchApi<TSearch>;
  /** 表格区 API。 */
  readonly table: DynamicTableApi<TRecord>;
  /** 最近一次成功查询或重置后的搜索条件快照。 */
  readonly searchValues: Readonly<TSearch>;
}

export type DynamicPageBetweenSlotProps<
  TSearch extends FormData = FormData,
  TRecord extends object = Record<string, unknown>,
> = DynamicPageApi<TSearch, TRecord>;
