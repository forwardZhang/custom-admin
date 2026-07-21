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
  /** 按钮显示文案，提交和重置按钮分别默认为“提交”“重置”。 */
  content?: string;
  /** 是否显示按钮，默认为 true。 */
  show?: boolean;
}

/** DynamicForm 对外暴露的命令式操作，可通过组件 ref 或 useDynamicForm 获取。 */
export interface DynamicFormApi<T extends FormData = FormData> {
  /** 当前响应式表单数据；读取快照时优先使用 getValues。 */
  readonly formData: Readonly<Ref<T>>;
  /** 底层 Antdv Form 实例，组件挂载前为 undefined。 */
  readonly formRef: Readonly<Ref<FormInstance | undefined>>;
  /** 返回深拷贝后的完整表单值，避免调用方意外修改内部状态。 */
  getValues(): T;
  /** 深度合并部分表单值，其中数组按整体替换。 */
  setValues(values: DeepPartial<T>): void;
  /** 按字段路径读取值，返回值与内部状态隔离。 */
  getValue(fieldName: FormPath): unknown;
  /** 更新单个字段并触发表单值变更回调。 */
  setValue(fieldName: FormPath, value: unknown): void;
  /** 重置全部字段，或仅重置指定路径到初始值。 */
  resetFields(fieldNames?: FormPath[]): void;
  /** 校验全部字段或指定字段，成功后返回当前完整值。 */
  validate(fieldNames?: FormPath[]): Promise<T>;
  /** 执行校验和提交回调，任一步失败都会 reject。 */
  submit(): Promise<T>;
  /** 清除全部字段或指定字段的校验状态。 */
  clearValidate(fieldNames?: FormPath[]): void;
  /** 滚动到指定字段。 */
  scrollToField(fieldName: FormPath): void;
  /** 返回深拷贝后的当前运行时 schema。 */
  getSchema(): DynamicFormSchema<T>;
  /** 整体替换运行时 schema。 */
  setSchema(schema: DynamicFormSchema<T>): void;
  /** 按 fieldName 浅合并更新一个或多个字段 schema。 */
  updateSchema(patches: Array<Partial<DynamicFormFieldSchema<T>> & { fieldName: FormPath }>): void;
  /** 获取底层 Antdv Form 实例。 */
  getFormInstance(): FormInstance | undefined;
  /** 更新 useDynamicForm 的运行时配置。 */
  setState(state: Partial<UseDynamicFormOptions<T>>): void;
}

/** 函数式字段配置的运行上下文。 */
export interface DynamicFormResolveContext<T extends FormData = FormData, TValue = unknown> {
  /** 当前完整表单值，只读且保持响应式依赖追踪。 */
  values: Readonly<T>;
  /** 当前字段值。 */
  value: TValue;
  /** schema 中声明的原始字段路径。 */
  fieldName: FormPath;
  /** 拼接 basePath 后的完整字段路径。 */
  fieldPath: NormalizedFormPath;
  /** 嵌套表单提供的父级路径。 */
  basePath: NormalizedFormPath;
  /** 当前表单的命令式 API。 */
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
  /** 选项请求函数；依赖的表单值变化时会取消旧请求并重新执行。 */
  api(context: DynamicFormOptionRequestContext<T>): Promise<unknown>;
  /** 请求触发时机：挂载时或选择控件首次打开时，默认为 mount。 */
  loadOn?: TLoadOn;
  /** 从响应对象中提取选项数组的路径，默认为 data；响应本身为数组时忽略。 */
  resultField?: string;
  /** 接口选项中映射为 label 的字段路径，默认为 label。 */
  labelField?: string;
  /** 接口选项中映射为 value 的字段路径，默认为 value。 */
  valueField?: string;
  /** 树形选项的子节点字段路径，默认为 children。 */
  childrenField?: string;
  /** 接口选项中映射为 disabled 的字段路径，默认为 disabled。 */
  disabledField?: string;
  /** 自定义请求错误处理；未提供时会输出带字段路径的警告。 */
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
  /** 自定义组件接收值的 prop 名，默认为 modelValue。 */
  prop: string;
  /** 自定义组件更新值的事件名，默认为 update:modelValue。 */
  event: string;
}

