import type {
  ButtonProps,
  CascaderProps,
  CheckboxGroupProps,
  DatePickerProps,
  FormInstance,
  FormItemProps,
  FormProps,
  InputNumberProps,
  InputProps,
  RadioGroupProps,
  RangePickerProps,
  Rule,
  SelectProps,
  SwitchProps,
  TextAreaProps,
  TimePickerProps,
  TreeSelectProps,
} from 'antdv-next';
import type { Component, Ref, VNodeChild } from 'vue';

export type FormData = object;

export type FormPath = string | readonly (string | number)[];
export type NormalizedFormPath = readonly (string | number)[];

export type DeepPartial<T> = T extends readonly (infer U)[]
  ? Array<DeepPartial<U>>
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

export type BuiltinComponentName =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'switch'
  | 'datePicker'
  | 'rangePicker'
  | 'timePicker'
  | 'cascader'
  | 'treeSelect';

export type DynamicFormOptionComponentName = Extract<
  BuiltinComponentName,
  'cascader' | 'checkbox' | 'radio' | 'select' | 'treeSelect'
>;

export type DynamicFormOptionLoadOn = 'mount' | 'open';

export type BuiltinFieldPropsMap = {
  text: Omit<InputProps, 'value'>;
  textarea: Omit<TextAreaProps, 'value'>;
  number: Omit<InputNumberProps, 'value'>;
  select: Omit<SelectProps, 'value'>;
  radio: Omit<RadioGroupProps, 'value'>;
  checkbox: Omit<CheckboxGroupProps, 'value'>;
  switch: Omit<SwitchProps, 'checked'>;
  datePicker: Omit<DatePickerProps, 'value'>;
  rangePicker: Omit<RangePickerProps, 'value'>;
  timePicker: Omit<TimePickerProps, 'value'>;
  cascader: Omit<CascaderProps, 'value'>;
  treeSelect: Omit<TreeSelectProps, 'value'>;
};

export interface DynamicFormButtonOptions extends Omit<ButtonProps, 'children'> {
  content?: string;
  show?: boolean;
}

export interface DynamicFormApi<T extends FormData = FormData> {
  readonly formData: Readonly<Ref<T>>;
  readonly formRef: Readonly<Ref<FormInstance | undefined>>;
  getValues(): T;
  setValues(values: DeepPartial<T>): void;
  getValue(fieldName: FormPath): unknown;
  setValue(fieldName: FormPath, value: unknown): void;
  resetFields(fieldNames?: FormPath[]): void;
  validate(fieldNames?: FormPath[]): Promise<T>;
  submit(): Promise<T>;
  clearValidate(fieldNames?: FormPath[]): void;
  scrollToField(fieldName: FormPath): void;
  getSchema(): DynamicFormSchema<T>;
  setSchema(schema: DynamicFormSchema<T>): void;
  updateSchema(patches: Array<Partial<DynamicFormFieldSchema<T>> & { fieldName: FormPath }>): void;
  getFormInstance(): FormInstance | undefined;
  setState(state: Partial<UseDynamicFormOptions<T>>): void;
}

export interface DynamicFormResolveContext<T extends FormData = FormData, TValue = unknown> {
  values: Readonly<T>;
  value: TValue;
  fieldName: FormPath;
  fieldPath: NormalizedFormPath;
  basePath: NormalizedFormPath;
  api: DynamicFormApi<T>;
}

export interface DynamicFormOptionRequestContext<
  T extends FormData = FormData,
  TValue = unknown,
> extends DynamicFormResolveContext<T, TValue> {
  readonly signal: AbortSignal;
}

export interface DynamicFormOptionRequest<
  T extends FormData = FormData,
  TLoadOn extends DynamicFormOptionLoadOn = DynamicFormOptionLoadOn,
> {
  api(context: DynamicFormOptionRequestContext<T>): Promise<unknown>;
  loadOn?: TLoadOn;
  resultField?: string;
  labelField?: string;
  valueField?: string;
  childrenField?: string;
  disabledField?: string;
  onError?: (error: unknown, context: DynamicFormOptionRequestContext<T>) => void;
}

export interface DynamicFormFieldEventContext<
  T extends FormData = FormData,
  TValue = unknown,
> extends DynamicFormResolveContext<T, TValue> {
  oldValue: unknown;
  nativeArgs: readonly unknown[];
}

export type DynamicFormResolver<T extends FormData, R, TValue = unknown> = (
  context: DynamicFormResolveContext<T, TValue>,
) => R;

export type DynamicFormContent<T extends FormData = FormData> =
  | VNodeChild
  | DynamicFormResolver<T, VNodeChild>;

export type DynamicFormFieldEventHandler<T extends FormData = FormData> = (
  context: DynamicFormFieldEventContext<T>,
) => void;

export interface DynamicFormComponentModel {
  prop: string;
  event: string;
}

