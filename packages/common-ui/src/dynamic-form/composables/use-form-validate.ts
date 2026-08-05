import type { FormInstance } from 'antdv-next';

import { normalizePath } from '../utils/path';

import type { DynamicFormValidateError, FormData, FormPath } from '../types';

export interface UseFormValidateOptions<T extends FormData> {
  /** 底层 Antdv Form 实例，未挂载时为 undefined。 */
  getNativeInstance: () => FormInstance | undefined;
  getValues: () => Readonly<T>;
  /** 校验通过后的提交流程，由宿主负责触发 finish 事件。 */
  finish: (values: Readonly<T>) => void | Promise<void>;
  onFinishFailed: (error: DynamicFormValidateError<T>) => void;
}

/** Antdv 的字段路径只接受字符串数组形式。 */
function toAntdPaths(fieldNames?: FormPath[]): string[][] | undefined {
  return fieldNames?.map((fieldName) => normalizePath(fieldName) as string[]);
}

/** 校验、提交与校验状态清理：所有对底层 Form 实例的调用都收在这里。 */
export function useFormValidate<T extends FormData>(options: UseFormValidateOptions<T>) {
  async function validate(fieldNames?: FormPath[]): Promise<Readonly<T>> {
    const form = options.getNativeInstance();
    if (!form) throw new Error('[DynamicForm] Form is not mounted');

    await form.validateFields(toAntdPaths(fieldNames));
    return options.getValues();
  }

  function clearValidate(fieldNames?: FormPath[]): void {
    options.getNativeInstance()?.clearValidate(toAntdPaths(fieldNames));
  }

  function scrollToField(fieldName: FormPath): void {
    options.getNativeInstance()?.scrollToField(normalizePath(fieldName) as string[]);
  }

  /** 把 Antdv 的校验错误标准化成对外统一结构。 */
  function normalizeError(error: unknown): DynamicFormValidateError<T> {
    const source = (error ?? {}) as {
      values?: T;
      errorFields?: Array<{ name: FormPath; errors: string[] }>;
      outOfDate?: boolean;
    };

    // source.values 来自底层 Form 的 reject，本身已是独立对象；
    // 兜底路径用只读视图，都不需要再克隆一遍。
    return {
      values: source.values ?? options.getValues(),
      errorFields: (source.errorFields ?? []).map((field) => ({
        name: field.name,
        errors: [...field.errors],
      })),
      outOfDate: source.outOfDate,
    };
  }

  function isValidationError(error: unknown): boolean {
    return Boolean(error && typeof error === 'object' && 'errorFields' in error);
  }

  function handleFinishFailed(error: unknown): void {
    options.onFinishFailed(normalizeError(error));
  }

  /** 校验错误走 finishFailed；业务 finish 的异常原样抛出。 */
  async function submit(): Promise<Readonly<T>> {
    try {
      const values = await validate();
      await options.finish(values);
      return values;
    } catch (error) {
      if (isValidationError(error)) handleFinishFailed(error);
      throw error;
    }
  }

  return {
    validate,
    clearValidate,
    scrollToField,
    handleFinishFailed,
    submit,
  };
}
