import type { Ref } from 'vue';

import { computed, ref, shallowRef, watchEffect } from 'vue';
import { get, isObject } from 'lodash-es';

import { useDynamicFormFieldContext } from '../core/context';
import { scopeDynamicFormApi } from '../core/form-api';
import { pathToString } from '../utils/path';

import type { DynamicFormOptionRequest, DynamicFormOptionRequestApi, FormData } from '../types';

type OptionRecord = Record<string, unknown>;

/**
 * 为选项型字段加载远程数据，并把请求结果合并到控件 props。
 * 仅 select、radio、checkbox、cascader、tree-select 等字段包装组件调用它。
 */
export function useFormFieldRequest<TProps extends object>(fieldProps: Readonly<Ref<TProps>>) {
  const { api, schema } = useDynamicFormFieldContext<FormData>();
  const opened = ref(false);
  const loading = ref(false);
  const remoteOptions = shallowRef<unknown[] | undefined>();

  // request 由字段 schema 动态提供，schema 更新后请求副作用会自动重新执行。
  const requestConfig = computed<DynamicFormOptionRequest | undefined>(() => {
    const currentSchema = schema.value;
    if (!('request' in currentSchema)) return undefined;
    return currentSchema.request as DynamicFormOptionRequest | undefined;
  });

  const hasRequest = computed(() => Boolean(requestConfig.value));

  // watchEffect 同时追踪 request 配置，以及 api 同步读取到的 values/field.value 依赖。
  // 依赖变化或组件卸载时会中止旧请求，避免过期响应覆盖新选项。
  watchEffect(async (onCleanup) => {
    const config = requestConfig.value;
    if (!config) {
      loading.value = false;
      remoteOptions.value = undefined;
      return;
    }

    if (config.loadOn === 'open' && !opened.value) {
      loading.value = false;
      return;
    }

    const controller = new AbortController();
    const requestApi = scopeDynamicFormApi(api, () => ({
      ...api.field,
      signal: controller.signal,
    }));

    loading.value = true;
    onCleanup(() => controller.abort());

    try {
      const response = await config.api(requestApi);
      if (controller.signal.aborted) return;

      const source = extractOptions(response, config.resultField ?? 'data');
      remoteOptions.value = normalizeOptions(source, config);
    } catch (error) {
      if (!controller.signal.aborted) handleRequestError(error, config, requestApi);
    } finally {
      if (!controller.signal.aborted) loading.value = false;
    }
  });

  // 在原始 props 上注入远程选项，并组合 openChange 以支持首次打开时加载。
  const requestFieldProps = computed<TProps>(() => {
    const nextProps = { ...fieldProps.value } as Record<string, unknown>;
    const config = requestConfig.value;
    if (!config) return nextProps as TProps;

    if (remoteOptions.value !== undefined) {
      nextProps[schema.value.component === 'treeSelect' ? 'treeData' : 'options'] =
        remoteOptions.value;
    }

    if (config.loadOn === 'open') {
      const userOpenHandler = nextProps.onOpenChange;
      nextProps.onOpenChange = (open: boolean, ...args: unknown[]) => {
        if (typeof userOpenHandler === 'function') {
          userOpenHandler(open, ...args);
        }
        if (open) opened.value = true;
      };
    }

    return nextProps as TProps;
  });

  return {
    hasRequest,
    loading,
    requestFieldProps,
  };
}

/** 从数组响应或 resultField 指定的对象路径中提取选项数组。 */
function extractOptions(response: unknown, resultField: string): unknown[] {
  const source = Array.isArray(response)
    ? response
    : isObject(response)
      ? get(response, resultField)
      : undefined;

  if (!Array.isArray(source)) {
    throw new TypeError(`[DynamicForm] Option request result "${resultField}" must be an array`);
  }
  return source;
}

/**
 * 将接口字段映射为组件通用的 label/value/disabled/children 结构。
 * children 会递归处理，因此同样适用于 Cascader 和 TreeSelect 的树形数据。
 */
function normalizeOptions<T extends FormData>(
  source: unknown[],
  config: DynamicFormOptionRequest<T>,
): unknown[] {
  const {
    labelField = 'label',
    valueField = 'value',
    childrenField = 'children',
    disabledField = 'disabled',
  } = config;

  return source.map((item) => {
    if (!isObject(item)) {
      return { label: item, value: item };
    }

    const record = item as OptionRecord;
    const children = get(record, childrenField);
    return {
      ...record,
      label: get(record, labelField),
      value: get(record, valueField),
      disabled: get(record, disabledField),
      ...(Array.isArray(children) ? { children: normalizeOptions(children, config) } : {}),
    };
  });
}

/** 优先交给字段自定义错误处理器，否则输出包含字段路径的默认警告。 */
function handleRequestError<T extends FormData>(
  error: unknown,
  config: DynamicFormOptionRequest<T>,
  api: DynamicFormOptionRequestApi<T>,
) {
  if (config.onError) return config.onError(error, api);

  console.warn(`[DynamicForm] Failed to load options for "${pathToString(api.field.path)}"`, error);
}
