import type {
  DynamicFormApi,
  DynamicFormButtonOptions,
  DynamicFormProps,
  DynamicFormValidateError,
  FormData,
} from '../../dynamic-form';

export type DynamicSearchColumns = 1 | 2 | 3 | 4 | 5 | 6;

export interface DynamicSearchProps<T extends FormData = FormData> extends Omit<
  DynamicFormProps<T>,
  'resetButtonOptions' | 'showDefaultActions' | 'submitButtonOptions' | 'wrapperClass'
> {
  /** 是否按视口宽度自动减少列数，默认为 true。 */
  responsive?: boolean;
  /** 大屏最大列数；responsive=false 时为固定列数，默认为 4。 */
  columns?: DynamicSearchColumns;
  /** 折叠时显示的字段数，默认预留最后一列给操作按钮。 */
  collapsedCount?: number;
  /** 字段超出折叠数量时是否显示展开/收起按钮，默认为 true。 */
  collapsible?: boolean;
  /** 是否默认展开全部字段，默认为 false。 */
  defaultExpanded?: boolean;
  /** 查询按钮的文案、显隐和 Antdv Button 属性。 */
  searchButtonOptions?: DynamicFormButtonOptions;
  /** 重置按钮的文案、显隐和 Antdv Button 属性。 */
  resetButtonOptions?: DynamicFormButtonOptions;
  /** 展开/收起按钮的显隐和 Antdv Button 属性。 */
  collapseButtonOptions?: Omit<DynamicFormButtonOptions, 'content'>;
}

export type DynamicSearchEmits<T extends FormData = FormData> = {
  'update:modelValue': [values: T];
  valuesChange: [values: T, fieldsChanged: string[]];
  /** 点击查询并校验通过；与 finish 同时触发，语义更贴近搜索场景。 */
  search: [values: T];
  finish: [values: T];
  finishFailed: [error: DynamicFormValidateError<T>];
  reset: [values: T];
  expandChange: [expanded: boolean];
};

/** 事件的 onXxx prop 形式；Hook 生成的组件用它把 emits 表达成 props 类型。 */
export interface DynamicSearchEventProps<T extends FormData = FormData> {
  'onUpdate:modelValue'?: (values: T) => void;
  onValuesChange?: (values: T, fieldsChanged: string[]) => void;
  onSearch?: (values: T) => void;
  onFinish?: (values: T) => void;
  onFinishFailed?: (error: DynamicFormValidateError<T>) => void;
  onReset?: (values: T) => void;
  onExpandChange?: (expanded: boolean) => void;
}

/** DynamicSearch 的命令式 API：表单 API 加上展开状态控制。 */
export interface DynamicSearchApi<T extends FormData = FormData> extends DynamicFormApi<T> {
  /** 当前是否已展开全部字段。 */
  readonly expanded: boolean;
  /** 切换展开状态；传入 force 时设置为指定状态。 */
  toggleExpand(force?: boolean): void;
}
