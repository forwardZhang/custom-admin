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
    <div :class="props.wrapperClass">
      <FormField
        v-for="(field, index) in runtimeSchemaForFields"
        :key="`${index}-${pathToString(field.fieldName)}`"
        :schema="field"
      />
    </div>

    <FormActions
      v-if="props.showDefaultActions"
      :reset-button-options="props.resetButtonOptions"
      :submit-button-options="props.submitButtonOptions"
      @reset="handleReset"
      @submit="handleSubmit"
    />
  </Form>
</template>

<script setup lang="ts" generic="T extends FormData = FormData">
import type { FormInstance } from 'antdv-next';

import { computed, inject, shallowRef, watch } from 'vue';
import { Form } from 'antdv-next';

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
  showDefaultActions: false,
  scrollToFirstError: true,
  formProps: undefined,
  submitButtonOptions: undefined,
  resetButtonOptions: undefined,
});

const emit = defineEmits<DynamicFormEmits<T>>();

// 嵌套在 useDynamicForm 返回的组件中时复用同一个 API，避免创建两套表单状态。
const injectedFormState = inject(dynamicFormStateKey, undefined) as DynamicFormState<T> | undefined;
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
    scrollToFirstError: props.scrollToFirstError,
    formProps: props.formProps,
    submitButtonOptions: props.submitButtonOptions,
    resetButtonOptions: props.resetButtonOptions,
  });

const formApi = formState.api;
const runtimeSchema = formState.schema;
const runtimeSchemaForFields = computed(() => runtimeSchema.value as DynamicFormSchema<FormData>);
const antFormRef = shallowRef<FormInstance>();

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

defineExpose<DynamicFormApi<T>>(formApi);
</script>
