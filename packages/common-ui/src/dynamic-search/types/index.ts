import type {
  FormData,
  DynamicFormApi,
  DynamicFormButtonOptions,
  DynamicFormProps,
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
  'update:modelValue': [value: T];
  valuesChange: [values: T, fieldsChanged: string[]];
  search: [values: T];
  finish: [values: T];
  finishFailed: [
    error: Parameters<NonNullable<DynamicSearchProps<T>['formProps']>['onFinishFailed']>[0],
  ];
  reset: [values: T];
  expandChange: [expanded: boolean];
};

export interface DynamicSearchApi<T extends FormData = FormData> extends DynamicFormApi<T> {
  /** 当前是否已展开全部字段。 */
  readonly expanded: boolean;
  /** 切换展开状态；传入 force 时设置为指定状态。 */
  toggleExpand(force?: boolean): void;
}
