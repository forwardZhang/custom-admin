import type { ComputedRef, Ref } from 'vue';

import { computed } from 'vue';

import {
  DEFAULT_SEARCH_COLUMNS,
  DYNAMIC_SEARCH_FORM_CLASS,
  FIXED_FIELD_CLASSES,
  RESPONSIVE_FIELD_CLASSES,
} from '../constants/layout';

import type { DynamicFormFieldSchema, DynamicFormProps, FormData } from '../../dynamic-form';
import type { UseDynamicSearchOptions } from '../types';

export interface SearchLayout<T extends FormData> {
  canCollapse: ComputedRef<boolean>;
  formProps: ComputedRef<DynamicFormProps<T>['formProps']>;
  schema: ComputedRef<DynamicFormFieldSchema<T>[]>;
}

/**
 * 搜索区的纯派生：列宽 class、折叠隐藏、表单根 class。
 * 只依赖配置与展开状态，因此可以在 DynamicSearchState 构造期直接创建。
 */
export function createSearchLayout<T extends FormData>(
  getOptions: () => UseDynamicSearchOptions<T>,
  expanded: Ref<boolean>,
): SearchLayout<T> {
  const collapsedCount = computed(() => {
    const options = getOptions();

    return Math.max(
      0,
      Math.floor(
        options.collapsedCount ?? Math.max((options.columns ?? DEFAULT_SEARCH_COLUMNS) - 1, 1),
      ),
    );
  });

  const canCollapse = computed(() => {
    const options = getOptions();
    return options.collapsible !== false && options.schema.length > collapsedCount.value;
  });

  const fieldClass = computed(() => {
    const options = getOptions();
    const columns = options.columns ?? DEFAULT_SEARCH_COLUMNS;
    const widthClass =
      options.responsive === false
        ? FIXED_FIELD_CLASSES[columns]
        : RESPONSIVE_FIELD_CLASSES[columns];

    return `shrink-0 ${widthClass}`;
  });

  /** 保留完整 schema，只移除折叠项的节点，避免隐藏字段参与校验。 */
  const schema = computed(() =>
    getOptions().schema.map((field, index) => {
      const hidden = canCollapse.value && !expanded.value && index >= collapsedCount.value;

      return {
        ...field,
        itemClass: [field.itemClass, fieldClass.value].filter(Boolean).join(' '),
        if: hidden ? false : field.if,
      } as DynamicFormFieldSchema<T>;
    }),
  );

  const formProps = computed(() => {
    const options = getOptions();

    return {
      ...options.formProps,
      rootClass: [options.formProps?.rootClass, DYNAMIC_SEARCH_FORM_CLASS]
        .filter(Boolean)
        .join(' '),
    };
  });

  return { canCollapse, formProps, schema };
}
