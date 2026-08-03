import { defineComponent } from 'vue';

import DynamicForm from '../components/dynamic-form.vue';
import { renderDynamicHost, useDynamicHost } from '../../internal/define-dynamic-hook';
import { createFormApiDefinition } from '../core/api-definition';

import type { DynamicFormApi, DynamicFormEventProps, DynamicFormProps, FormData } from '../types';

/**
 * 命令式入口：返回 [Form, formApi]。
 * Hook 只做两件事——给出绑定了泛型的组件别名，以及引用稳定的 API 代理。
 * 配置仍然全部写在模板上，与直接使用 DynamicForm 完全一致。
 */
export function useDynamicForm<T extends FormData = FormData>() {
  const { instance, api } = useDynamicHost<DynamicFormApi<T>>(
    'DynamicForm',
    createFormApiDefinition<T>(),
  );

  const Form = defineComponent(
    (_props: DynamicFormProps<T> & DynamicFormEventProps<T>, ctx) =>
      renderDynamicHost(DynamicForm, instance, ctx),
    {
      name: 'UseDynamicForm',
      inheritAttrs: false,
    },
  );

  return [Form, api] as const;
}
