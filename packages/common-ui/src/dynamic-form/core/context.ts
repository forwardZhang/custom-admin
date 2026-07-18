import type { InjectionKey, Ref } from 'vue';
import { inject, provide } from 'vue';

import type {
  DynamicFormApi,
  DynamicFormFieldContext,
  DynamicFormFieldSchema,
  DynamicFormProps,
  FormData,
  NormalizedFormPath,
} from '../types';
import type { DynamicFormState } from './form-api';

export interface DynamicFormContext<T extends FormData = FormData> {
  formData: Readonly<Ref<T>>;
  formApi: DynamicFormApi<T>;
  props: Readonly<Ref<DynamicFormProps<T>>>;
  disabled: Readonly<Ref<boolean>>;
}

export const dynamicFormContextKey: InjectionKey<DynamicFormContext> =
  Symbol('dynamic-form-context');

export const dynamicFormFieldContextKey: InjectionKey<DynamicFormFieldContext> = Symbol(
  'dynamic-form-field-context',
);

export const dynamicFormStateKey: InjectionKey<unknown> = Symbol('dynamic-form-state');

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

export function useDynamicFormField<T extends FormData>() {
  const context = inject(dynamicFormFieldContextKey);
  if (!context) {
    throw new Error('[DynamicForm] useDynamicFormField must be used inside a field');
  }
  return context as DynamicFormFieldContext<T>;
}

export type { NormalizedFormPath };
