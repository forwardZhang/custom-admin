import type { Ref } from 'vue';

import { computed, ref, shallowRef, watchEffect } from 'vue';

import { useDynamicFormFieldContext } from '../core/context';
import { createFieldApi } from '../core/form-api';
import { extractOptions, handleRequestError, normalizeOptions } from '../utils/options';

import type { DynamicFormOptionRequest, FormData } from '../types';

/**
 * 选项型字段的远程数据加载。
 * 仅 select / radio / checkbox / cascader / treeSelect 包装组件使用。
 */
export function useFormFieldRequest<TProps extends object>(fieldProps: Readonly<Ref<TProps>>) {
  const { api, schema } = useDynamicFormFieldContext<FormData>();
  const opened = ref(false);
  const loading = ref(false);
  const remoteOptions = shallowRef<unknown[] | undefined>();

  const requestConfig = computed<DynamicFormOptionRequest | undefined>(() => {
    const currentSchema = schema.value;
    if (!('request' in currentSchema)) return undefined;
    return currentSchema.request as DynamicFormOptionRequest | undefined;
  });

  const hasRequest = computed(() => Boolean(requestConfig.value));

  watchEffect(async (onCleanup) => {
    const config = requestConfig.value;
    if (!config) {
      remoteOptions.value = undefined;
      loading.value = false;
      return;
    }

    // open 模式：第一次打开后再请求。
    if ((config.loadOn ?? 'mount') === 'open' && !opened.value) return;

    const controller = new AbortController();
    onCleanup(() => controller.abort());

    const requestApi = createFieldApi(api, () => ({ state: api.state, field: api.field }), {
      signal: controller.signal,
    });

    loading.value = true;
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

  // 合并远程 options，并在 open 模式挂钩 onOpenChange。
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
        if (typeof userOpenHandler === 'function') userOpenHandler(open, ...args);
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
