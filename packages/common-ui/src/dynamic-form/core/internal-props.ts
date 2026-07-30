import type { DynamicFormProps, FormData } from '../types';
import type { DynamicFormState } from './form-api';

/**
 * DynamicForm 的内部 props。
 * formState 只由 useDynamicForm 传入，不进入 DynamicFormProps——后者被 DynamicSearchProps 继承，
 * 混入内部字段会污染公开类型。
 */
export interface DynamicFormInternalProps<
  T extends FormData = FormData,
> extends DynamicFormProps<T> {
  /** 复用已创建的 State；为空时由组件自建。 */
  formState?: DynamicFormState<T>;
}
