<template>
  <DynamicForm
    ref="formRef"
    :disabled="props.disabled"
    :form-props="mergedFormProps"
    :label-width="props.labelWidth"
    :layout="props.layout"
    :model-value="props.modelValue"
    :schema="searchSchema"
    :scroll-to-first-error="props.scrollToFirstError"
    :show-default-actions="false"
    wrapper-class="contents"
    @finish="handleFinish"
    @finish-failed="emit('finishFailed', $event)"
    @reset="emit('reset', $event)"
    @update:model-value="emit('update:modelValue', $event)"
    @values-change="emit('valuesChange', $event, $event2)"
  >
  </DynamicForm>
</template>

<script setup lang="ts" generic="T extends FormData = FormData">
import type { DynamicFormApi, DynamicFormFieldSchema, FormData } from '../../dynamic-form';
import type {
  DynamicSearchApi,
  DynamicSearchColumns,
  DynamicSearchEmits,
  DynamicSearchProps,
} from '../types';

import { computed, h, shallowRef } from 'vue';
import { Button } from 'antdv-next';
import { DownOutlined, SearchOutlined, UpOutlined } from '@antdv-next/icons';
import { omit } from 'lodash-es';

import { DynamicForm } from '../../dynamic-form';

defineOptions({ name: 'DynamicSearch', inheritAttrs: false });

const props = withDefaults(defineProps<DynamicSearchProps<T>>(), {
  modelValue: () => ({}) as T,
  disabled: false,
  labelWidth: undefined,
  layout: 'horizontal',
  responsive: true,
  columns: 4,
  collapsedCount: undefined,
  collapsible: true,
  defaultExpanded: false,
  scrollToFirstError: true,
  formProps: undefined,
  searchButtonOptions: undefined,
  resetButtonOptions: undefined,
  collapseButtonOptions: undefined,
});

const emit = defineEmits<DynamicSearchEmits<T>>();
const formRef = shallowRef<DynamicFormApi<T>>();
const expanded = shallowRef(props.defaultExpanded);

const responsiveFieldClasses: Record<DynamicSearchColumns, string> = {
  1: 'w-full',
  2: 'w-full md:w-[calc((100%-1.5rem)/2)]',
  3: 'w-full md:w-[calc((100%-1.5rem)/2)] xl:w-[calc((100%-3rem)/3)]',
  4: 'w-full md:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)] xl:w-[calc((100%-4.5rem)/4)]',
  5: 'w-full md:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)] xl:w-[calc((100%-4.5rem)/4)] 2xl:w-[calc((100%-6rem)/5)]',
  6: 'w-full md:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)] xl:w-[calc((100%-4.5rem)/4)] 2xl:w-[calc((100%-7.5rem)/6)]',
};

const fixedFieldClasses: Record<DynamicSearchColumns, string> = {
  1: 'w-full',
  2: 'w-[calc((100%-1.5rem)/2)]',
  3: 'w-[calc((100%-3rem)/3)]',
  4: 'w-[calc((100%-4.5rem)/4)]',
  5: 'w-[calc((100%-6rem)/5)]',
  6: 'w-[calc((100%-7.5rem)/6)]',
};

const resolvedCollapsedCount = computed(() =>
  Math.max(0, props.collapsedCount ?? Math.max(props.columns - 1, 1)),
);
const canCollapse = computed(
  () => props.collapsible && props.schema.length > resolvedCollapsedCount.value,
);
const fieldLayoutClass = computed(
  () =>
    `shrink-0 ${
      props.responsive ? responsiveFieldClasses[props.columns] : fixedFieldClasses[props.columns]
    }`,
);

/** 保留完整 schema，只通过 show 隐藏折叠项，避免丢失字段状态和默认值。 */
const searchSchema = computed(() =>
  props.schema.map((field, index) => {
    const hiddenByCollapse =
      canCollapse.value && !expanded.value && index >= resolvedCollapsedCount.value;

    return {
      ...field,
      itemClass: [field.itemClass, fieldLayoutClass.value].filter(Boolean).join(' '),
      show: hiddenByCollapse ? false : field.show,
    } as DynamicFormFieldSchema<T>;
  }),
);

