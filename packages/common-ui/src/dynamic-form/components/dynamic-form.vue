<template>
  <Form
    ref="antFormRef"
    v-bind="mergedFormProps"
    :model="formApi.states"
    :layout="props.layout"
    :disabled="props.disabled"
    :scroll-to-first-error="props.scrollToFirstError"
    @finish="handleFinish"
    @finish-failed="handleFinishFailed"
  >
    <div ref="wrapperRef" :class="props.wrapperClass">
      <FormField
        v-for="(field, index) in runtimeSchemaForFields"
        :key="`${index}-${pathToString(field.fieldName)}`"
        :collapse-hidden="collapseHiddenKeys.has(`${index}-${pathToString(field.fieldName)}`)"
        :field-key="`${index}-${pathToString(field.fieldName)}`"
        :schema="field"
      />
    </div>

    <FormActions
      v-if="props.showDefaultActions"
      :collapsed="currentCollapsed"
      :reset-button-options="props.resetButtonOptions"
      :show-collapse-button="props.showCollapseButton"
      :submit-button-options="props.submitButtonOptions"
      @reset="handleReset"
      @submit="handleSubmit"
      @toggle-collapse="toggleCollapsed"
    />
  </Form>
</template>

<script setup lang="ts" generic="T extends FormData = FormData">
import type { FormInstance } from 'antdv-next';
import type { Ref } from 'vue';

import {
  computed,
  inject,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
} from 'vue';
import { Form } from 'antdv-next';
import { useResizeObserver } from '@vueuse/core';
import { isEqual } from 'lodash-es';

import FormActions from './form-actions.vue';
import FormField from './form-field.vue';
import { dynamicFormStateKey, provideDynamicFormContext } from '../core/context';
import { DynamicFormState } from '../core/form-api';
import { pathToString } from '../utils/path';

import type {
  DeepPartial,
  DynamicFormApi,
  DynamicFormEmits,
  DynamicFormProps,
  DynamicFormSchema,
  FormData,
} from '../types';

defineOptions({ name: 'DynamicForm', inheritAttrs: false });

// 组件模式下 props 是唯一外部数据入口；useDynamicForm 模式则由注入的 formApi 提供状态。
const props = withDefaults(defineProps<DynamicFormProps<T>>(), {
  modelValue: () => ({}) as T,
  disabled: false,
  labelWidth: undefined,
  wrapperClass: 'grid grid-cols-1 gap-x-6',
  showDefaultActions: true,
  showCollapseButton: false,
  collapsed: false,
  collapsedRows: 1,
  scrollToFirstError: false,
  formProps: undefined,
  submitButtonOptions: undefined,
  resetButtonOptions: undefined,
});

const emit = defineEmits<DynamicFormEmits<T>>();

// 嵌套在 useDynamicForm 返回的组件中时复用同一个 API，避免创建两套表单状态。
const injectedFormState = inject(dynamicFormStateKey) as DynamicFormState<T> | undefined;
const ownsFormState = !injectedFormState;
const formState =
  injectedFormState ??
  new DynamicFormState<T>({
    schema: props.schema,
    initialValues: props.modelValue as DeepPartial<T>,
    layout: props.layout,
    disabled: props.disabled,
    labelWidth: props.labelWidth,
    wrapperClass: props.wrapperClass,
    showDefaultActions: props.showDefaultActions,
    showCollapseButton: props.showCollapseButton,
    collapsed: props.collapsed,
    collapsedRows: props.collapsedRows,
    scrollToFirstError: props.scrollToFirstError,
    formProps: props.formProps,
    submitButtonOptions: props.submitButtonOptions,
    resetButtonOptions: props.resetButtonOptions,
  });

const formApi = formState.api;
const runtimeSchema = formState.schema;
const runtimeSchemaForFields = computed(() => runtimeSchema.value as DynamicFormSchema<FormData>);
const antFormRef = shallowRef<FormInstance>();
const wrapperRef = ref<HTMLElement>();
const currentCollapsed = ref(props.collapsed);
const collapseHiddenKeys = ref(new Set<string>());

const mergedFormProps = computed(() => ({
  labelWrap: true,
  ...props.formProps,
}));

const disabled = computed(() => Boolean(props.disabled));
const contextProps = computed(() => props as unknown as DynamicFormProps<T>);

