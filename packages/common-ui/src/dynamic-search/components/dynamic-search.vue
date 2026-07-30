<template>
  <DynamicForm
    :disabled="resolved.disabled"
    :form-props="mergedFormProps"
    :form-state="searchState.formState"
    :label-width="resolved.labelWidth"
    :layout="resolved.layout"
    :schema="runtimeSchema"
    :scroll-to-first-error="resolved.scrollToFirstError"
    :show-default-actions="false"
    wrapper-class="contents"
  >
    <template #actions>
      <div :class="DYNAMIC_SEARCH_ACTIONS_CLASS">
        <Button
          v-if="resolved.showResetButton"
          v-bind="resetButtonProps"
          html-type="button"
          @click="handleReset"
        >
          {{ resolved.resetText }}
        </Button>
        <Button
          v-if="resolved.showSearchButton"
          v-bind="searchButtonProps"
          html-type="button"
          type="primary"
          @click="handleSearch"
        >
          <template #icon><SearchOutlined /></template>
          {{ resolved.searchText }}
        </Button>
        <Button
          v-if="resolved.showCollapseButton"
          v-bind="collapseButtonProps"
          html-type="button"
          type="text"
          @click="handleToggleExpand"
        >
          <template #icon>
            <UpOutlined v-if="expandedRef" />
            <DownOutlined v-else />
          </template>
          {{ expandedRef ? '收起' : '展开' }}
        </Button>
      </div>
    </template>
  </DynamicForm>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue';
import { Button } from 'antdv-next';
import { DownOutlined, SearchOutlined, UpOutlined } from '@antdv-next/icons';
import { isEqual } from 'lodash-es';

import { DynamicForm } from '../../dynamic-form';
import { DynamicSearchState } from '../core/search-state';
import { DEFAULT_SEARCH_COLUMNS, DYNAMIC_SEARCH_ACTIONS_CLASS } from '../constants/layout';
import { resolveButtonProps } from '../utils/button';

import type { DynamicSearchInternalProps } from '../core/internal-props';
import type { DeepPartial, FormData } from '../../dynamic-form';
import type { DynamicSearchEmits, DynamicSearchInstance, UseDynamicSearchOptions } from '../types';

defineOptions({ name: 'DynamicSearch', inheritAttrs: false });

// 组件模式读 props 自建 State；Hook / DynamicPage 模式通过 searchState prop 复用同一份 State。
const props = withDefaults(defineProps<DynamicSearchInternalProps>(), {
  modelValue: () => ({}) as FormData,
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
  schema: () => [],
  searchState: undefined,
});

const emit = defineEmits<DynamicSearchEmits>();

/** 从 props 里摘出搜索配置；modelValue 与 searchState 不属于运行时配置。 */
function pickOptions(): UseDynamicSearchOptions {
  const { modelValue: _modelValue, searchState: _searchState, ...options } = props;
  return options as UseDynamicSearchOptions;
}

const ownsState = !props.searchState;
const searchState =
  props.searchState ??
  new DynamicSearchState<FormData>({
    ...pickOptions(),
    initialValues: props.modelValue as DeepPartial<FormData>,
  });

const options = computed(() => searchState.state.value);
const { expandedRef, mergedFormProps, resolved, runtimeSchema } = searchState;

searchState.attach({
  callbacks: {
    onValuesChange(values, fieldsChanged) {
      emit('update:modelValue', values);
      emit('valuesChange', values, fieldsChanged);
      options.value.handleValuesChange?.(values, fieldsChanged);
    },
    onSearch(values) {
      emit('search', values);
      emit('finish', values);
      void options.value.handleSearch?.(values);
    },
    onReset(values) {
      emit('update:modelValue', values);
      emit('reset', values);
      void options.value.handleReset?.(values);
    },
    onFinishFailed(error) {
      emit('finishFailed', error);
      options.value.handleFinishFailed?.(error);
    },
    onSchemaChange(schema) {
      emit('schemaChange', schema);
      options.value.handleSchemaChange?.(schema);
    },
    onExpandChange(expanded) {
      emit('expandChange', expanded);
      options.value.handleExpandChange?.(expanded);
    },
  },
});

onBeforeUnmount(() => searchState.detach());

// 布局处理后的 schema 变化（展开收起、外部换 schema）都要推给内部表单。
watch(runtimeSchema, () => searchState.syncSchema(), { deep: true });

// 组件模式下 props 是唯一配置来源；Hook 模式不建立这些同步，否则会与渲染成环。
if (ownsState) {
  watch(
    () => pickOptions(),
    (nextOptions) => searchState.syncOptions(nextOptions),
    { deep: true },
  );

  watch(
    () => props.modelValue,
    (values) => {
      if (!isEqual(values, searchState.api.states)) {
        searchState.api.setStates(values as DeepPartial<FormData>);
      }
    },
    { deep: true },
  );
}

const searchButtonProps = computed(() => resolveButtonProps(options.value.searchButtonOptions));
const resetButtonProps = computed(() => resolveButtonProps(options.value.resetButtonOptions));
const collapseButtonProps = computed(() => resolveButtonProps(options.value.collapseButtonOptions));

const handleToggleExpand = () => searchState.toggleExpand();

function handleSearch(): void {
  void searchState.api.submit().catch(() => undefined);
}

function handleReset(): void {
  searchState.api.resetFields();
}

defineExpose<DynamicSearchInstance>(searchState.api);
</script>