const showSearchButton = computed(() => props.searchButtonOptions?.show !== false);
const showResetButton = computed(() => props.resetButtonOptions?.show !== false);
const showCollapseButton = computed(
  () => canCollapse.value && props.collapseButtonOptions?.show !== false,
);

const searchButtonProps = computed(() =>
  omit(props.searchButtonOptions ?? {}, ['content', 'show', 'type', 'htmlType']),
);
const resetButtonProps = computed(() =>
  omit(props.resetButtonOptions ?? {}, ['content', 'show', 'type', 'htmlType']),
);
const collapseButtonProps = computed(() =>
  omit(props.collapseButtonOptions ?? {}, ['show', 'type', 'htmlType']),
);

const mergedFormProps = computed(() => ({
  ...props.formProps,
  class: [props.formProps?.class, 'flex flex-wrap gap-x-6'],
}));

function getFormApi(): DynamicFormApi<T> {
  if (!formRef.value) throw new Error('[DynamicSearch] Search form is not mounted');
  return formRef.value;
}

function handleSearch(): void {
  void getFormApi()
    .submit()
    .catch(() => undefined);
}

function handleReset(): void {
  getFormApi().resetFields();
}

function handleFinish(values: T): void {
  emit('search', values);
  emit('finish', values);
}

function toggleExpand(force?: boolean): void {
  const nextExpanded = force ?? !expanded.value;
  if (expanded.value === nextExpanded) return;
  expanded.value = nextExpanded;
  emit('expandChange', nextExpanded);
}

const ActionButtons = () =>
  h('div', { class: 'mb-6 ml-auto flex shrink-0 self-end items-center justify-end gap-2' }, [
    showResetButton.value
      ? h(
          Button,
          {
            ...resetButtonProps.value,
            htmlType: 'button',
            onClick: handleReset,
          },
          () => props.resetButtonOptions?.content ?? '重置',
        )
      : null,
    showSearchButton.value
      ? h(
          Button,
          {
            ...searchButtonProps.value,
            htmlType: 'button',
            type: 'primary',
            onClick: handleSearch,
          },
          {
            default: () => props.searchButtonOptions?.content ?? '查询',
            icon: () => h(SearchOutlined),
          },
        )
      : null,
    showCollapseButton.value
      ? h(
          Button,
          {
            ...collapseButtonProps.value,
            htmlType: 'button',
            type: 'text',
            onClick: () => toggleExpand(),
          },
          {
            default: () => (expanded.value ? '收起' : '展开'),
            icon: () => h(expanded.value ? UpOutlined : DownOutlined),
          },
        )
      : null,
  ]);

const exposedApi: DynamicSearchApi<T> = {
  get states() {
    return getFormApi().states;
  },
  get expanded() {
    return expanded.value;
  },
  getStates: () => getFormApi().getStates(),
  setStates: (states) => getFormApi().setStates(states),
  getState: (fieldName) => getFormApi().getState(fieldName),
  setState: (fieldName, state) => getFormApi().setState(fieldName, state),
  resetFields: (fieldNames) => getFormApi().resetFields(fieldNames),
  validate: (fieldNames) => getFormApi().validate(fieldNames),
  submit: () => getFormApi().submit(),
  clearValidate: (fieldNames) => getFormApi().clearValidate(fieldNames),
  scrollToField: (fieldName) => getFormApi().scrollToField(fieldName),
  getSchema: () => getFormApi().getSchema(),
  setSchema: (schema) => getFormApi().setSchema(schema),
  updateSchema: (patches) => getFormApi().updateSchema(patches),
  getFormInstance: () => getFormApi().getFormInstance(),
  setOptions: (options) => getFormApi().setOptions(options),
  toggleExpand,
};

defineExpose<DynamicSearchApi<T>>(exposedApi);
</script>

<script lang="ts">
export default {
  setup() {
    return () => h(ActionButtons);
  },
};
</script>
