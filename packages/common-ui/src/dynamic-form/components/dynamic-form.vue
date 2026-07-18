<template>
  <Form
    ref="antFormRef"
    v-bind="mergedFormProps"
    :model="formData"
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
  DynamicFormEmits,
  DynamicFormInstance,
  DynamicFormProps,
  DynamicFormSchema,
  FormData,
} from '../types';

defineOptions({ name: 'DynamicForm', inheritAttrs: false });

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

const injectedFormApi = inject(dynamicFormStateKey) as DynamicFormState<T> | undefined;
const ownsFormApi = !injectedFormApi;
const formApi =
  injectedFormApi ??
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

const formData = formApi.formData;
const runtimeSchema = formApi.schema;
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
  formData,
  formApi,
  props: contextProps,
  disabled,
});

formApi.setCallbacks({
  onValuesChange(values, fieldsChanged) {
    emit('update:modelValue', values);
    if (fieldsChanged.length) emit('valuesChange', values, fieldsChanged);
    formApi.state.value.handleValuesChange?.(values, fieldsChanged);
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
    formApi.state.value.handleReset?.(values);
  },
});

watch(antFormRef, (value) => formApi.setFormRef(value), { immediate: true });

watch(
  () => props.collapsed,
  (value) => {
    currentCollapsed.value = value;
    void calculateCollapseRows();
  },
);

if (ownsFormApi) {
  watch(
    () => props.modelValue,
    (value) => formApi.syncExternalValues(value),
    { deep: true },
  );

  watch(
    () => props.schema,
    (value) => formApi.setSchema(value),
    { deep: true },
  );
}

const toggleCollapsed = () => {
  currentCollapsed.value = !currentCollapsed.value;
  emit('collapsedChange', currentCollapsed.value);
  formApi.state.value.handleCollapsedChange?.(currentCollapsed.value);
  void calculateCollapseRows();
};

const handleSubmit = () => {
  void formApi.submit().catch(() => undefined);
};

const handleReset = () => {
  formApi.resetFields();
};

const handleFinish = (values: Record<string, unknown>) => {
  void formApi.finish(values as T);
};

const handleFinishFailed = (error: unknown) => {
  formApi.handleFinishFailed(error);
};

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

function updateCollapseHiddenKeys(hidden: Set<string>) {
  if (isEqual(collapseHiddenKeys.value, hidden)) return;
  collapseHiddenKeys.value = hidden;
}

const resizeObserver = useResizeObserver(wrapperRef, () => {
  void calculateCollapseRows();
});

onMounted(() => {
  void calculateCollapseRows();
});

onBeforeUnmount(() => {
  resizeObserver.stop();
});

defineExpose<DynamicFormInstance<T>>(formApi);
</script>
