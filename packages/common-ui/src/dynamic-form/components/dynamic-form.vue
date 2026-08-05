<template>
  <Form
    ref="antFormRef"
    v-bind="mergedFormProps"
    :model="values"
    :layout="props.layout"
    :disabled="props.disabled"
    :scroll-to-first-error="props.scrollToFirstError"
    @finish="handleNativeFinish"
    @finish-failed="handleFinishFailed"
  >
    <div :class="props.wrapperClass">
      <FormField
        v-for="(field, index) in fieldSchema"
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

<script setup lang="ts" generic="T extends FormData = FormData">
import type { FormInstance } from 'antdv-next';

import { computed, shallowRef, watch } from 'vue';
import { Form } from 'antdv-next';

import FormActions from './form-actions.vue';
import FormField from './form-field.vue';
import { provideDynamicFormContext } from '../core/context';
import { useFormValidate } from '../composables/use-form-validate';
import { useFormValues } from '../composables/use-form-values';
import { pathToString } from '../utils/path';
import { cloneSchema } from '../utils/schema';

import type {
  DynamicFormApi,
  DynamicFormEmits,
  DynamicFormProps,
  DynamicFormSchema,
  FormData,
  FormPath,
} from '../types';

defineOptions({ name: 'DynamicForm', inheritAttrs: false });

// 配置只从 props 来；默认值只写在这里一处。
const props = withDefaults(defineProps<DynamicFormProps<T>>(), {
  initialValues: undefined,
  layout: undefined,
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

defineSlots<{
  actions(props: { reset: () => void; submit: () => void }): unknown;
}>();

const antFormRef = shallowRef<FormInstance>();

/** 字段渲染不区分具体表单类型，泛型只服务于调用方的类型推断。 */
const fieldSchema = computed(() => props.schema as DynamicFormSchema<FormData>);

const mergedFormProps = computed(() => ({
  labelWrap: true,
  ...props.formProps,
}));

// initialValues 作为重置基线；未配置时使用 schema.defaultValue。
const formValues = useFormValues<T>({
  seed: props.initialValues,
  getSchema: () => props.schema,
  onChange(values, fieldsChanged) {
    if (fieldsChanged.length) emit('valuesChange', values, fieldsChanged);
  },
});

/** 模板里 Antdv Form 的 model 直接绑这份响应式值。 */
const { values } = formValues;

const formValidate = useFormValidate<T>({
  getNativeInstance: () => antFormRef.value,
  getValues: formValues.getValues,
  finish: (values) => emit('finish', values),
  onFinishFailed: (error) => emit('finishFailed', error),
});

/** 值回到基线 + 清掉原生校验状态，两件事只有这里会一起做。
 * 注意只能清校验状态：底层 Form 的 resetFields 会把它挂载时的快照写回 model，
 * 与我们刚恢复的基线打架（列表字段会残留多余项）。 */
function resetFields(fieldNames?: FormPath[]): void {
  formValues.resetValues(fieldNames);
  formValidate.clearValidate(fieldNames);
  // 底层 Form 对任何 model 变更都会跑一轮 change 校验，等这一轮落地后再清一次，
  // 否则重置完的空字段会立刻亮起 required 错误。
  setTimeout(() => formValidate.clearValidate(fieldNames), 0);

  emit('reset', formValues.getValues());
}

const formApi: DynamicFormApi<T> = {
  // 与 getValues() 共用同一份缓存视图：字段的每个 resolver 都会读 values，
  // 这里每次现造 readonly 代理的话，光是渲染一轮就要造上百个。
  get values() {
    return formValues.getValues();
  },
  getValues: formValues.getValues,
  setValues: formValues.setValues,
  getFieldValue: formValues.getFieldValue,
  setFieldValue: formValues.setFieldValue,
  resetFields,
  validate: formValidate.validate,
  clearValidate: formValidate.clearValidate,
  submit: formValidate.submit,
  scrollToField: formValidate.scrollToField,
  getSchema: () => cloneSchema(props.schema),
  getNativeInstance: () => antFormRef.value,
};

provideDynamicFormContext<T>({
  formApi,
  labelWidth: computed(() => props.labelWidth),
  disabled: computed(() => Boolean(props.disabled)),
});

// initialValues 变更只移动重置基线，不覆盖用户当前输入。
watch(
  () => props.initialValues,
  (seed) => formValues.rebaseline(seed),
  { deep: true },
);

/** 按钮提交与外部 api.submit 走同一条流程。 */
function handleSubmit(): void {
  void formApi.submit().catch(() => undefined);
}

function handleReset(): void {
  resetFields();
}

/** 原生回车提交：Antdv 已校验完成，这里只补发 finish。 */
function handleNativeFinish(): void {
  emit('finish', formValues.getValues());
}

function handleFinishFailed(error: unknown): void {
  formValidate.handleFinishFailed(error);
}

defineExpose<DynamicFormApi<T>>(formApi);
</script>
