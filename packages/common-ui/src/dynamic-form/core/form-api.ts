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

export class DynamicFormState<T extends FormData = FormData> {
  readonly api: DynamicFormApi<T>;
  readonly formRef: ShallowRef<FormInstance | undefined> = shallowRef();
  readonly schema: Ref<DynamicFormSchema<T>>;
  readonly state: Ref<UseDynamicFormOptions<T>>;

  private readonly valuesRef: Ref<T>;
  private initialValues: T;
  private callbacks: FormApiCallbacks<T> = {};

  constructor(options: UseDynamicFormOptions<T>) {
    // schema.defaultValue 只在初始化时补齐，之后 reset 始终回到这份稳定快照。
    const schema = cloneSchema(options.schema);
    const initialValues = applySchemaDefaults(options.initialValues, schema);

    this.schema = shallowRef(schema) as Ref<DynamicFormSchema<T>>;
    this.initialValues = cloneValue(initialValues);
    this.valuesRef = ref(cloneValue(initialValues)) as Ref<T>;
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
    // 原地同步而非替换 values，避免依赖该响应式对象的字段组件丢失连接。
    if (isEqual(this.valuesRef.value, values)) return;
    syncValues(this.valuesRef.value, values);
  }

  getValues(): T {
    return cloneValue(this.valuesRef.value);
  }

  setValues(values: DeepPartial<T>) {
    // mergeValues 对数组采用替换语义，避免按索引残留旧数据。
    const nextValues = mergeValues(this.valuesRef.value, values);
    if (isEqual(nextValues, this.valuesRef.value)) return;
    syncValues(this.valuesRef.value, nextValues);
    this.callbacks.onValuesChange?.(this.getValues(), []);
  }

  getValue(fieldName: FormPath): unknown {
    return cloneDeep(get(this.valuesRef.value, normalizePath(fieldName)));
  }

  setValue(fieldName: FormPath, value: unknown) {
    const path = normalizePath(fieldName);
    const currentValue = get(this.valuesRef.value, path);
    if (isEqual(currentValue, value)) return;

    set(this.valuesRef.value, path, cloneValue(value));
    this.callbacks.onValuesChange?.(this.getValues(), [pathToString(path)]);
  }

  resetFields(fieldNames?: FormPath[]) {
    if (!fieldNames?.length) {
      syncValues(this.valuesRef.value, this.initialValues);
    } else {
      for (const fieldName of fieldNames) {
        const path = normalizePath(fieldName);
        const initialValue = get(this.initialValues, path);
        if (initialValue === undefined) {
          unset(this.valuesRef.value, path);
        } else {
          set(this.valuesRef.value, path, cloneValue(initialValue));
        }
      }
    }

    this.formRef.value?.resetFields(
      fieldNames?.map((fieldName) => normalizePath(fieldName) as string[]) as
        | string[][]
        | undefined,
    );
    this.formRef.value?.clearValidate(
      fieldNames?.map((fieldName) => normalizePath(fieldName) as string[]) as
        | string[][]
        | undefined,
    );
    this.callbacks.onReset?.(this.getValues());
    this.callbacks.onValuesChange?.(this.getValues(), []);
  }

  async validate(fieldNames?: FormPath[]): Promise<T> {
    if (!this.formRef.value) {
      throw new Error('[DynamicForm] Form is not mounted');
    }

    await this.formRef.value.validateFields(
      fieldNames?.map((fieldName) => normalizePath(fieldName) as string[]),
    );
    return this.getValues();
  }

  async submit(): Promise<T> {
    // 只有校验错误才转成 finishFailed；业务提交异常应原样向调用方传播。
    try {
      const values = await this.validate();
      await this.finish(values);
      return values;
    } catch (error) {
      if (this.isValidationError(error)) {
        this.handleFinishFailed(error);
      }
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
    this.formRef.value?.clearValidate(
      fieldNames?.map((fieldName) => normalizePath(fieldName) as string[]) as
        | string[][]
        | undefined,
    );
  }

  scrollToField(fieldName: FormPath) {
    this.formRef.value?.scrollToField(normalizePath(fieldName) as string[]);
  }

  getSchema(): DynamicFormSchema<T> {
    return cloneSchema(this.schema.value);
  }

  setSchema(schema: DynamicFormSchema<T>) {
    // 对外返回/保存的 schema 都是深拷贝，防止调用方后续修改绕过 API。
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

  setState(state: Partial<UseDynamicFormOptions<T>>) {
    this.state.value = {
      ...this.state.value,
      ...state,
    };
    if (state.schema) this.schema.value = cloneSchema(state.schema);
  }

  normalizeError(error: unknown): DynamicFormValidateError<T> {
    const source = error as {
      values?: T;
      errorFields?: Array<{ name: FormPath; errors: string[] }>;
      outOfDate?: boolean;
    };
    return {
      values: cloneValue(source.values ?? this.valuesRef.value),
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

  /** 创建只包含公共能力的普通对象，方法均为自身属性，便于调试与解构调用。 */
  private createPublicApi(): DynamicFormApi<T> {
    const getReadonlyValues = () => readonly(this.valuesRef.value) as Readonly<T>;
    return {
      get values() {
        return getReadonlyValues();
      },
      getValues: () => this.getValues(),
      setValues: (values) => this.setValues(values),
      getValue: (fieldName) => this.getValue(fieldName),
      setValue: (fieldName, value) => this.setValue(fieldName, value),
      resetFields: (fieldNames) => this.resetFields(fieldNames),
      validate: (fieldNames) => this.validate(fieldNames),
      submit: () => this.submit(),
      clearValidate: (fieldNames) => this.clearValidate(fieldNames),
      scrollToField: (fieldName) => this.scrollToField(fieldName),
      getSchema: () => this.getSchema(),
      setSchema: (schema) => this.setSchema(schema),
      updateSchema: (patches) => this.updateSchema(patches),
      getFormInstance: () => this.getFormInstance(),
      setState: (nextState) => this.setState(nextState),
    };
  }
}

/** 在同一套表单 API 上附加字段信息，不引入第二套 context API。 */
export function scopeDynamicFormApi<T extends FormData, TValue, TExtra extends object = object>(
  api: DynamicFormApi<T>,
  getScope: () => { field: DynamicFormFieldInfo; value: TValue },
  extra?: TExtra,
): DynamicFormFieldApi<T, TValue> & Readonly<TExtra> {
  const scopedApi: DynamicFormFieldApi<T, TValue> = {
    get values() {
      return api.values;
    },
    get value() {
      return getScope().value;
    },
    get field() {
      return getScope().field;
    },
    getValues: api.getValues,
    setValues: api.setValues,
    getValue: api.getValue,
    setValue: api.setValue,
    resetFields: api.resetFields,
    validate: api.validate,
    submit: api.submit,
    clearValidate: api.clearValidate,
    scrollToField: api.scrollToField,
    getSchema: api.getSchema,
    setSchema: api.setSchema,
    updateSchema: api.updateSchema,
    getFormInstance: api.getFormInstance,
    setState: api.setState,
  };
  return Object.assign(scopedApi, extra);
}
