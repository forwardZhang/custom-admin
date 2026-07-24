import type { Component } from 'vue';

import { defineComponent, h, onBeforeUnmount, provide } from 'vue';

import DynamicForm from '../components/dynamic-form.vue';
import { dynamicFormStateKey } from '../core/context';
import { DynamicFormState } from '../core/form-api';

import type { FormData, UseDynamicFormOptions } from '../types';

/**
 * 命令式入口：返回 [Form, formApi]。
 * Form 内部 provide DynamicFormState，DynamicForm 直接复用，不再创建第二份状态。
 */
export function useDynamicForm<T extends FormData = FormData>(options: UseDynamicFormOptions<T>) {
  const formState = new DynamicFormState<T>(options);
  const formApi = formState.api;

  const Form = defineComponent(
    (_props, { attrs, slots }) => {
      provide(dynamicFormStateKey, formState);
      onBeforeUnmount(() => formState.setFormRef(undefined));

      return () => {
        // 这些回调由 DynamicFormState 自己消费，不要再透传成组件 props。
        const {
          initialValues: _initialValues,
          handleSubmit: _handleSubmit,
          handleReset: _handleReset,
          handleValuesChange: _handleValuesChange,
          handleFinishFailed: _handleFinishFailed,
          handleSchemaChange: _handleSchemaChange,
          ...formOptions
        } = formState.state.value;

        return h(
          DynamicForm as Component,
          {
            ...formOptions,
            ...attrs,
            schema: formState.schema.value,
            modelValue: formApi.states,
          },
          slots,
        );
      };
    },
    {
      name: 'UseDynamicForm',
      inheritAttrs: false,
    },
  );

  return [Form, formApi] as const;
}
