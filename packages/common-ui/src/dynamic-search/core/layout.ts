import type { ComputedRef, Ref } from 'vue';

import { computed } from 'vue';

import {
  DEFAULT_SEARCH_COLUMNS,
  DYNAMIC_SEARCH_ACTIONS_CLASS,
  DYNAMIC_SEARCH_FORM_CLASS,
  DYNAMIC_SEARCH_INLINE_ACTIONS_CLASS,
  DYNAMIC_SEARCH_INLINE_FORM_CLASS,
  FIXED_FIELD_CLASSES,
  RESPONSIVE_FIELD_CLASSES,
} from '../constants/layout';

import type { DynamicFormFieldSchema, DynamicFormProps, FormData } from '../../dynamic-form';
import type { DynamicSearchProps } from '../types';

export interface SearchLayout<T extends FormData> {
  canCollapse: ComputedRef<boolean>;
  formProps: ComputedRef<DynamicFormProps<T>['formProps']>;
  schema: ComputedRef<DynamicFormFieldSchema<T>[]>;
  /** 按钮容器的 class：与字段同宽，保证始终占满一列 slot，不会意外换行。 */
  actionsClass: ComputedRef<string>;
}

/**
 * 搜索区的纯派生：列宽 class、折叠隐藏、表单根 class。
 * 只依赖 props 与展开状态，没有自己的状态，因此可以直接在 setup 里创建。
 */
export function createSearchLayout<T extends FormData>(
  getProps: () => DynamicSearchProps<T>,
  expanded: Ref<boolean>,
): SearchLayout<T> {
  const collapsedCount = computed(() => {
    const props = getProps();

    return Math.max(
      0,
      Math.floor(
        props.collapsedCount ?? Math.max((props.columns ?? DEFAULT_SEARCH_COLUMNS) - 1, 1),
      ),
    );
  });

  const canCollapse = computed(() => {
    const props = getProps();
    return props.collapsible !== false && props.schema.length > collapsedCount.value;
  });

  /** inline 布局不参与列网格：字段按内容自然宽度行内流动，columns/responsive 不生效。 */
  const isInline = computed(() => getProps().layout === 'inline');

  const fieldClass = computed(() => {
    if (isInline.value) return '';

    const props = getProps();
    const columns = props.columns ?? DEFAULT_SEARCH_COLUMNS;
    const widthClass =
      props.responsive === false ? FIXED_FIELD_CLASSES[columns] : RESPONSIVE_FIELD_CLASSES[columns];

    return `shrink-0 ${widthClass}`;
  });

  /** 保留完整 schema，只移除折叠项的节点，避免隐藏字段参与校验。 */
  const schema = computed(() =>
    getProps().schema.map((field, index) => {
      const hidden = canCollapse.value && !expanded.value && index >= collapsedCount.value;

      return {
        ...field,
        itemClass: [field.itemClass, fieldClass.value].filter(Boolean).join(' '),
        if: hidden ? false : field.if,
      } as DynamicFormFieldSchema<T>;
    }),
  );

  const formProps = computed(() => {
    const props = getProps();
    const rootClass = [
      props.formProps?.rootClass,
      isInline.value ? DYNAMIC_SEARCH_INLINE_FORM_CLASS : DYNAMIC_SEARCH_FORM_CLASS,
    ]
      .filter(Boolean)
      .join(' ');

    return { ...props.formProps, rootClass };
  });

  /**
   * 按钮容器继承与字段相同的列宽 class，确保它始终恰好占满一列 slot。
   * 这样无论当前行剩几个空位，按钮都不会因内容宽度超出剩余空间而意外换行。
   */
  const actionsClass = computed(() =>
    isInline.value
      ? DYNAMIC_SEARCH_INLINE_ACTIONS_CLASS
      : `${DYNAMIC_SEARCH_ACTIONS_CLASS} ${fieldClass.value}`,
  );

  return { canCollapse, formProps, schema, actionsClass };
}
