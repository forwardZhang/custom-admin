import type { Component } from 'vue';

import type { FormData } from '../../dynamic-form';
import type { DynamicSearchApi, UseDynamicSearchOptions } from '../../dynamic-search';
import type {
  DynamicTableApi,
  DynamicTableRequestContext,
  DynamicTableRequestResult,
  UseDynamicTableOptions,
} from '../../dynamic-table';

export interface DynamicPageRequestContext<
  TSearch extends FormData = FormData,
  TRecord extends object = Record<string, unknown>,
> extends DynamicTableRequestContext<TRecord> {
  /** 最近一次成功查询或重置后的搜索条件。 */
  searchValues: Readonly<TSearch>;
}

export type DynamicPageRequest<
  TSearch extends FormData = FormData,
  TRecord extends object = Record<string, unknown>,
> = (
  context: DynamicPageRequestContext<TSearch, TRecord>,
) => Promise<DynamicTableRequestResult<TRecord>>;

export type DynamicPageSearchConfig<TSearch extends FormData = FormData> =
  UseDynamicSearchOptions<TSearch>;

export type DynamicPageTableConfig<
  TSearch extends FormData = FormData,
  TRecord extends object = Record<string, unknown>,
> = Omit<UseDynamicTableOptions<TRecord>, 'request'> & {
  request?: DynamicPageRequest<TSearch, TRecord>;
};

export interface UseDynamicPageOptions<
  TSearch extends FormData = FormData,
  TRecord extends object = Record<string, unknown>,
> {
  searchConfig: DynamicPageSearchConfig<TSearch>;
  tableConfig: DynamicPageTableConfig<TSearch, TRecord>;
  /** 查询或重置后是否自动回到第一页刷新，默认为 true。 */
  autoReload?: boolean;
  /** 查询或重置后是否自动清除选中行，默认为 true。 */
  clearSelectionOnSearch?: boolean;
}

export type DynamicPageProps<
  TSearch extends FormData = FormData,
  TRecord extends object = Record<string, unknown>,
> = UseDynamicPageOptions<TSearch, TRecord>;

export type DynamicPageTableApi<
  TSearch extends FormData = FormData,
  TRecord extends object = Record<string, unknown>,
> = Omit<DynamicTableApi<TRecord>, 'setState'> & {
  /** 更新表格运行时配置；request 会继续收到 DynamicPage 搜索条件。 */
  setState(state: Partial<DynamicPageTableConfig<TSearch, TRecord>>): void;
};

export type DynamicPageComponent = Component;

/** DynamicPage 组件实例暴露的组合 API，组件模式无需 Hook 即可使用。 */
export interface DynamicPageInstance<
  TSearch extends FormData = FormData,
  TRecord extends object = Record<string, unknown>,
> {
  readonly searchApi: DynamicSearchApi<TSearch>;
  readonly tableApi: DynamicPageTableApi<TSearch, TRecord>;
  readonly searchValues: Readonly<TSearch>;
}

export type DynamicPageBetweenSlotProps<
  TSearch extends FormData = FormData,
  TRecord extends object = Record<string, unknown>,
> = DynamicPageInstance<TSearch, TRecord>;

export type UseDynamicPageReturn<
  TSearch extends FormData = FormData,
  TRecord extends object = Record<string, unknown>,
> = readonly [
  DynamicPageComponent,
  DynamicSearchApi<TSearch>,
  DynamicPageTableApi<TSearch, TRecord>,
];