type DynamicFormFieldBase<T extends FormData> = {
  fieldName: FormPath;
  label?: DynamicFormContent<T>;
  help?: DynamicFormContent<T>;
  description?: DynamicFormContent<T>;
  defaultValue?: unknown;
  alwaysShow?: boolean;
  if?: boolean | DynamicFormResolver<T, boolean>;
  show?: boolean | DynamicFormResolver<T, boolean>;
  disabled?: boolean | DynamicFormResolver<T, boolean>;
  required?: boolean | DynamicFormResolver<T, boolean>;
  requiredMessage?: string;
  rules?: Rule[] | DynamicFormResolver<T, Rule[]>;
  formItemProps?: Partial<Omit<FormItemProps, 'name' | 'label' | 'rules' | 'help' | 'extra'>>;
  itemClass?: string;
  componentModel?: DynamicFormComponentModel;
  onChange?: DynamicFormFieldEventHandler<T>;
  renderComponentContent?: (
    context: DynamicFormResolveContext<T>,
  ) => Record<string, () => VNodeChild>;
};

type DynamicFormBuiltinRequest<
  T extends FormData,
  K extends BuiltinComponentName,
> = K extends DynamicFormOptionComponentName
  ? {
      request?: DynamicFormOptionRequest<
        T,
        K extends 'checkbox' | 'radio' ? 'mount' : DynamicFormOptionLoadOn
      >;
    }
  : { request?: never };

export type DynamicFormBuiltinFieldSchema<T extends FormData = FormData> = {
  [K in BuiltinComponentName]: DynamicFormFieldBase<T> & {
    component: K;
    fieldProps?: BuiltinFieldPropsMap[K] | DynamicFormResolver<T, BuiltinFieldPropsMap[K]>;
  } & DynamicFormBuiltinRequest<T, K>;
}[BuiltinComponentName];

export interface DynamicFormCustomFieldSchema<
  T extends FormData = FormData,
> extends DynamicFormFieldBase<T> {
  component: Component;
  fieldProps?: Record<string, unknown> | DynamicFormResolver<T, Record<string, unknown>>;
}

export type DynamicFormFieldSchema<T extends FormData = FormData> =
  | DynamicFormBuiltinFieldSchema<T>
  | DynamicFormCustomFieldSchema<T>;

export type DynamicFormSchema<T extends FormData = FormData> = DynamicFormFieldSchema<T>[];

export interface DynamicFormValidateError<T extends FormData = FormData> {
  values: T;
  errorFields: Array<{
    name: FormPath;
    errors: string[];
  }>;
  outOfDate?: boolean;
}

export type DynamicFormEmits<T extends FormData = FormData> = {
  'update:modelValue': [value: T];
  valuesChange: [values: T, fieldsChanged: string[]];
  finish: [values: T];
  finishFailed: [error: DynamicFormValidateError<T>];
  reset: [values: T];
  schemaChange: [schema: DynamicFormSchema<T>];
  collapsedChange: [collapsed: boolean];
};

export interface DynamicFormProps<T extends FormData = FormData> {
  modelValue?: T;
  schema: DynamicFormSchema<T>;
  layout?: FormProps['layout'];
  disabled?: boolean;
  labelWidth?: string | number;
  wrapperClass?: string;
  showDefaultActions?: boolean;
  showCollapseButton?: boolean;
  collapsed?: boolean;
  collapsedRows?: number;
  scrollToFirstError?: FormProps['scrollToFirstError'];
  formProps?: Partial<
    Omit<
      FormProps,
      | 'model'
      | 'layout'
      | 'disabled'
      | 'onFinish'
      | 'onFinishFailed'
      | 'onValuesChange'
      | 'onFieldsChange'
    >
  >;
  submitButtonOptions?: DynamicFormButtonOptions;
  resetButtonOptions?: DynamicFormButtonOptions;
}

export interface UseDynamicFormOptions<T extends FormData = FormData> extends Omit<
  DynamicFormProps<T>,
  'modelValue'
> {
  initialValues?: DeepPartial<T>;
  handleSubmit?: (values: T) => void | Promise<void>;
  handleReset?: (values: T) => void | Promise<void>;
  handleValuesChange?: (values: T, fieldsChanged: string[]) => void;
  handleFinishFailed?: (error: DynamicFormValidateError<T>) => void;
  handleSchemaChange?: (schema: DynamicFormSchema<T>) => void;
  handleCollapsedChange?: (collapsed: boolean) => void;
}

export interface DynamicFormFieldContext<T extends FormData = FormData> {
  fieldPath: Readonly<Ref<NormalizedFormPath>>;
  value: Readonly<Ref<unknown>>;
  api: DynamicFormApi<T>;
  schema: Readonly<Ref<DynamicFormFieldSchema<T>>>;
  resolveContext: Readonly<Ref<DynamicFormResolveContext<T>>>;
}

export type DynamicFormInstance<T extends FormData = FormData> = DynamicFormApi<T>;
