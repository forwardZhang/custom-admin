import type { FormInstance } from 'antdv-next';
import type { Ref, ShallowRef } from 'vue';

import { cloneDeep, get, isEqual, set, unset } from 'lodash-es';
import { ref, shallowRef } from 'vue';

import { applySchemaDefaults, cloneSchema, patchSchema } from '../utils/schema';
import { normalizePath, pathToString } from '../utils/path';
import { cloneValue, mergeValues, syncValues } from '../utils/value';

import type {
  DeepPartial,
  DynamicFormApi,
  DynamicFormFieldSchema,
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

export class DynamicFormState<T extends FormData = FormData> implements DynamicFormApi<T> {
  readonly formData: Ref<T>;
  readonly formRef: ShallowRef<FormInstance | undefined> = shallowRef();
  readonly schema: Ref<DynamicFormSchema<T>>;
  readonly state: Ref<UseDynamicFormOptions<T>>;

  private initialValues: T;
  private callbacks: FormApiCallbacks<T> = {};

  constructor(options: UseDynamicFormOptions<T>) {
    const schema = cloneSchema(options.schema);
    const initialValues = applySchemaDefaults(options.initialValues, schema);

    this.schema = shallowRef(schema) as Ref<DynamicFormSchema<T>>;
    this.initialValues = cloneValue(initialValues);
    this.formData = ref(cloneValue(initialValues)) as Ref<T>;
    this.state = shallowRef({
      ...options,
      schema,
      initialValues: cloneValue(initialValues),
    }) as Ref<UseDynamicFormOptions<T>>;
  }

  setCallbacks(callbacks: FormApiCallbacks<T>) {
    this.callbacks = callbacks;
  }

  setFormRef(form: FormInstance | undefined) {
    this.formRef.value = form;
  }

  syncExternalValues(values: T) {
    if (isEqual(this.formData.value, values)) return;
    syncValues(this.formData.value, values);
  }

  getValues(): T {
    return cloneValue(this.formData.value);
  }

  setValues(values: DeepPartial<T>) {
    const nextValues = mergeValues(this.formData.value, values);
    if (isEqual(nextValues, this.formData.value)) return;
    syncValues(this.formData.value, nextValues);
    this.callbacks.onValuesChange?.(this.getValues(), []);
  }

  getValue(fieldName: FormPath): unknown {
    return cloneDeep(get(this.formData.value, normalizePath(fieldName)));
  }

  setValue(fieldName: FormPath, value: unknown) {
    const path = normalizePath(fieldName);
    const currentValue = get(this.formData.value, path);
    if (isEqual(currentValue, value)) return;

    set(this.formData.value, path, cloneValue(value));
    this.callbacks.onValuesChange?.(this.getValues(), [pathToString(path)]);
  }

  resetFields(fieldNames?: FormPath[]) {
    if (!fieldNames?.length) {
      syncValues(this.formData.value, this.initialValues);
    } else {
      for (const fieldName of fieldNames) {
        const path = normalizePath(fieldName);
        const initialValue = get(this.initialValues, path);
        if (initialValue === undefined) {
          unset(this.formData.value, path);
        } else {
          set(this.formData.value, path, cloneValue(initialValue));
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
      values: cloneValue(source.values ?? this.formData.value),
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
}
