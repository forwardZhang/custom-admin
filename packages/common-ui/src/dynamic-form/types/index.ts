/** DynamicForm 的公开类型定义。 */
import type {
  ButtonProps,
  FormInstance,
  FormItemProps,
  FormProps,
  RuleObject,
  RuleRender,
} from 'antdv-next';
import type { Component, DefineComponent, Ref, ShallowRef, VNodeChild } from 'vue';

export type FormData = object;
/** 支持点路径、数组路径以及数组索引。 */
export type FormPath = string | Array<string | number>;

export type DeepPartial<T> =
  T extends Array<infer U>
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
  | 'checkboxGroup'
  | 'switch'
  | 'datePicker'
  | 'rangePicker'
  | 'card'
  | 'collapse'
  | 'arrayField';

export type DynamicFormRuleObject = RuleObject extends infer R
  ? R extends RuleObject
    ? Omit<R, 'required'>
    : never
  : never;

export type DynamicFormRule =
  | DynamicFormRuleObject
  | ((form: Parameters<RuleRender>[0]) => DynamicFormRuleObject);

export interface ComponentModelConfig {
  /** 组件接收当前值的属性名。 */
  prop: string;
  /** 组件更新当前值时触发的事件名。 */
  event: string;
}

export interface DynamicFormButtonOptions extends Omit<ButtonProps, 'content'> {
  /** 替换默认按钮文案。 */
  content?: string;
  /** false 时仅隐藏当前按钮，不影响整个操作区。 */
  show?: boolean;
}

export interface GetValuesOptions {
  /** true 时保留 dependencies.if/show 已隐藏字段的值。 */
  includeHidden?: boolean;
}

export interface DynamicFormFieldError {
  name: FormPath;
  errors: string[];
}

export interface DynamicFormValidateError<T extends FormData = FormData> {
  values: T;
  errorFields: DynamicFormFieldError[];
  outOfDate?: boolean;
}

export interface DynamicFormFieldRenderContext<T extends FormData = FormData> {
  /** 当前字段值。 */
  value: unknown;
  /** 当前整表数据，只读传给渲染函数使用。 */
  values: Readonly<T>;
  /** 已拼接容器路径及数组索引的完整字段路径。 */
  fieldName: FormPath;
  schema: DynamicFormFieldSchema<T>;
  disabled: boolean;
  readOnly: boolean;
  formApi: DynamicFormController<T>;
  updateValue: (value: unknown) => void;
}

export type DependencyGetter<T extends FormData, R> = (
  values: Readonly<T>,
  formApi: DynamicFormController<T>,
) => R;

export interface DynamicFormDependencies<T extends FormData = FormData> {
  /** 唯一会被监听的数据路径。 */
  triggerFields: FormPath[];
  /** false 时销毁字段节点。 */
  if?: boolean | DependencyGetter<T, boolean>;
  /** false 时仅通过 CSS 隐藏，字段节点仍然挂载。 */
  show?: boolean | DependencyGetter<T, boolean>;
  disabled?: boolean | DependencyGetter<T, boolean>;
  /** 存在时覆盖字段的静态 required。 */
  required?: boolean | DependencyGetter<T, boolean>;
  /** 动态规则追加在静态 rules 之后。 */
  rules?: DynamicFormRule[] | DependencyGetter<T, DynamicFormRule[]>;
  /** 动态属性覆盖静态 componentProps 的同名属性。 */
  componentProps?: Record<string, unknown> | DependencyGetter<T, Record<string, unknown>>;
  /** triggerFields 发生变化并完成合并计算后执行。 */
  trigger?: (values: Readonly<T>, formApi: DynamicFormController<T>) => void;
}

