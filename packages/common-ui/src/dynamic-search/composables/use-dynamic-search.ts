import type { Component } from 'vue';

import { defineComponent, h } from 'vue';

import DynamicSearch from '../components/dynamic-search.vue';
import { DynamicSearchState } from '../core/search-state';

import type { FormData } from '../../dynamic-form';
import type { UseDynamicSearchOptions } from '../types';

/**
 * 创建由运行时配置驱动的搜索组件，并返回对应的命令式 API。
 * State 在这里创建，通过 searchState prop 交给 DynamicSearch 复用，
 * 因此 searchApi 在组件挂载之前就可以读写表单值与 schema。
 */
export function useDynamicSearch<T extends FormData = FormData>(
  options: UseDynamicSearchOptions<T>,
) {
  const searchState = new DynamicSearchState<T>(options);

  const Search = defineComponent(
    (_props, { attrs, slots }) => {
      return () => h(DynamicSearch as Component, { ...attrs, searchState }, slots);
    },
    {
      name: 'UseDynamicSearch',
      inheritAttrs: false,
    },
  );

  return [Search, searchState.api] as const;
}
