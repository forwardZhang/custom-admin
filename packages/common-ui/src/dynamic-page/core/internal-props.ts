import type { DynamicPageProps } from '../types';
import type { DynamicPageState } from './page-state';
import type { FormData } from '../../dynamic-form';

/**
 * DynamicPage 的内部 props。
 * pageState 只由 useDynamicPage 传入；searchConfig / tableConfig 在 Hook 模式下来自 State。
 */
export interface DynamicPageInternalProps<
  TSearch extends FormData = FormData,
  TRecord extends object = Record<string, unknown>,
> extends Partial<DynamicPageProps<TSearch, TRecord>> {
  /** 复用已创建的 State；为空时由组件自建。 */
  pageState?: DynamicPageState<TSearch, TRecord>;
}
