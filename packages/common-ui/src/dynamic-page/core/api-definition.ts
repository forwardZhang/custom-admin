import type { ApiProxyDefinition } from '../../internal/use-api-proxy';

import type { FormData } from '../../dynamic-form';
import type { DynamicPageApi } from '../types';

/**
 * 页面 api 的成员清单。
 * 两个子 API 自身已是引用稳定的代理，作为 constants 交给上层代理即可，无需再包一层。
 */
export function createPageApiDefinition<TSearch extends FormData, TRecord extends object>(
  children: Pick<DynamicPageApi<TSearch, TRecord>, 'search' | 'table'>,
): ApiProxyDefinition<DynamicPageApi<TSearch, TRecord>> {
  return {
    properties: ['searchValues'],
    fallbacks: { searchValues: () => ({}) },
    constants: children,
  };
}
