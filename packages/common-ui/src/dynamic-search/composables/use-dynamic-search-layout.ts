import type { Ref } from 'vue';

import { computed } from 'vue';

import {
  DEFAULT_SEARCH_COLUMNS,
  DYNAMIC_SEARCH_FORM_CLASS,
  FIXED_FIELD_CLASSES,
  RESPONSIVE_FIELD_CLASSES,
} from '../constants/layout';

import type { DynamicFormFieldSchema, FormData } from '../../dynamic-form';
import type { DynamicSearchProps } from '../types';

export function useDynamicSearchLayout<T extends FormData>(
  props: Readonly<DynamicSearchProps<T>>,
  expanded: Readonly<Ref<boolean>>,
) {
  const collapsedCount = computed(() =>
    Math.max(
      0,
      Math.floor(
        props.collapsedCount ?? Math.max((props.columns ?? DEFAULT_SEARCH_COLUMNS) - 1, 1),
      ),
    ),
  );

  const canCollapse = computed(
    () => props.collapsible !== false && props.schema.length > collapsedCount.value,
  );

  const fieldClass = computed(() => {
    const columns = props.columns ?? DEFAULT_SEARCH_COLUMNS;
    const widthClass =
      props.responsive === false ? FIXED_FIELD_CLASSES[columns] : RESPONSIVE_FIELD_CLASSES[columns];

    return `shrink-0 ${widthClass}`;
  });

  /** 保留完整 schema，只移除折叠项的节点，避免隐藏字段参与校验。 */
  const schema = computed(() =>
    props.schema.map((field, index) => {
      const hidden = canCollapse.value && !expanded.value && index >= collapsedCount.value;

      return {
        ...field,
        itemClass: [field.itemClass, fieldClass.value].filter(Boolean).join(' '),
        if: hidden ? false : field.if,
      } as DynamicFormFieldSchema<T>;
    }),
  );

  const formProps = computed(() => ({
    ...props.formProps,
    rootClass: [props.formProps?.rootClass, DYNAMIC_SEARCH_FORM_CLASS].filter(Boolean).join(' '),
  }));

  return {
    canCollapse,
    formProps,
    schema,
  };
}
