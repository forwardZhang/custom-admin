import { defineComponent } from 'vue';

import DynamicSearch from '../components/dynamic-search.vue';
import { renderDynamicHost, useDynamicHost } from '../../internal/define-dynamic-hook';
import { createSearchApiDefinition } from '../core/api-definition';

import type { FormData } from '../../dynamic-form';
import type { DynamicSearchApi, DynamicSearchEventProps, DynamicSearchProps } from '../types';

/**
 * 返回绑定了泛型的搜索组件与引用稳定的命令式 API。
 * 配置全部写在模板上（与直接使用 DynamicSearch 完全一致），Hook 只解决泛型推断与 api 取用。
 */
export function useDynamicSearch<T extends FormData = FormData>() {
  const { instance, api } = useDynamicHost<DynamicSearchApi<T>>(
    'DynamicSearch',
    createSearchApiDefinition<T>(),
  );

  const Search = defineComponent(
    (_props: DynamicSearchProps<T> & DynamicSearchEventProps<T>, ctx) =>
      renderDynamicHost(DynamicSearch, instance, ctx),
    { name: 'UseDynamicSearch', inheritAttrs: false },
  );

  return [Search, api] as const;
}
