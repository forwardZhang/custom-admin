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
  | 'list'
  | 'object';

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
  /** true 时保留 if=false 的字段值。 */
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

export interface DynamicFormBaseContext<T extends FormData = FormData> {
  /** 当前整表数据。 */
  values: Readonly<T>;
  formApi: DynamicFormController<T>;
}

/** Schema 动态函数共享的字段运行时上下文。 */
export interface DynamicFormResolveContext<
  T extends FormData = FormData,
  TValue = unknown,
> extends DynamicFormBaseContext<T> {
  /** 当前字段值；布局容器中为当前数据作用域。 */
  value: TValue;
  /** 当前字段完整路径；布局容器中为当前数据作用域路径。 */
  fieldName: Array<string | number>;
  /** 当前字段的同级数据路径。 */
  parentPath: Array<string | number>;
  /** 当前字段的同级数据对象。 */
  parentValue: unknown;
  /** 最近一层 List 的下标。 */
  index?: number;
  /** 从外到内的全部 List 下标。 */
  indices: number[];
  /** 最近一层 List 的当前项。 */
  item?: Readonly<Record<string, unknown>>;
  /** 按当前 parentPath 获取同级字段值。 */
  getSibling: (fieldName: FormPath) => unknown;
}

export interface DynamicFormFieldRenderContext<
  T extends FormData = FormData,
  TValue = unknown,
> extends DynamicFormResolveContext<T, TValue> {
  schema: DynamicFormFieldSchema<T>;
  disabled: boolean;
  readOnly: boolean;
  updateValue: (value: unknown) => void;
}

export type DynamicFormResolvable<T extends FormData, R, TValue = unknown> =
  | R
  | ((context: DynamicFormResolveContext<T, TValue>) => R);

export type DynamicFormContent<T extends FormData = FormData> =
  | VNodeChild
  | ((context: DynamicFormResolveContext<T>) => VNodeChild);

interface DynamicFormValueFieldSchema<T extends FormData = FormData> {
  /** 字段路径；处于 Object 或 List 内时为相对路径。 */
  fieldName: FormPath;
  label?: DynamicFormContent<T>;
  /** false 时销毁字段节点；函数内读取的表单路径会被自动追踪。 */
  if?: DynamicFormResolvable<T, boolean>;
  disabled?: DynamicFormResolvable<T, boolean>;
  /** 必填由 DynamicForm 转换为 antdv-next Rule。 */
  required?: DynamicFormResolvable<T, boolean>;
  requiredMessage?: string;
  rules?: DynamicFormResolvable<T, DynamicFormRule[]>;
  help?: DynamicFormContent<T>;
  description?: DynamicFormContent<T>;
  formItemProps?: Partial<FormItemProps>;
  span?: number;
  class?: string;
}

/** 普通受控表单字段 Schema。 */
export interface DynamicFormComponentFieldSchema<
  T extends FormData = FormData,
> extends DynamicFormValueFieldSchema<T> {
  /** 内置字段名称，或直接传入一个 Vue 组件。 */
  component: Exclude<BuiltinComponentName, 'card' | 'collapse' | 'list' | 'object'> | Component;
  componentProps?: DynamicFormResolvable<T, Record<string, unknown>>;
  /** 自定义组件非 value/update:value 模型时，声明其受控属性与事件。 */
  componentModel?: ComponentModelConfig;
  /** 为实际字段组件生成具名插槽；字段同名的表单插槽则会替换整个字段组件。 */
  renderComponentContent?: (
    context: DynamicFormFieldRenderContext<T>,
  ) => Record<string, () => VNodeChild>;
}

/** Card、Collapse 纯布局容器，不产生或改变任何表单数据路径。 */
export interface DynamicFormContainerSchema<T extends FormData = FormData> {
  label?: DynamicFormContent<T>;
  component: 'card' | 'collapse';
  if?: DynamicFormResolvable<T, boolean>;
  disabled?: DynamicFormResolvable<T, boolean>;
  componentProps?: DynamicFormResolvable<T, Record<string, unknown>>;
  children: DynamicFormSchema<T>;
  span?: number;
  class?: string;
}

export interface ListItemContext<T extends FormData = FormData> extends DynamicFormResolveContext<
  T,
  ReadonlyArray<Record<string, unknown>>
> {
  index: number;
  item: Readonly<Record<string, unknown>>;
}

export interface ListProps<T extends FormData = FormData> {
  addText?: string;
  copyText?: string;
  removeText?: string;
  moveUpText?: string;
  moveDownText?: string;
  itemTitle?: string | ((context: ListItemContext<T>) => string);
}

export type ListOperationContext<T extends FormData = FormData> = DynamicFormResolveContext<
  T,
  ReadonlyArray<Record<string, unknown>>
>;

export interface ListCreateItemContext<
  T extends FormData = FormData,
> extends ListOperationContext<T> {
  /** 新项将要插入的下标。 */
  index: number;
}

export interface ListMoveContext<T extends FormData = FormData> extends ListOperationContext<T> {
  from: number;
  to: number;
}

export type ListCreateItem<T extends FormData = FormData> = (
  context: ListCreateItemContext<T>,
) => Record<string, unknown> | Promise<Record<string, unknown>>;

export type ListOperationHook<T extends FormData = FormData> = (
  context: ListOperationContext<T>,
) => boolean | void | Promise<boolean | void>;

export type ListMoveHook<T extends FormData = FormData> = (
  context: ListMoveContext<T>,
) => boolean | void | Promise<boolean | void>;

/** 可增删、复制和排序的列表字段 Schema。 */
export interface DynamicFormListSchema<
  T extends FormData = FormData,
> extends DynamicFormValueFieldSchema<T> {
  component: 'list';
  componentProps?: DynamicFormResolvable<T, ListProps<T>>;
  /** 每个数组项复用的子 Schema，渲染时会自动附加当前数组索引。 */
  children: DynamicFormSchema<T>;
  minItems?: number;
  maxItems?: number;
  /** 用户点击新增时创建新项数据，未配置时返回空对象。 */
  createItem?: ListCreateItem<T>;
  beforeAdd?: ListOperationHook<T>;
  beforeRemove?: ListOperationHook<T>;
  beforeCopy?: ListOperationHook<T>;
  beforeMove?: ListMoveHook<T>;
}

/** 只声明对象数据路径的无 UI 结构节点。 */
export interface DynamicFormObjectSchema<T extends FormData = FormData> {
  fieldName: FormPath;
  component: 'object';
  children: DynamicFormSchema<T>;
}

export type DynamicFormFieldSchema<T extends FormData = FormData> =
  | DynamicFormComponentFieldSchema<T>
  | DynamicFormListSchema<T>;

export type DynamicFormSchemaItem<T extends FormData = FormData> =
  | DynamicFormFieldSchema<T>
  | DynamicFormContainerSchema<T>
  | DynamicFormObjectSchema<T>;

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
  /** 提交及 getValues 时是否移除 if=false 的字段，默认 true。 */
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
  formData: Readonly<Ref<T>>;
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
