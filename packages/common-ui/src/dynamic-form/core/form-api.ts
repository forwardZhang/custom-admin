import type { FormInstance } from 'antdv-next';
import type { Ref, ShallowRef } from 'vue';

import { cloneDeep, get, isEqual, set, unset } from 'lodash-es';
import { readonly, ref, shallowRef } from 'vue';

import { applySchemaDefaults, cloneSchema, patchSchema } from '../utils/schema';
import { normalizePath, pathToString } from '../utils/path';
import { cloneValue, mergeValues, syncValues } from '../utils/value';

import type {
  DeepPartial,
  DynamicFormApi,
  DynamicFormFieldApi,
  DynamicFormFieldSchema,
  DynamicFormFieldInfo,
  DynamicFormSchema,
  DynamicFormValidateError,
  FormData,
  FormPath,
  UseDynamicFormOptions,
} from '../types';

interface FormApiCallbacks<T extends FormData> {
  onValuesChange?: (values: T, fieldsChanged: string[]) => void;
  onFinish?: (values: T) => void;
  onFinishFailed?: (error: DynamicFormValidateError<T>) => void;
  onReset?: (values: T) => void;
}

/** 公共 API 方法名；createPublicApi / createFieldApi 共用，避免重复罗列。 */
const FORM_API_METHODS = [
  'getStates',
  'setStates',
  'getState',
  'setState',
  'resetFields',
  'validate',
  'submit',
  'clearValidate',
  'scrollToField',
  'getSchema',
  'setSchema',
  'updateSchema',
  'getFormInstance',
  'setOptions',
] as const satisfies readonly (keyof DynamicFormApi)[];

type FormApiMethodName = (typeof FORM_API_METHODS)[number];

function toAntdPaths(fieldNames?: FormPath[]): string[][] | undefined {
  return fieldNames?.map((fieldName) => normalizePath(fieldName) as string[]);
}

/**
 * 表单状态与命令式 API 的唯一实现。
 * DynamicForm 组件和 useDynamicForm 都挂在这上面，不另起一套状态。
 */
export class DynamicFormState<T extends FormData = FormData> {
  readonly api: DynamicFormApi<T>;
  readonly formRef: ShallowRef<FormInstance | undefined> = shallowRef();
  readonly schema: Ref<DynamicFormSchema<T>>;
  readonly state: Ref<UseDynamicFormOptions<T>>;

  private readonly statesRef: Ref<T>;
  private initialValues: T;
  private callbacks: FormApiCallbacks<T> = {};

  constructor(options: UseDynamicFormOptions<T>) {
    // schema.defaultValue 只在初始化时补齐，reset 始终回到这份快照。
    const schema = cloneSchema(options.schema);
    const initialValues = applySchemaDefaults(options.initialValues, schema);

    this.schema = shallowRef(schema) as Ref<DynamicFormSchema<T>>;
    this.initialValues = cloneValue(initialValues);
    this.statesRef = ref(cloneValue(initialValues)) as Ref<T>;
    this.state = shallowRef({
      ...options,
      schema,
      initialValues: cloneValue(initialValues),
    }) as Ref<UseDynamicFormOptions<T>>;
    this.api = this.createPublicApi();
  }

  setCallbacks(callbacks: FormApiCallbacks<T>) {
    this.callbacks = callbacks;
  }

  setFormRef(form: FormInstance | undefined) {
    this.formRef.value = form;
  }

  syncExternalValues(values: T) {
    // 原地同步，保留根对象响应式引用。
    if (isEqual(this.statesRef.value, values)) return;
    syncValues(this.statesRef.value, values);
  }

  getStates(): T {
    return cloneValue(this.statesRef.value);
  }

  setStates(states: DeepPartial<T>) {
    // 数组按整体替换，避免按索引残留旧数据。
    const nextStates = mergeValues(this.statesRef.value, states);
    if (isEqual(nextStates, this.statesRef.value)) return;
    syncValues(this.statesRef.value, nextStates);
    this.callbacks.onValuesChange?.(this.getStates(), []);
  }

  getState(fieldName: FormPath): unknown {
    return cloneDeep(get(this.statesRef.value, normalizePath(fieldName)));
  }

  setState(fieldName: FormPath, state: unknown) {
    const path = normalizePath(fieldName);
    const currentState = get(this.statesRef.value, path);
    if (isEqual(currentState, state)) return;

    set(this.statesRef.value, path, cloneValue(state));
    this.callbacks.onValuesChange?.(this.getStates(), [pathToString(path)]);
  }

  resetFields(fieldNames?: FormPath[]) {
    if (!fieldNames?.length) {
      syncValues(this.statesRef.value, this.initialValues);
    } else {
      for (const fieldName of fieldNames) {
        const path = normalizePath(fieldName);
        const initialValue = get(this.initialValues, path);
        if (initialValue === undefined) unset(this.statesRef.value, path);
        else set(this.statesRef.value, path, cloneValue(initialValue));
      }
    }

    this.formRef.value?.resetFields(toAntdPaths(fieldNames));
    this.formRef.value?.clearValidate(toAntdPaths(fieldNames));
    this.callbacks.onReset?.(this.getStates());
    this.callbacks.onValuesChange?.(this.getStates(), []);
  }

