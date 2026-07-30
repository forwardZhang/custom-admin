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

    <slot name="actions" :reset="handleReset" :submit="handleSubmit">
      <FormActions
        v-if="props.showDefaultActions"
        :reset-button-options="props.resetButtonOptions"
        :submit-button-options="props.submitButtonOptions"
        @reset="handleReset"
        @submit="handleSubmit"
      />
    </slot>
  </Form>
</template>

<script setup lang="ts">
import type { FormInstance } from 'antdv-next';

import { computed, onBeforeUnmount, shallowRef, watch } from 'vue';
import { Form } from 'antdv-next';

import FormActions from './form-actions.vue';
import FormField from './form-field.vue';
import { provideDynamicFormContext } from '../core/context';
import { DynamicFormState } from '../core/form-api';
import { pathToString } from '../utils/path';

import type { DynamicFormInternalProps } from '../core/internal-props';

import type {
  DeepPartial,
  DynamicFormApi,
  DynamicFormEmits,
  DynamicFormProps,
  DynamicFormSchema,
  FormData,
} from '../types';

defineOptions({ name: 'DynamicForm', inheritAttrs: false });

// 组件模式读 props 自建 State；useDynamicForm 模式通过 formState prop 复用同一份 State。
const props = withDefaults(defineProps<DynamicFormInternalProps>(), {
  modelValue: () => ({}) as FormData,
  disabled: false,
  labelWidth: undefined,
  wrapperClass: 'grid grid-cols-1 gap-x-6',
  showDefaultActions: false,
  scrollToFirstError: true,
  formProps: undefined,
  submitButtonOptions: undefined,
  resetButtonOptions: undefined,
  formState: undefined,
});

const emit = defineEmits<DynamicFormEmits>();

defineSlots<{
  actions(props: { reset: () => void; submit: () => void }): unknown;
}>();

const ownsFormState = !props.formState;
const formState =
  props.formState ??
  new DynamicFormState<FormData>({
    schema: props.schema,
    initialValues: props.modelValue as DeepPartial<FormData>,
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
const contextProps = computed(() => props as unknown as DynamicFormProps);

provideDynamicFormContext({
  formApi,
  props: contextProps,
  disabled,
});

// 统一桥接：组件事件 + useDynamicForm 业务回调。
formState.attach({
  formRef: antFormRef,
  callbacks: {
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
  },
});

onBeforeUnmount(() => formState.detach());

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
  void formState.finish(values as FormData);
};

/** 统一标准化 Antdv 校验错误并触发 finishFailed。 */
const handleFinishFailed = (error: unknown) => {
  formState.handleFinishFailed(error);
};

defineExpose<DynamicFormApi>(formApi);
</script>
