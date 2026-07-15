import type { ComputedRef, InjectionKey, Ref, Slots } from 'vue';
import type { FormItemProps } from 'antdv-next';

import type { DynamicFormController, FormData, FormPath } from '../types';

/** 渲染树内部共享的响应式上下文，避免逐层传递表单状态和 API。 */
export interface DynamicFormContext<T extends FormData = FormData> {
  formData: Ref<T>;
  formApi: DynamicFormController<T>;
  column: ComputedRef<number>;
  labelWidth: ComputedRef<number | string | undefined>;
  disabled: ComputedRef<boolean>;
  readOnly: ComputedRef<boolean>;
  validateTrigger: ComputedRef<FormItemProps['validateTrigger']>;
  slots: Slots;
  updateValue: (path: FormPath | Array<string | number>, value: unknown) => void;
}

/** DynamicForm 内部专用注入键。 */
export const dynamicFormContextKey: InjectionKey<DynamicFormContext> = Symbol('dynamic-form');