provideDynamicFormContext<T>({
  formApi,
  props: contextProps,
  disabled,
});

// 将命令式 API 的回调桥接为组件事件，同时保留 useDynamicForm 的业务回调。
formState.setCallbacks({
  onValuesChange(values, fieldsChanged) {
    emit('update:modelValue', values);
    if (fieldsChanged.length) emit('valuesChange', values, fieldsChanged);
    formState.state.value.handleValuesChange?.(values, fieldsChanged);
  },
  onFinish(values) {
    emit('finish', values);
  },
  onFinishFailed(error) {
    emit('finishFailed', error);
  },
  onReset(values) {
    emit('update:modelValue', values);
    emit('reset', values);
    formState.state.value.handleReset?.(values);
  },
});

watch(antFormRef, (value) => formState.setFormRef(value), { immediate: true });

// watch(
//   () => props.collapsed,
//   (value) => {
//     currentCollapsed.value = value;
//     void calculateCollapseRows();
//   },
// );

if (ownsFormState) {
  watch(
    () => props.modelValue,
    (value) => formState.syncExternalValues(value),
    { deep: true },
  );

  watch(
    () => props.schema,
    (value) => formState.setSchema(value),
    { deep: true },
  );
}

/** 切换折叠状态并让 DOM 测量逻辑重新计算隐藏字段。 */
const toggleCollapsed = () => {
  currentCollapsed.value = !currentCollapsed.value;
  emit('collapsedChange', currentCollapsed.value);
  formState.state.value.handleCollapsedChange?.(currentCollapsed.value);
  void calculateCollapseRows();
};

/** 统一走 API 提交流程，使按钮提交和外部 api.submit 行为一致。 */
const handleSubmit = () => {
  void formApi.submit().catch(() => undefined);
};

/** 重置字段值和 Antdv 的校验状态。 */
const handleReset = () => {
  formApi.resetFields();
};

/** 接收 Antdv 校验后的值，交由 API 执行业务提交回调。 */
const handleFinish = (values: Record<string, unknown>) => {
  void formState.finish(values as T);
};

/** 统一标准化 Antdv 校验错误并触发 finishFailed。 */
const handleFinishFailed = (error: unknown) => {
  formState.handleFinishFailed(error);
};

/**
 * 按字段实际 top 值识别网格行，折叠时只保留前 collapsedRows 行。
 * 依赖 nextTick 和 ResizeObserver，确保响应式字段/窗口尺寸变化后测量的是最新 DOM。
 */
async function calculateCollapseRows() {
  await nextTick();
  const wrapper = wrapperRef.value;
  if (!wrapper || !props.showCollapseButton || !currentCollapsed.value) {
    updateCollapseHiddenKeys(new Set());
    return;
  }

  const fields = Array.from(wrapper.querySelectorAll<HTMLElement>('[data-dynamic-form-field]'));
  const containerTop = wrapper.getBoundingClientRect().top;
  const rows: number[] = [];

  for (const field of fields) {
    const top = Math.round(field.getBoundingClientRect().top - containerTop);
    if (!rows.some((row) => Math.abs(row - top) <= 2)) rows.push(top);
  }

  rows.sort((left, right) => left - right);
  const visibleRows = Math.max(props.collapsedRows ?? 1, 1);
  const hidden = new Set<string>();

  for (const field of fields) {
    if (field.dataset.dynamicFormAlwaysShow === 'true') continue;
    const top = Math.round(field.getBoundingClientRect().top - containerTop);
    const rowIndex = rows.findIndex((row) => Math.abs(row - top) <= 2);
    if (rowIndex >= visibleRows) {
      const key = field.dataset.dynamicFormField;
      if (key) hidden.add(key);
    }
  }

  updateCollapseHiddenKeys(hidden);
}

/** 仅在隐藏字段集合真正变化时更新，避免测量触发不必要的重渲染。 */
function updateCollapseHiddenKeys(hidden: Set<string>) {
  if (isEqual(collapseHiddenKeys.value, hidden)) return;
  collapseHiddenKeys.value = hidden;
}

// const resizeObserver = useResizeObserver(wrapperRef, () => {
//   void calculateCollapseRows();
// });

// onMounted(() => {
//   void calculateCollapseRows();
// });

// onBeforeUnmount(() => {
//   resizeObserver.stop();
// });

defineExpose<DynamicFormApi<T>>(formApi);
</script>
