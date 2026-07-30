import type { DynamicSearchProps } from '../types';
import type { DynamicSearchState } from './search-state';
import type { FormData } from '../../dynamic-form';

/**
 * DynamicSearch 的内部 props。
 * searchState 只由 useDynamicSearch / DynamicPage 传入，不进入 DynamicSearchProps。
 * schema 在这里放宽为可选：Hook 模式的配置来自 State，不再经过 props。
 */
export interface DynamicSearchInternalProps<T extends FormData = FormData> extends Omit<
  DynamicSearchProps<T>,
  'schema'
> {
  schema?: DynamicSearchProps<T>['schema'];
  /** 复用已创建的 State；为空时由组件自建。 */
  searchState?: DynamicSearchState<T>;
}
