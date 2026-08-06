import type { FormProps } from 'antdv-next';
import type { InjectionKey, Ref } from 'vue';
import { inject, provide } from 'vue';

import type { DynamicFormApi, DynamicFormFieldContext, FormData } from '../types';

/** 表单级上下文：字段需要的全部表单信息，只放字段真正会读的东西。 */
export interface DynamicFormContext<T extends FormData = FormData> {
  formApi: DynamicFormApi<T>;
  /** 表单级标签宽度，字段用它生成 labelCol。 */
  labelWidth: Readonly<Ref<string | number | undefined>>;
  /** 表单级布局；vertical 下标签独占一行，不能套用 labelWidth。 */
  layout: Readonly<Ref<FormProps['layout']>>;
  /** 表单级禁用，优先于字段级 disabled。 */
  disabled: Readonly<Ref<boolean>>;
}

export const dynamicFormContextKey: InjectionKey<DynamicFormContext> =
  Symbol('dynamic-form-context');

export const dynamicFormFieldContextKey: InjectionKey<DynamicFormFieldContext> = Symbol(
  'dynamic-form-field-context',
);

export function provideDynamicFormContext<T extends FormData>(context: DynamicFormContext<T>) {
  provide(dynamicFormContextKey, context as DynamicFormContext);
}

export function useDynamicFormContext<T extends FormData>() {
  const context = inject(dynamicFormContextKey);
  if (!context) throw new Error('[DynamicForm] Must be used inside DynamicForm');
  return context as DynamicFormContext<T>;
}

export function provideDynamicFormFieldContext<T extends FormData>(
  context: DynamicFormFieldContext<T>,
) {
  provide(dynamicFormFieldContextKey, context as DynamicFormFieldContext);
}

export function useDynamicFormFieldContext<T extends FormData>() {
  const context = inject(dynamicFormFieldContextKey);
  if (!context) {
    throw new Error('[DynamicForm] useDynamicFormFieldContext must be used inside a field');
  }
  return context as DynamicFormFieldContext<T>;
}
