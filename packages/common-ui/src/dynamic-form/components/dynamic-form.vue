<template>
  <!-- 根 Form 统一承接校验、布局和禁用状态；SchemaRenderer 只负责字段树。 -->
  <Form
    ref="formRef"
    v-bind="formBindings"
    class="cu-dynamic-form"
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
    <div v-if="showDefaultActions" class="cu-dynamic-form__actions">
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
import {
  computed,
  inject,
  nextTick,
  provide,
  readonly,
  ref,
  shallowRef,
  useSlots,
  watch,
} from 'vue';
import { Button, Form, Row, Space } from 'antdv-next';

import { dynamicFormContextKey } from '../core/context';
import DynamicFormSchemaRenderer from '../renderers/schema-renderer.vue';
import {
  applySchemaDefaults,
  cloneDeep,
  cloneSchema,
  get,
  has,
  isEqual,
  mergeValues,
  normalizePath,
  patchSchema,
  removeHiddenValues,
  set,
  unset,
} from '../utils';

import type { FormInstance } from 'antdv-next';
import type { Ref, ShallowRef } from 'vue';
import type { DynamicFormContext } from '../core/context';
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

const props = withDefaults(defineProps<DynamicFormProps<FormData>>(), {
  modelValue: () => ({}),
  layout: 'horizontal',
  column: 1,
  removeHiddenData: true,
  validateTrigger: 'change',
  showDefaultActions: true,
});

const emit = defineEmits<DynamicFormEmits<FormData>>();
const slots = useSlots();

// Schema、初始数据和当前数据分离维护，确保 resetFields 始终有稳定基线。
const runtimeSchema = shallowRef<DynamicFormSchema<FormData>>(cloneSchema(props.schema));
const initialData = ref<FormData>(
  applySchemaDefaults(runtimeSchema.value, cloneDeep(props.modelValue)),
) as Ref<FormData>;
const formData = ref<FormData>(cloneDeep(initialData.value)) as Ref<FormData>;
const formRef = shallowRef<FormInstance>();

/** 统一的数据写入口，负责去重、克隆以及向外同步 v-model。 */
const updateFormData = (nextValue: FormData, fieldsChanged: string[] = []) => {
  if (isEqual(formData.value, nextValue)) return;
  formData.value = cloneDeep(nextValue);
  emit('update:modelValue', cloneDeep(formData.value));
  if (fieldsChanged.length) emit('valuesChange', cloneDeep(formData.value), fieldsChanged);
};

const getValues = async (options: GetValuesOptions = {}) => {
  const values = cloneDeep(formData.value);
  if (options.includeHidden || !props.removeHiddenData) return values;
  return removeHiddenValues(runtimeSchema.value, values, formApi);
};

const setValues = (values: DeepPartial<FormData>) => {
  // 对象字段递归合并，数组字段整体替换，避免残留旧数组项。
  updateFormData(mergeValues(formData.value, values));
};

const getValue = (fieldName: FormPath) => cloneDeep(get(formData.value, normalizePath(fieldName)));

const setValue = (fieldName: FormPath, value: unknown) => {
  const path = normalizePath(fieldName);
  if (isEqual(get(formData.value, path), value)) return;
  const nextValue = cloneDeep(formData.value);
  set(nextValue, path, cloneDeep(value));
  updateFormData(nextValue, [path.map(String).join('.')]);
};

const clearValidate = (fieldNames?: FormPath[]) => {
  formRef.value?.clearValidate(fieldNames?.map(normalizePath));
};

const resetFields = (fieldNames?: FormPath[]) => {
  // 未传字段时恢复整份快照；指定字段时仅恢复其初始值或删除后来新增的值。
  if (!fieldNames?.length) {
    updateFormData(cloneDeep(initialData.value));
  } else {
    const nextValue = cloneDeep(formData.value);
    fieldNames.forEach((fieldName) => {
      const path = normalizePath(fieldName);
      if (has(initialData.value, path))
        set(nextValue, path, cloneDeep(get(initialData.value, path)));
      else unset(nextValue, path);
    });
    updateFormData(
      nextValue,
      fieldNames.map((fieldName) => normalizePath(fieldName).join('.')),
    );
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

const syncDefaults = () => {
  // Schema 动态更新后同时补齐当前值和 reset 基线中的新增默认值。
  const nextValue = applySchemaDefaults(runtimeSchema.value, formData.value);
  const nextInitial = applySchemaDefaults(runtimeSchema.value, initialData.value);
  initialData.value = nextInitial;
  updateFormData(nextValue);
};

const setSchema = (schema: DynamicFormSchema<FormData>) => {
  runtimeSchema.value = cloneSchema(schema);
  syncDefaults();
  emit('schemaChange', getSchema());
};

const updateSchema: DynamicFormController<FormData>['updateSchema'] = (patches) => {
  runtimeSchema.value = patchSchema(runtimeSchema.value, patches);
  syncDefaults();
  emit('schemaChange', getSchema());
};

const getFormInstance = () => formRef.value;

const formApi: DynamicFormInstance<FormData> = {
  formData,
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
  () => props.modelValue,
  (value) => {
    if (isEqual(value, formData.value)) return;
    updateFormData(applySchemaDefaults(runtimeSchema.value, cloneDeep(value)));
  },
  { deep: true },
);

watch(
  () => props.schema,
  (schema) => {
    if (isEqual(schema, runtimeSchema.value)) return;
    runtimeSchema.value = cloneSchema(schema);
    syncDefaults();
  },
  { deep: true },
);

defineExpose(formApi);
</script>

<style scoped>
.cu-dynamic-form {
  width: 100%;
}

.cu-dynamic-form__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

:deep(.cu-dynamic-form__extra) {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

:deep(.cu-dynamic-form__readonly) {
  display: inline-block;
  min-height: 32px;
  line-height: 32px;
  white-space: pre-wrap;
}

:deep(.cu-dynamic-form__component-error) {
  padding: 8px 12px;
  color: var(--ant-color-error);
  background: var(--ant-color-error-bg);
  border: 1px solid var(--ant-color-error-border);
  border-radius: var(--ant-border-radius);
}
</style>