type DynamicFormFieldBase<T extends FormData> = {
  /** 字段在表单数据中的路径，支持点路径字符串或路径数组。 */
  fieldName: FormPath;
  /** 字段标签，支持根据当前表单上下文动态渲染。 */
  label?: DynamicFormContent<T>;
  /** FormItem 的校验帮助信息。 */
  help?: DynamicFormContent<T>;
  /** 展示在控件下方的补充说明。 */
  description?: DynamicFormContent<T>;
  /** modelValue/initialValues 未提供该字段时使用的初始值。 */
  defaultValue?: unknown;
  /** 折叠表单时始终显示该字段。 */
  alwaysShow?: boolean;
  /** 是否创建字段节点；为 false 时字段会从 DOM 中移除。 */
  if?: boolean | DynamicFormResolver<T, boolean>;
  /** 是否显示字段；为 false 时保留节点但通过 v-show 隐藏。 */
  show?: boolean | DynamicFormResolver<T, boolean>;
  /** 是否禁用字段；表单级 disabled 的优先级更高。 */
  disabled?: boolean | DynamicFormResolver<T, boolean>;
  /** 是否追加必填校验规则。 */
  required?: boolean | DynamicFormResolver<T, boolean>;
  /** required 自动生成规则时使用的错误文案。 */
  requiredMessage?: string;
  /** Antdv 校验规则，可根据当前表单值动态生成。 */
  rules?: Rule[] | DynamicFormResolver<T, Rule[]>;
  /** 透传给 Antdv FormItem 的属性，受控属性由 DynamicForm 接管。 */
  formItemProps?: Partial<Omit<FormItemProps, 'name' | 'label' | 'rules' | 'help' | 'extra'>>;
  /** 当前 FormItem 的附加 class。 */
  itemClass?: string;
  /** 自定义组件的 v-model prop 与事件约定。 */
  componentModel?: DynamicFormComponentModel;
  /** 字段值变化回调，包含新旧值和组件原始事件参数。 */
  onChange?: DynamicFormFieldEventHandler<T>;
  /** 返回传给字段组件的具名插槽。 */
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
    /** 内置字段组件名。 */
    component: K;
    /** 传给字段控件的 props，也可由表单上下文动态计算。 */
    fieldProps?: BuiltinFieldPropsMap[K] | DynamicFormResolver<T, BuiltinFieldPropsMap[K]>;
  } & DynamicFormBuiltinRequest<T, K>;
}[BuiltinComponentName];

export interface DynamicFormCustomFieldSchema<
  T extends FormData = FormData,
> extends DynamicFormFieldBase<T> {
  /** 自定义 Vue 字段组件。 */
  component: Component;
  /** 传给自定义组件的 props，也可由表单上下文动态计算。 */
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
  /** 受控表单值，字段变化时通过 update:modelValue 同步。 */
  modelValue?: T;
  /** 字段配置列表，顺序即渲染顺序。 */
  schema: DynamicFormSchema<T>;
  /** Antdv Form 布局方式。 */
  layout?: FormProps['layout'];
  /** 禁用整个表单，优先于字段级 disabled。 */
  disabled?: boolean;
  /** 标签固定宽度，数字会按 px 处理。 */
  labelWidth?: string | number;
  /** 字段列表容器 class，可用于配置 grid 列数与间距。 */
  wrapperClass?: string;
  /** 是否显示内置提交、重置操作区，默认为 true。 */
  showDefaultActions?: boolean;
  /** 是否显示展开/收起按钮，默认为 false。 */
  showCollapseButton?: boolean;
  /** 折叠状态；变化时会重新计算需要隐藏的字段。 */
  collapsed?: boolean;
  /** 折叠后保留的可见行数，最小为 1。 */
  collapsedRows?: number;
  /** 校验失败时是否滚动到首个错误字段。 */
  scrollToFirstError?: FormProps['scrollToFirstError'];
  /** 透传给 Antdv Form 的补充属性，model 与核心事件由 DynamicForm 接管。 */
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
  /** 内置提交按钮配置。 */
  submitButtonOptions?: DynamicFormButtonOptions;
  /** 内置重置按钮配置。 */
  resetButtonOptions?: DynamicFormButtonOptions;
}

export interface UseDynamicFormOptions<T extends FormData = FormData> extends Omit<
  DynamicFormProps<T>,
  'modelValue'
> {
  /** useDynamicForm 创建状态时使用的初始值，并会与 schema.defaultValue 合并。 */
  initialValues?: DeepPartial<T>;
  /** 校验成功后的提交处理；Promise 完成后才触发组件 finish 事件。 */
  handleSubmit?: (values: T) => void | Promise<void>;
  /** 重置后的业务回调。 */
  handleReset?: (values: T) => void | Promise<void>;
  /** 表单值变化回调；API 批量更新时 fieldsChanged 可能为空数组。 */
  handleValuesChange?: (values: T, fieldsChanged: string[]) => void;
  /** 校验失败回调。 */
  handleFinishFailed?: (error: DynamicFormValidateError<T>) => void;
  /** 运行时 schema 被替换或更新后的回调。 */
  handleSchemaChange?: (schema: DynamicFormSchema<T>) => void;
  /** 折叠状态切换后的回调。 */
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