/** 普通表单字段 Schema。 */
export interface DynamicFormFieldSchema<T extends FormData = FormData> {
  /** 字段路径；处于容器或 ArrayField 内时为相对路径。 */
  fieldName: FormPath;
  label?: string | VNodeChild | (() => VNodeChild);
  /** 必填由 DynamicForm 转换为 antdv-next Rule。 */
  required?: boolean;
  requiredMessage?: string;
  /** 内置字段名称，或直接传入一个 Vue 组件。 */
  component: Exclude<BuiltinComponentName, 'card' | 'collapse' | 'arrayField'> | Component;
  componentProps?: Record<string, unknown>;
  /** 自定义组件非 value/update:value 模型时，声明其受控属性与事件。 */
  componentModel?: ComponentModelConfig;
  defaultValue?: unknown;
  rules?: DynamicFormRule[];
  dependencies?: DynamicFormDependencies<T>;
  help?: string | VNodeChild | (() => VNodeChild);
  description?: string | VNodeChild | (() => VNodeChild);
  formItemProps?: Partial<FormItemProps>;
  span?: number;
  class?: string;
  /** 为实际字段组件生成具名插槽；字段同名的表单插槽则会替换整个字段组件。 */
  renderComponentContent?: (
    context: DynamicFormFieldRenderContext<T>,
  ) => Record<string, () => VNodeChild>;
}

/** Card、Collapse 布局容器，本身不产生独立表单值。 */
export interface DynamicFormContainerSchema<T extends FormData = FormData> {
  /** 可选的数据命名空间；省略时容器只进行视觉分组。 */
  fieldName?: FormPath;
  label?: string | VNodeChild | (() => VNodeChild);
  component: 'card' | 'collapse';
  componentProps?: Record<string, unknown>;
  children: DynamicFormSchema<T>;
  dependencies?: DynamicFormDependencies<T>;
  span?: number;
  class?: string;
}

export interface ArrayFieldProps {
  addText?: string;
  copyText?: string;
  removeText?: string;
  moveUpText?: string;
  moveDownText?: string;
  itemTitle?: string | ((index: number) => string);
}

export interface ArrayOperationContext<T extends FormData = FormData> {
  values: Readonly<T>;
  fieldName: FormPath;
  index?: number;
  item?: Record<string, unknown>;
  formApi: DynamicFormController<T>;
}

export interface ArrayMoveContext<T extends FormData = FormData> extends ArrayOperationContext<T> {
  from: number;
  to: number;
}

export type ArrayOperationHook<T extends FormData = FormData> = (
  context: ArrayOperationContext<T>,
) => boolean | void | Promise<boolean | void>;

export type ArrayMoveHook<T extends FormData = FormData> = (
  context: ArrayMoveContext<T>,
) => boolean | void | Promise<boolean | void>;

/** 可增删、复制和排序的数组字段 Schema。 */
export interface DynamicFormArraySchema<T extends FormData = FormData> {
  fieldName: FormPath;
  label?: string | VNodeChild | (() => VNodeChild);
  required?: boolean;
  requiredMessage?: string;
  component: 'arrayField';
  componentProps?: ArrayFieldProps;
  /** 每个数组项复用的子 Schema，渲染时会自动附加当前数组索引。 */
  children: DynamicFormSchema<T>;
  defaultValue?: Record<string, unknown>[];
  minItems?: number;
  maxItems?: number;
  rules?: DynamicFormRule[];
  dependencies?: DynamicFormDependencies<T>;
  span?: number;
  class?: string;
  beforeAdd?: ArrayOperationHook<T>;
  beforeRemove?: ArrayOperationHook<T>;
  beforeCopy?: ArrayOperationHook<T>;
  beforeMove?: ArrayMoveHook<T>;
}

export type DynamicFormSchemaItem<T extends FormData = FormData> =
  | DynamicFormFieldSchema<T>
  | DynamicFormContainerSchema<T>
  | DynamicFormArraySchema<T>;

export type DynamicFormSchema<T extends FormData = FormData> = Array<DynamicFormSchemaItem<T>>;

