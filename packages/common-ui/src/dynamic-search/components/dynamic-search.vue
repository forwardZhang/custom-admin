<template>
  <Form>
    <template #actions>
      <div :class="DYNAMIC_SEARCH_ACTIONS_CLASS">
        <Button
          v-if="showResetButton"
          v-bind="resetButtonProps"
          html-type="button"
          @click="handleReset"
        >
          {{ props.resetButtonOptions?.content ?? '重置' }}
        </Button>
        <Button
          v-if="showSearchButton"
          v-bind="searchButtonProps"
          html-type="button"
          type="primary"
          @click="handleSearch"
        >
          <template #icon><SearchOutlined /></template>
          {{ props.searchButtonOptions?.content ?? '查询' }}
        </Button>
        <Button
          v-if="showCollapseButton"
          v-bind="collapseButtonProps"
          html-type="button"
          type="text"
          @click="toggleExpand()"
        >
          <template #icon>
            <UpOutlined v-if="expanded" />
            <DownOutlined v-else />
          </template>
          {{ expanded ? '收起' : '展开' }}
        </Button>
      </div>
    </template>
  </Form>
</template>

<script setup lang="ts" generic="T extends FormData = FormData">
import type { DeepPartial, FormData, UseDynamicFormOptions } from '../../dynamic-form';
import type { DynamicSearchEmits, DynamicSearchInstance, DynamicSearchProps } from '../types';

import { computed, shallowRef, watch } from 'vue';
import { Button } from 'antdv-next';
import { DownOutlined, SearchOutlined, UpOutlined } from '@antdv-next/icons';
import { isEqual } from 'lodash-es';

import { useDynamicForm } from '../../dynamic-form';
import { useDynamicSearchLayout } from '../composables/use-dynamic-search-layout';
import { DEFAULT_SEARCH_COLUMNS, DYNAMIC_SEARCH_ACTIONS_CLASS } from '../constants/layout';
import { resolveButtonProps } from '../utils/button';
import { createSearchApiProxy } from '../utils/create-api';

defineOptions({ name: 'DynamicSearch', inheritAttrs: false });

const props = withDefaults(defineProps<DynamicSearchProps<T>>(), {
  modelValue: () => ({}) as T,
  disabled: false,
  labelWidth: undefined,
  layout: 'horizontal',
  responsive: true,
  columns: DEFAULT_SEARCH_COLUMNS,
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
const expanded = shallowRef(props.defaultExpanded);
const {
  canCollapse,
  formProps: mergedFormProps,
  schema: searchSchema,
} = useDynamicSearchLayout(props, expanded);

const [Form, formApi] = useDynamicForm<T>({
  schema: searchSchema.value,
  initialValues: props.modelValue as DeepPartial<T>,
  layout: props.layout,
  disabled: props.disabled,
  labelWidth: props.labelWidth,
  wrapperClass: 'contents',
  showDefaultActions: false,
  scrollToFirstError: props.scrollToFirstError,
  formProps: mergedFormProps.value,
  handleSubmit: handleFinish,
  handleReset: (values) => emit('reset', values),
  handleValuesChange,
  handleFinishFailed: (error) => emit('finishFailed', error),
  handleSchemaChange: (schema) => emit('schemaChange', schema),
});

const runtimeFormOptions = computed<Partial<UseDynamicFormOptions<T>>>(() => ({
  layout: props.layout,
  disabled: props.disabled,
  labelWidth: props.labelWidth,
  wrapperClass: 'contents',
  showDefaultActions: false,
  scrollToFirstError: props.scrollToFirstError,
  formProps: mergedFormProps.value,
}));

watch(searchSchema, (schema) => formApi.setSchema(schema), { deep: true });
watch(runtimeFormOptions, (options) => formApi.setOptions(options), { deep: true });
watch(
  () => props.modelValue,
  (values) => {
    if (!isEqual(values, formApi.states)) formApi.setStates(values as DeepPartial<T>);
  },
  { deep: true },
);

const showSearchButton = computed(() => props.searchButtonOptions?.show !== false);
const showResetButton = computed(() => props.resetButtonOptions?.show !== false);
const showCollapseButton = computed(
  () => canCollapse.value && props.collapseButtonOptions?.show !== false,
);

const searchButtonProps = computed(() => resolveButtonProps(props.searchButtonOptions));
const resetButtonProps = computed(() => resolveButtonProps(props.resetButtonOptions));
const collapseButtonProps = computed(() => resolveButtonProps(props.collapseButtonOptions));

function handleSearch(): void {
  void formApi.submit().catch(() => undefined);
}

function handleReset(): void {
  formApi.resetFields();
}

function handleFinish(values: T): void {
  emit('search', values);
  emit('finish', values);
}

function handleValuesChange(values: T, fieldsChanged: string[]): void {
  emit('update:modelValue', values);
  emit('valuesChange', values, fieldsChanged);
}

function toggleExpand(force?: boolean): void {
  const nextExpanded = force ?? !expanded.value;
  if (expanded.value === nextExpanded) return;
  expanded.value = nextExpanded;
  emit('expandChange', nextExpanded);
}

const exposedApi = createSearchApiProxy<T, Partial<UseDynamicFormOptions<T>>>({
  formApi,
  getExpanded: () => expanded.value,
  setOptions: (options) => formApi.setOptions(options),
  toggleExpand,
});

defineExpose<DynamicSearchInstance<T>>(exposedApi);
</script>
