import { reactive, watchEffect } from 'vue';

import type {
  DynamicFormResolvable,
  DynamicFormResolveContext,
  DynamicFormRule,
  FormData,
} from '../types';

interface DynamicSchemaConfig<T extends FormData> {
  if?: DynamicFormResolvable<T, boolean>;
  disabled?: DynamicFormResolvable<T, boolean>;
  required?: DynamicFormResolvable<T, boolean>;
  rules?: DynamicFormResolvable<T, DynamicFormRule[]>;
  componentProps?: DynamicFormResolvable<T, object>;
}

export interface SchemaRuntimeState {
  shouldRender: boolean;
  disabled: boolean;
  required: boolean;
  rules: DynamicFormRule[];
  componentProps: object;
}

const resolveSchemaValue = <T extends FormData, R>(
  value: DynamicFormResolvable<T, R> | undefined,
  context: DynamicFormResolveContext<T>,
  fallback: R,
) => {
  if (typeof value !== 'function') return value ?? fallback;

  try {
    return (value as (context: DynamicFormResolveContext<T>) => R)(context);
  } catch (error) {
    console.error('[DynamicForm] schema value evaluation failed:', error);
    return fallback;
  }
};

export const useSchemaState = <T extends FormData>(
  schema: () => DynamicSchemaConfig<T>,
  getContext: () => DynamicFormResolveContext<T>,
): SchemaRuntimeState => {
  const state = reactive<SchemaRuntimeState>({
    shouldRender: true,
    disabled: false,
    required: false,
    rules: [],
    componentProps: {},
  });

  // 每项独立收集依赖，避免 disabled 读取的路径导致 componentProps 等无关函数重复求值。
  watchEffect(() => {
    state.shouldRender = resolveSchemaValue(schema().if, getContext(), true);
  });
  watchEffect(() => {
    state.disabled = resolveSchemaValue(schema().disabled, getContext(), false);
  });
  watchEffect(() => {
    state.required = resolveSchemaValue(schema().required, getContext(), false);
  });
  watchEffect(() => {
    state.rules = resolveSchemaValue(schema().rules, getContext(), []);
  });
  watchEffect(() => {
    state.componentProps = resolveSchemaValue(schema().componentProps, getContext(), {});
  });

  return state;
};