export interface BeforeFinishContext<T extends FormData = FormData> {
  values: T;
  schema: DynamicFormSchema<T>;
  formApi: DynamicFormController<T>;
}

export type BeforeFinish<T extends FormData = FormData> = (
  context: BeforeFinishContext<T>,
) => void | DynamicFormFieldError[] | Promise<void | DynamicFormFieldError[]>;

/** DynamicForm 低层组件 Props。 */
export interface DynamicFormProps<T extends FormData = FormData> {
  modelValue?: T;
  schema: DynamicFormSchema<T>;
  layout?: FormProps['layout'];
  column?: number;
  labelWidth?: number | string;
  disabled?: boolean;
  readOnly?: boolean;
  /** 提交及 getValues 时是否移除 dependencies.if/show 隐藏字段，默认 true。 */
  removeHiddenData?: boolean;
  validateTrigger?: FormItemProps['validateTrigger'];
  showDefaultActions?: boolean;
  submitButtonOptions?: DynamicFormButtonOptions;
  resetButtonOptions?: DynamicFormButtonOptions;
  formProps?: Omit<Partial<FormProps>, 'model' | 'rules' | 'disabled' | 'layout'>;
  beforeFinish?: BeforeFinish<T>;
}

export interface DynamicFormEmits<T extends FormData = FormData> {
  'update:modelValue': [value: T];
  valuesChange: [values: T, fieldsChanged: string[]];
  finish: [values: T];
  finishFailed: [error: DynamicFormValidateError<T>];
  reset: [values: T];
  schemaChange: [schema: DynamicFormSchema<T>];
}

/** DynamicForm 与 useForm 共享的表单控制能力。 */
export interface DynamicFormController<T extends FormData = FormData> {
  formData: Ref<T>;
  formRef: Readonly<ShallowRef<FormInstance | undefined>>;
  getValues: (options?: GetValuesOptions) => Promise<T>;
  setValues: (values: DeepPartial<T>) => void;
  getValue: (fieldName: FormPath) => unknown;
  setValue: (fieldName: FormPath, value: unknown) => void;
  resetFields: (fieldNames?: FormPath[]) => void;
  validate: (fieldNames?: FormPath[]) => Promise<T>;
  submit: () => Promise<void>;
  clearValidate: (fieldNames?: FormPath[]) => void;
  scrollToField: (fieldName: FormPath) => void;
  getSchema: () => DynamicFormSchema<T>;
  setSchema: (schema: DynamicFormSchema<T>) => void;
  updateSchema: (
    patches: Array<Partial<DynamicFormFieldSchema<T>> & { fieldName: FormPath }>,
  ) => void;
}

/** useForm 的初始化配置与事件回调。 */
export interface UseFormOptions<T extends FormData = FormData> extends Omit<
  DynamicFormProps<T>,
  'modelValue'
> {
  initialValues?: DeepPartial<T>;
  handleSubmit?: (values: T) => void | Promise<void>;
  handleReset?: (values: T) => void | Promise<void>;
  handleValuesChange?: (values: T, fieldsChanged: string[]) => void;
  handleFinishFailed?: (error: DynamicFormValidateError<T>) => void;
  handleSchemaChange?: (schema: DynamicFormSchema<T>) => void;
}

/** useForm 返回的公开 API，在基础控制器上增加响应式配置更新能力。 */
export interface DynamicFormApi<T extends FormData = FormData> extends DynamicFormController<T> {
  setState: (
    state:
      | Partial<UseFormOptions<T>>
      | ((previous: UseFormOptions<T>) => Partial<UseFormOptions<T>>),
  ) => void;
}

/** DynamicForm 组件通过 ref 暴露的实例类型。 */
export interface DynamicFormInstance<
  T extends FormData = FormData,
> extends DynamicFormController<T> {
  getFormInstance: () => FormInstance | undefined;
}

export type BoundDynamicForm = DefineComponent<Record<string, never>>;