  async validate(fieldNames?: FormPath[]): Promise<T> {
    if (!this.formRef.value) throw new Error('[DynamicForm] Form is not mounted');
    await this.formRef.value.validateFields(toAntdPaths(fieldNames));
    return this.getStates();
  }

  async submit(): Promise<T> {
    // 校验错误走 finishFailed；业务 submit 异常原样抛出。
    try {
      const values = await this.validate();
      await this.finish(values);
      return values;
    } catch (error) {
      if (this.isValidationError(error)) this.handleFinishFailed(error);
      throw error;
    }
  }

  async finish(values: T): Promise<T> {
    const nextValues = cloneValue(values);
    await this.state.value.handleSubmit?.(nextValues);
    this.callbacks.onFinish?.(nextValues);
    return nextValues;
  }

  handleFinishFailed(error: unknown) {
    const normalized = this.normalizeError(error);
    this.callbacks.onFinishFailed?.(normalized);
    this.state.value.handleFinishFailed?.(normalized);
  }

  clearValidate(fieldNames?: FormPath[]) {
    this.formRef.value?.clearValidate(toAntdPaths(fieldNames));
  }

  scrollToField(fieldName: FormPath) {
    this.formRef.value?.scrollToField(normalizePath(fieldName) as string[]);
  }

  getSchema(): DynamicFormSchema<T> {
    return cloneSchema(this.schema.value);
  }

  setSchema(schema: DynamicFormSchema<T>) {
    this.schema.value = cloneSchema(schema);
    this.state.value = {
      ...this.state.value,
      schema: this.getSchema(),
    };
    this.state.value.handleSchemaChange?.(this.getSchema());
  }

  updateSchema(patches: Array<Partial<DynamicFormFieldSchema<T>> & { fieldName: FormPath }>) {
    this.setSchema(patchSchema(this.schema.value, patches));
  }

  getFormInstance() {
    return this.formRef.value;
  }

  setOptions(options: Partial<UseDynamicFormOptions<T>>) {
    this.state.value = {
      ...this.state.value,
      ...options,
    };
    if (options.schema) this.schema.value = cloneSchema(options.schema);
  }

  normalizeError(error: unknown): DynamicFormValidateError<T> {
    const source = error as {
      values?: T;
      errorFields?: Array<{ name: FormPath; errors: string[] }>;
      outOfDate?: boolean;
    };
    return {
      states: cloneValue(source.values ?? this.statesRef.value),
      errorFields: (source.errorFields ?? []).map((field) => ({
        name: field.name,
        errors: [...field.errors],
      })),
      outOfDate: source.outOfDate,
    };
  }

  private isValidationError(error: unknown): boolean {
    return Boolean(error && typeof error === 'object' && 'errorFields' in error);
  }

  /** 创建普通对象 API，方法是自身属性，便于调试与解构。 */
  private createPublicApi(): DynamicFormApi<T> {
    const api: Partial<DynamicFormApi<T>> = {};

    // states 需要读私有 ref，单独用闭包实现。
    Object.defineProperty(api, 'states', {
      enumerable: true,
      get: () => readonly(this.statesRef.value) as Readonly<T>,
    });

    for (const method of FORM_API_METHODS) {
      const fn = this[method as FormApiMethodName] as (...args: unknown[]) => unknown;
      api[method] = fn.bind(this) as never;
    }

    return api as DynamicFormApi<T>;
  }
}

/**
 * 在同一套表单 API 上附加字段 scope（state / field 元信息）。
 * 字段回调、request、list 动作都复用它，不另造 API。
 */
export function createFieldApi<T extends FormData, TValue, TExtra extends object = object>(
  api: DynamicFormApi<T>,
  getScope: () => { field: DynamicFormFieldInfo; state: TValue },
  extra?: TExtra,
): DynamicFormFieldApi<T, TValue> & Readonly<TExtra> {
  const fieldApi: Partial<DynamicFormFieldApi<T, TValue>> = {};

  Object.defineProperties(fieldApi, {
    states: {
      enumerable: true,
      get: () => api.states,
    },
    state: {
      enumerable: true,
      get: () => getScope().state,
    },
    field: {
      enumerable: true,
      get: () => getScope().field,
    },
  });

  for (const method of FORM_API_METHODS) {
    fieldApi[method] = api[method] as never;
  }

  return Object.assign(fieldApi, extra) as DynamicFormFieldApi<T, TValue> & Readonly<TExtra>;
}

/** @deprecated 使用 createFieldApi；保留别名避免遗漏引用。 */
export const scopeDynamicFormApi = createFieldApi;
