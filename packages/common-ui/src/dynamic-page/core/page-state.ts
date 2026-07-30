import type { Ref, ShallowRef } from 'vue';

import { cloneDeep } from 'lodash-es';
import { shallowRef } from 'vue';

import { bindApiMethods, createApiObject } from '../../internal/create-api';
import { DynamicSearchState, SEARCH_API_METHODS } from '../../dynamic-search/core/search-state';
import { DynamicTableState } from '../../dynamic-table/core/table-state';

import type { FormData } from '../../dynamic-form';
import type { DynamicSearchApi, UseDynamicSearchOptions } from '../../dynamic-search';
import type {
  DynamicTableRequest,
  DynamicTableRequestContext,
  UseDynamicTableOptions,
} from '../../dynamic-table';
import type {
  DynamicPageInstance,
  DynamicPageRequest,
  DynamicPageTableApi,
  UseDynamicPageOptions,
} from '../types';

type SearchHandler<TSearch extends FormData> = (values: TSearch) => void | Promise<void>;

/**
 * 页面编排状态：组合一个 DynamicSearchState 与一个 DynamicTableState。
 * 搜索快照与刷新流程在构造期接入，不在运行时改写任何 API 方法。
 */
export class DynamicPageState<
  TSearch extends FormData = FormData,
  TRecord extends object = Record<string, unknown>,
> {
  readonly searchState: DynamicSearchState<TSearch>;
  readonly tableState: DynamicTableState<TRecord>;
  readonly state: Ref<UseDynamicPageOptions<TSearch, TRecord>>;

  /** 最近一次查询校验成功或重置后的搜索条件。 */
  readonly submittedSearchValues: ShallowRef<TSearch>;

  readonly searchApi: DynamicSearchApi<TSearch>;
  readonly tableApi: DynamicPageTableApi<TSearch, TRecord>;

  private businessHandleSearch: SearchHandler<TSearch> | undefined;
  private businessHandleReset: SearchHandler<TSearch> | undefined;

  constructor(options: UseDynamicPageOptions<TSearch, TRecord>) {
    this.state = shallowRef({ ...options }) as Ref<UseDynamicPageOptions<TSearch, TRecord>>;

    const { handleSearch, handleReset, ...searchConfig } = options.searchConfig;
    this.businessHandleSearch = handleSearch;
    this.businessHandleReset = handleReset;

    // 搜索状态是即时可用的，因此首次请求的条件在构造期就已确定，无需等挂载。
    this.searchState = new DynamicSearchState<TSearch>({
      ...searchConfig,
      handleSearch: (values) => this.handleSubmitted(values, this.businessHandleSearch),
      handleReset: (values) => this.handleSubmitted(values, this.businessHandleReset),
    });
    this.submittedSearchValues = shallowRef(this.searchState.api.getStates());

    this.tableState = new DynamicTableState<TRecord>(
      options.tableConfig as unknown as UseDynamicTableOptions<TRecord>,
      { requestDecorator: (request) => this.decorateRequest(request) },
    );

    this.searchApi = this.createSearchApi();
    this.tableApi = this.tableState.api as unknown as DynamicPageTableApi<TSearch, TRecord>;
  }

  /** 组件实例与 between 插槽共用的组合 API。 */
  get instance(): DynamicPageInstance<TSearch, TRecord> {
    return {
      searchApi: this.searchApi,
      tableApi: this.tableApi,
      searchValues: this.submittedSearchValues.value,
    };
  }

  setOptions(options: Partial<UseDynamicPageOptions<TSearch, TRecord>>) {
    this.state.value = { ...this.state.value, ...options };
    if (options.searchConfig) this.searchApi.setOptions(options.searchConfig);
    if (options.tableConfig) this.tableApi.setState(options.tableConfig);
  }

  /** 把页面搜索条件补进表格 request 的上下文；request 引用变化时由 State 自动重新装饰。 */
  private decorateRequest(request: DynamicTableRequest<TRecord>): DynamicTableRequest<TRecord> {
    const pageRequest = request as unknown as DynamicPageRequest<TSearch, TRecord>;

    return (context: DynamicTableRequestContext<TRecord>) =>
      pageRequest({ ...context, searchValues: cloneDeep(this.submittedSearchValues.value) });
  }

  /** 查询与重置成功后：先记录条件快照，再执行业务回调，最后按配置清选中并刷新。 */
  private handleSubmitted(values: TSearch, handler: SearchHandler<TSearch> | undefined) {
    this.submittedSearchValues.value = cloneDeep(values);
    void handler?.(values);

    if (this.state.value.clearSelectionOnSearch !== false) this.tableApi.clearSelection();
    if (this.state.value.autoReload !== false) void this.tableApi.reload({ resetPage: true });
  }

  /**
   * 搜索 API 只在 setOptions 上与内层不同：业务回调要被页面流程包一层，
   * 因此这里组合出一个新的 API 对象，而不是去改写内层 API 的方法。
   */
  private createSearchApi(): DynamicSearchApi<TSearch> {
    const searchApi = this.searchState.api;

    return createApiObject<DynamicSearchApi<TSearch>>(
      {
        ...bindApiMethods<DynamicSearchApi<TSearch>, DynamicSearchApi<TSearch>>(
          searchApi,
          SEARCH_API_METHODS,
        ),
        setOptions: (options: Partial<UseDynamicSearchOptions<TSearch>>) =>
          this.setSearchOptions(options),
      },
      {
        states: () => searchApi.states,
        expanded: () => searchApi.expanded,
      },
    );
  }

  /** 业务可以替换查询/重置回调，但不能绕过页面自身的快照与刷新流程。 */
  private setSearchOptions(options: Partial<UseDynamicSearchOptions<TSearch>>) {
    if ('handleSearch' in options) this.businessHandleSearch = options.handleSearch;
    if ('handleReset' in options) this.businessHandleReset = options.handleReset;

    this.searchState.setOptions({
      ...options,
      handleSearch: (values) => this.handleSubmitted(values, this.businessHandleSearch),
      handleReset: (values) => this.handleSubmitted(values, this.businessHandleReset),
    });
  }
}
