<template>
  <DynamicForm
    ref="formRef"
    :disabled="props.disabled"
    :form-props="layoutFormProps"
    :initial-values="props.initialValues"
    :label-width="props.labelWidth"
    :layout="props.layout"
    :schema="runtimeSchema"
    :scroll-to-first-error="props.scrollToFirstError"
    :show-default-actions="false"
    wrapper-class="contents"
    @finish="handleFinish"
    @finish-failed="handleFinishFailed"
    @reset="handleReset"
    @values-change="handleValuesChange"
  >
    <template #actions>
      <div :class="layout.actionsClass.value">
        <Button
          v-if="resolved.showResetButton"
          v-bind="resetButtonProps"
          html-type="button"
          @click="searchApi.resetFields()"
        >
          {{ resolved.resetText }}
        </Button>
        <Button
          v-if="resolved.showSearchButton"
          v-bind="searchButtonProps"
          html-type="button"
          type="primary"
          @click="handleSearchClick"
        >
          <template #icon><SearchOutlined /></template>
          {{ resolved.searchText }}
        </Button>
        <Button
          v-if="resolved.showCollapseButton"
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
  </DynamicForm>
</template>

<script setup lang="ts" generic="T extends FormData = FormData">
import { computed, ref, shallowRef } from 'vue';
import { Button } from 'antdv-next';
import { DownOutlined, SearchOutlined, UpOutlined } from '@antdv-next/icons';

import { DynamicForm } from '../../dynamic-form';
import { createFormApiDefinition } from '../../dynamic-form/core/api-definition';
import { useApiProxy } from '../../internal/use-api-proxy';
import { createSearchLayout } from '../core/layout';
import { DEFAULT_SEARCH_COLUMNS } from '../constants/layout';
import { resolveButtonProps } from '../utils/button';

import type { DynamicFormApi, DynamicFormValidateError, FormData } from '../../dynamic-form';
import type { DynamicSearchApi, DynamicSearchEmits, DynamicSearchProps } from '../types';

defineOptions({ name: 'DynamicSearch', inheritAttrs: false });

// 配置只从 props 来；搜索区自己的默认值只写在这里一处。
const props = withDefaults(defineProps<DynamicSearchProps<T>>(), {
  initialValues: undefined,
  layout: 'horizontal',
  disabled: false,
  labelWidth: undefined,
  scrollToFirstError: true,
  formProps: undefined,
  responsive: true,
  columns: DEFAULT_SEARCH_COLUMNS,
  collapsedCount: undefined,
  collapsible: true,
  defaultExpanded: false,
  searchButtonOptions: undefined,
  resetButtonOptions: undefined,
  collapseButtonOptions: undefined,
});

const emit = defineEmits<DynamicSearchEmits<T>>();

/** defaultExpanded 只作为初始状态，之后由用户操作或 toggleExpand 决定。 */
const expanded = ref(Boolean(props.defaultExpanded));

const layout = createSearchLayout<T>(() => props, expanded);
const runtimeSchema = layout.schema;
const layoutFormProps = layout.formProps;

const resolved = computed(() => ({
  showSearchButton: props.searchButtonOptions?.show !== false,
  showResetButton: props.resetButtonOptions?.show !== false,
  showCollapseButton: layout.canCollapse.value && props.collapseButtonOptions?.show !== false,
  searchText: props.searchButtonOptions?.content ?? '查询',
  resetText: props.resetButtonOptions?.content ?? '重置',
}));

const searchButtonProps = computed(() => resolveButtonProps(props.searchButtonOptions));
const resetButtonProps = computed(() => resolveButtonProps(props.resetButtonOptions));
const collapseButtonProps = computed(() => resolveButtonProps(props.collapseButtonOptions));

const formRef = shallowRef<DynamicFormApi<T>>();

// 表单 API 走同一份代理：方法引用稳定，内部表单挂载前的调用也有一致的兜底语义。
const formApi = useApiProxy<DynamicFormApi<T>>(
  'DynamicSearch',
  () => formRef.value,
  createFormApiDefinition<T>(),
);

/** 切换展开状态；折叠只改传给表单的 schema，不会丢字段值。 */
function toggleExpand(force?: boolean): void {
  const nextExpanded = force ?? !expanded.value;
  if (nextExpanded === expanded.value) return;

  expanded.value = nextExpanded;
  emit('expandChange', nextExpanded);
}

const searchApi: DynamicSearchApi<T> = {
  get values() {
    return formApi.values;
  },
  get expanded() {
    return expanded.value;
  },
  getValues: formApi.getValues,
  setValues: formApi.setValues,
  getFieldValue: formApi.getFieldValue,
  setFieldValue: formApi.setFieldValue,
  resetFields: formApi.resetFields,
  validate: formApi.validate,
  clearValidate: formApi.clearValidate,
  submit: formApi.submit,
  scrollToField: formApi.scrollToField,
  getSchema: formApi.getSchema,
  getNativeInstance: formApi.getNativeInstance,
  toggleExpand,
};

function handleSearchClick(): void {
  void searchApi.submit().catch(() => undefined);
}

/** 查询按钮与原生回车都走表单的 finish，这里补发语义更明确的 search。 */
function handleFinish(values: T): void {
  emit('search', values);
  emit('finish', values);
}

function handleFinishFailed(error: DynamicFormValidateError<T>): void {
  emit('finishFailed', error);
}

function handleReset(values: T): void {
  emit('reset', values);
}

function handleValuesChange(values: T, fieldsChanged: string[]): void {
  emit('valuesChange', values, fieldsChanged);
}

defineExpose<DynamicSearchApi<T>>(searchApi);
</script>
