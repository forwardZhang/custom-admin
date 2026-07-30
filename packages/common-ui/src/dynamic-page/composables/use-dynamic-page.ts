import type { Component } from 'vue';

import { defineComponent, h } from 'vue';

import DynamicPage from '../components/dynamic-page.vue';
import { DynamicPageState } from '../core/page-state';

import type { FormData } from '../../dynamic-form';
import type { UseDynamicPageOptions, UseDynamicPageReturn } from '../types';

/**
 * DynamicPage 的 Hook 用法。
 * 页面编排状态在这里创建，searchApi / tableApi 在组件挂载之前就已可用。
 */
export function useDynamicPage<
  TSearch extends FormData = FormData,
  TRecord extends object = Record<string, unknown>,
>(options: UseDynamicPageOptions<TSearch, TRecord>): UseDynamicPageReturn<TSearch, TRecord> {
  const pageState = new DynamicPageState<TSearch, TRecord>(options);

  const Page = defineComponent(
    (_props, { attrs, slots }) => {
      return () => h(DynamicPage as Component, { ...attrs, pageState }, slots);
    },
    {
      name: 'UseDynamicPage',
      inheritAttrs: false,
    },
  );

  return [Page, pageState.searchApi, pageState.tableApi] as const;
}
