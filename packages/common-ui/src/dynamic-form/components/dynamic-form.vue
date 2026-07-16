<template>
  <!-- 根 Form 统一承接校验、布局和禁用状态；SchemaRenderer 只负责字段树。 -->
  <Form
    ref="formRef"
    v-bind="formBindings"
    class="dynamic-form"
    :model="formData"
    :layout="layout"
    :disabled="disabled"
    :validate-trigger="validateTrigger"
    @finish="handleFinish"
    @finish-failed="handleFinishFailed"
  >
    <Row :gutter="[16, 16]">
      <!-- 前后插槽与 Schema 字段处于同一 Row，可用于插入自定义栅格内容。 -->
      <slot name="before" :form-api="formApi" />
      <DynamicFormSchemaRenderer :schema="runtimeSchema" />
      <slot name="after" :form-api="formApi" />
    </Row>

    <!-- 默认操作区可整体关闭，也可分别隐藏重置或提交按钮。 -->
    <div v-if="showDefaultActions" class="dynamic-form__actions">
      <slot name="actions-before" :form-api="formApi" />
      <Space>
        <Button
          v-if="showResetButton"
          v-bind="resetButtonProps"
          html-type="button"
          @click="handleReset"
        >
          {{ resetButtonOptions?.content ?? '重置' }}
        </Button>
        <Button
          v-if="showSubmitButton"
          type="primary"
          v-bind="submitButtonProps"
          html-type="submit"
        >
          {{ submitButtonOptions?.content ?? '提交' }}
        </Button>
      </Space>
      <slot name="actions-after" :form-api="formApi" />
    </div>
  </Form>
</template>

<script setup lang="ts">
import { computed, nextTick, provide, readonly, shallowRef, useSlots, watch } from 'vue';
import { Button, Form, Row, Space } from 'antdv-next';

import { dynamicFormContextKey } from '../core/context';
import { createDynamicFormStore } from '../core/store';
import DynamicFormSchemaRenderer from '../renderers/schema-renderer.vue';
import {
  cloneDeep,
  cloneSchema,
  isEqual,
  normalizePath,
  patchSchema,
  removeHiddenValues,
} from '../utils';

import type { FormInstance } from 'antdv-next';
import type { Ref, ShallowRef } from 'vue';
import type { DynamicFormContext } from '../core/context';
import type { DynamicFormStore } from '../core/store';
import type {
  DeepPartial,
  DynamicFormController,
  DynamicFormEmits,
  DynamicFormFieldError,
  DynamicFormInstance,
  DynamicFormProps,
  DynamicFormSchema,
  DynamicFormValidateError,
  FormData,
  FormPath,
  GetValuesOptions,
} from '../types';

defineOptions({ name: 'DynamicForm' });

type InternalDynamicFormProps = DynamicFormProps<FormData> & {
  store?: DynamicFormStore<FormData>;
};

const props = withDefaults(defineProps<InternalDynamicFormProps>(), {
  modelValue: () => ({}),
  store: undefined,
  layout: 'horizontal',
  column: 1,
  removeHiddenData: true,
  validateTrigger: 'change',
  showDefaultActions: true,
});

const emit = defineEmits<DynamicFormEmits<FormData>>();
const slots = useSlots();

const runtimeSchema = shallowRef<DynamicFormSchema<FormData>>(cloneSchema(props.schema));
const providedStore = props.store;
const externalFormData = computed(() => props.modelValue) as Ref<FormData>;
const initialValues = providedStore ? providedStore.formData.value : cloneDeep(props.modelValue);
const formStore = providedStore ?? createDynamicFormStore(externalFormData, initialValues);
const formData = formStore.formData;
const formRef = shallowRef<FormInstance>();

/** Store 是唯一实时数据源；事件只用于通知调用方。 */
const notifyFormData = (fieldsChanged: string[] = []) => {
  emit('update:modelValue', formData.value);
  if (fieldsChanged.length) emit('valuesChange', cloneDeep(formData.value), fieldsChanged);
};

const getValues = async (options: GetValuesOptions = {}) => {
  const values = cloneDeep(formData.value);
  if (options.includeHidden || !props.removeHiddenData) return values;
  return removeHiddenValues(runtimeSchema.value, values, formApi);
};

const setValues = (values: DeepPartial<FormData>) => {
  if (formStore.setValues(values)) notifyFormData();
};

const getValue = (fieldName: FormPath) => cloneDeep(formStore.getValue(fieldName));

const setValue = (fieldName: FormPath, value: unknown) => {
  const path = normalizePath(fieldName);
  if (formStore.setValue(path, value)) notifyFormData([path.map(String).join('.')]);
};

const clearValidate = (fieldNames?: FormPath[]) => {
  formRef.value?.clearValidate(fieldNames?.map(normalizePath));
};

const resetFields = (fieldNames?: FormPath[]) => {
  if (formStore.resetFields(fieldNames)) {
    notifyFormData(fieldNames?.map((fieldName) => normalizePath(fieldName).map(String).join('.')));
  }

  nextTick(() => clearValidate(fieldNames));
};

