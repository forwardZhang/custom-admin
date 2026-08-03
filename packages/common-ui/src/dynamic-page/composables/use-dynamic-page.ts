import { defineComponent, shallowRef } from 'vue';

import DynamicPage from '../components/dynamic-page.vue';
import { createSearchApiDefinition } from '../../dynamic-search/core/api-definition';
import { createTableApiDefinition } from '../../dynamic-table/core/api-definition';
import { renderDynamicHost } from '../../internal/define-dynamic-hook';
import { useApiProxy } from '../../internal/use-api-proxy';
import { createPageApiDefinition } from '../core/api-definition';

import type { FormData } from '../../dynamic-form';
import type { DynamicSearchApi } from '../../dynamic-search';
import type { DynamicTableApi } from '../../dynamic-table';
import type { DynamicPageApi, DynamicPageEventProps, DynamicPageProps } from '../types';

/**
 * 返回绑定了泛型的页面组件与引用稳定的命令式 API。
 * 两个子 API 各自代理到页面实例上的对应成员，因此 api.table.reload() 在挂载前也能排队。
 */
export function useDynamicPage<
  TSearch extends FormData = FormData,
  TRecord extends object = Record<string, unknown>,
>() {
  const instance = shallowRef<DynamicPageApi<TSearch, TRecord>>();

  const search = useApiProxy<DynamicSearchApi<TSearch>>(
    'DynamicPage',
    () => instance.value?.search,
    createSearchApiDefinition<TSearch>(),
  );
  const table = useApiProxy<DynamicTableApi<TRecord>>(
    'DynamicPage',
    () => instance.value?.table,
    createTableApiDefinition<TRecord>(),
  );

  const api = useApiProxy<DynamicPageApi<TSearch, TRecord>>(
    'DynamicPage',
    () => instance.value,
    createPageApiDefinition<TSearch, TRecord>({ search, table }),
  );

  const Page = defineComponent(
    (_props: DynamicPageProps<TSearch, TRecord> & DynamicPageEventProps<TSearch>, ctx) =>
      renderDynamicHost(DynamicPage, instance, ctx),
    { name: 'UseDynamicPage', inheritAttrs: false },
  );

  return [Page, api] as const;
}
