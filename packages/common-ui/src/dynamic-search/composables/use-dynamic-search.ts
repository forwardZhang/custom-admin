import type { Component } from 'vue';

import { cloneDeep } from 'lodash-es';
import { defineComponent, h, shallowRef } from 'vue';

import DynamicSearch from '../components/dynamic-search.vue';
import { createSearchApiProxy } from '../utils/create-api';

import type { DynamicFormValidateError, FormData } from '../../dynamic-form';
import type { DynamicSearchApi, DynamicSearchInstance, UseDynamicSearchOptions } from '../types';

function invokeListener(listener: unknown, args: unknown[]): void {
  if (Array.isArray(listener)) {
    listener.forEach((item) => invokeListener(item, args));
    return;
  }
  if (typeof listener === 'function') listener(...args);
}

/** 创建由运行时配置驱动的搜索组件，并返回对应的命令式 API。 */
export function useDynamicSearch<T extends FormData = FormData>(
  options: UseDynamicSearchOptions<T>,
) {
  const state = shallowRef({ ...options });
  const searchRef = shallowRef<DynamicSearchInstance<T>>();
  const values = shallowRef(cloneDeep(options.initialValues ?? {}) as T);
  const expanded = shallowRef(Boolean(options.defaultExpanded));

  function getSearchInstance(): DynamicSearchInstance<T> {
    if (!searchRef.value) throw new Error('[useDynamicSearch] Search is not mounted');
    return searchRef.value;
  }

  function toggleExpand(force?: boolean): void {
    const nextExpanded = force ?? !expanded.value;
    expanded.value = nextExpanded;

    if (searchRef.value) searchRef.value.toggleExpand(nextExpanded);
    else state.value = { ...state.value, defaultExpanded: nextExpanded };
  }

  function setOptions(nextOptions: Partial<UseDynamicSearchOptions<T>>): void {
    state.value = { ...state.value, ...nextOptions };

    if ('initialValues' in nextOptions && !searchRef.value) {
      values.value = cloneDeep(nextOptions.initialValues ?? {}) as T;
    }
    if ('defaultExpanded' in nextOptions) toggleExpand(Boolean(nextOptions.defaultExpanded));
  }

  const searchApi = createSearchApiProxy<T, Partial<UseDynamicSearchOptions<T>>>({
    formApi: getSearchInstance,
    getExpanded: () => searchRef.value?.expanded ?? expanded.value,
    setOptions,
    toggleExpand,
  }) as DynamicSearchApi<T>;

  const Search = defineComponent({
    name: 'UseDynamicSearch',
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () => {
        const {
          initialValues: _initialValues,
          handleSearch,
          handleReset,
          handleValuesChange,
          handleFinishFailed,
          handleSchemaChange,
          handleExpandChange,
          ...searchOptions
        } = state.value;

        return h(
          DynamicSearch as Component,
          {
            ...searchOptions,
            ...attrs,
            defaultExpanded: expanded.value,
            modelValue: values.value,
            ref: (instance: unknown) => {
              searchRef.value = instance as DynamicSearchInstance<T> | undefined;
            },
            'onUpdate:modelValue': (nextValues: T) => {
              values.value = cloneDeep(nextValues);
              invokeListener(attrs['onUpdate:modelValue'], [nextValues]);
            },
            onValuesChange: (nextValues: T, fieldsChanged: string[]) => {
              handleValuesChange?.(nextValues, fieldsChanged);
              invokeListener(attrs.onValuesChange, [nextValues, fieldsChanged]);
            },
            onSearch: (nextValues: T) => {
              void handleSearch?.(nextValues);
              invokeListener(attrs.onSearch, [nextValues]);
            },
            onReset: (nextValues: T) => {
              values.value = cloneDeep(nextValues);
              void handleReset?.(nextValues);
              invokeListener(attrs.onReset, [nextValues]);
            },
            onFinishFailed: (error: DynamicFormValidateError<T>) => {
              handleFinishFailed?.(error);
              invokeListener(attrs.onFinishFailed, [error]);
            },
            onSchemaChange: (schema: UseDynamicSearchOptions<T>['schema']) => {
              handleSchemaChange?.(schema);
              invokeListener(attrs.onSchemaChange, [schema]);
            },
            onExpandChange: (nextExpanded: boolean) => {
              expanded.value = nextExpanded;
              handleExpandChange?.(nextExpanded);
              invokeListener(attrs.onExpandChange, [nextExpanded]);
            },
          },
          slots,
        );
      };
    },
  });

  return [Search, searchApi] as const;
}