const validate = async (fieldNames?: FormPath[]) => {
  if (!formRef.value) throw new Error('[DynamicForm] 表单尚未挂载，无法执行校验');
  await formRef.value.validateFields(fieldNames?.map(normalizePath));
  return getValues();
};

const normalizeError = (error: unknown): DynamicFormValidateError<FormData> => {
  const source = error as Partial<DynamicFormValidateError<FormData>>;
  return {
    values: cloneDeep(source.values ?? formData.value),
    errorFields: (source.errorFields ?? []).map((field) => ({
      name: field.name,
      errors: [...field.errors],
    })),
    outOfDate: source.outOfDate,
  };
};

const finishWithValues = async (values: FormData) => {
  // beforeFinish 接收到的已经是最终提交数据，不包含按配置需要移除的隐藏字段。
  const outputValues = props.removeHiddenData
    ? removeHiddenValues(runtimeSchema.value, cloneDeep(values), formApi)
    : cloneDeep(values);
  const errors = await props.beforeFinish?.({
    values: outputValues,
    schema: cloneSchema(runtimeSchema.value),
    formApi,
  });

  if (errors?.length) {
    formRef.value?.setFields(
      errors.map((field) => ({ name: normalizePath(field.name), errors: field.errors })),
    );
    emit('finishFailed', {
      values: outputValues,
      errorFields: errors,
    });
    return;
  }

  emit('finish', outputValues);
};

const submit = async () => {
  // 命令式 submit 与点击原生提交按钮共享同一套校验及 beforeFinish 流程。
  try {
    const values = await validate();
    await finishWithValues(values);
  } catch (error) {
    const normalized = normalizeError(error);
    emit('finishFailed', normalized);
    throw error;
  }
};

const scrollToField = (fieldName: FormPath) => {
  formRef.value?.scrollToField(normalizePath(fieldName));
};

const getSchema = () => cloneSchema(runtimeSchema.value);

const setSchema = (schema: DynamicFormSchema<FormData>) => {
  runtimeSchema.value = cloneSchema(schema);
  emit('schemaChange', getSchema());
};

const updateSchema: DynamicFormController<FormData>['updateSchema'] = (patches) => {
  runtimeSchema.value = patchSchema(runtimeSchema.value, patches);
  emit('schemaChange', getSchema());
};

const getFormInstance = () => formRef.value;

const formApi: DynamicFormInstance<FormData> = {
  formData: readonly(formData) as Readonly<Ref<FormData>>,
  formRef: readonly(formRef) as Readonly<ShallowRef<FormInstance | undefined>>,
  getValues,
  setValues,
  getValue,
  setValue,
  resetFields,
  validate,
  submit,
  clearValidate,
  scrollToField,
  getSchema,
  setSchema,
  updateSchema,
  getFormInstance,
};

// 所有递归 renderer 都通过 provide 获取同一个表单控制器和响应式配置。
const context: DynamicFormContext<FormData> = {
  formData,
  formApi,
  column: computed(() => props.column),
  labelWidth: computed(() => props.labelWidth),
  disabled: computed(() => props.disabled),
  readOnly: computed(() => props.readOnly),
  validateTrigger: computed(() => props.validateTrigger),
  slots,
  updateValue: setValue,
};

provide(dynamicFormContextKey, context as DynamicFormContext);

const formBindings = computed(() => ({
  labelWrap: true,
  ...props.formProps,
}));

const showResetButton = computed(() => props.resetButtonOptions?.show !== false);
const showSubmitButton = computed(() => props.submitButtonOptions?.show !== false);

const resetButtonProps = computed(() => {
  const { content: _content, show: _show, ...buttonProps } = props.resetButtonOptions ?? {};
  return buttonProps;
});

const submitButtonProps = computed(() => {
  const { content: _content, show: _show, ...buttonProps } = props.submitButtonOptions ?? {};
  return buttonProps;
});

const handleFinish = async () => finishWithValues(await getValues({ includeHidden: true }));
const handleFinishFailed = (error: unknown) => emit('finishFailed', normalizeError(error));
const handleReset = () => {
  resetFields();
  emit('reset', cloneDeep(formData.value));
};

watch(
  () => props.schema,
  (schema) => {
    if (isEqual(schema, runtimeSchema.value)) return;
    runtimeSchema.value = cloneSchema(schema);
  },
  { deep: true },
);

defineExpose(formApi);
</script>

<style scoped>
.dynamic-form {
  width: 100%;
}

.dynamic-form__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

:deep(.dynamic-form__extra) {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

:deep(.dynamic-form__readonly) {
  display: inline-block;
  min-height: 32px;
  line-height: 32px;
  white-space: pre-wrap;
}

:deep(.dynamic-form__component-error) {
  padding: 8px 12px;
  color: var(--ant-color-error);
  background: var(--ant-color-error-bg);
  border: 1px solid var(--ant-color-error-border);
  border-radius: var(--ant-border-radius);
}
</style>
