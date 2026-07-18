import type { Component } from 'vue';

import { defineComponent, h, onBeforeUnmount, provide } from 'vue';

import DynamicForm from '../components/dynamic-form.vue';
import { dynamicFormStateKey } from '../core/context';
import { DynamicFormState } from '../core/form-api';

import type { FormData, UseDynamicFormOptions } from '../types';

/**
 * 创建一个由 DynamicFormState 驱动的表单组件，并返回对应的命令式 API。
 * 组件通过闭包持有 formApi，因此调用方无需手动同步 schema、表单值和实例引用。
 */
export function useDynamicForm<T extends FormData = FormData>(options: UseDynamicFormOptions<T>) {
  const formApi = new DynamicFormState<T>(options);

  // 每次渲染都从 formApi 读取最新状态，使 setState、setSchema 等命令式操作立即反映到组件。
  const Form = defineComponent(
    (_props, { attrs, slots }) => {
      provide(dynamicFormStateKey, formApi);
      onBeforeUnmount(() => formApi.setFormRef(undefined));

      return () => {
        // 这些回调由 DynamicFormState 自己消费，不应继续作为组件 props 透传。
        const {
          initialValues: _initialValues,
          handleSubmit: _handleSubmit,
          handleReset: _handleReset,
          handleValuesChange: _handleValuesChange,
          handleFinishFailed: _handleFinishFailed,
          handleSchemaChange: _handleSchemaChange,
          handleCollapsedChange: _handleCollapsedChange,
          ...formOptions
        } = formApi.state.value;

        return h(
          DynamicForm as Component,
          {
            ...formOptions,
            ...attrs,
            schema: formApi.schema.value,
            modelValue: formApi.formData.value,
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
