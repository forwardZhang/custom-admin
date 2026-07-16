import { defineComponent, h, markRaw, nextTick, readonly, ref, shallowRef } from 'vue';

import DynamicForm from '../components/dynamic-form.vue';
import { createDynamicFormStore } from '../core/store';
import { cloneDeep, cloneSchema, patchSchema } from '../utils';

import type { Component, Ref, ShallowRef } from 'vue';
import type { FormInstance } from 'antdv-next';
import type {
  BoundDynamicForm,
  DeepPartial,
  DynamicFormApi,
  DynamicFormInstance,
  DynamicFormSchema,
  FormData,
  FormPath,
  UseFormOptions,
} from '../types';

const splitOptions = <T extends FormData>(options: UseFormOptions<T>) => {
  const {
    initialValues: _initialValues,
    handleSubmit,
    handleReset,
    handleValuesChange,
    handleFinishFailed,
    handleSchemaChange,
    ...props
  } = options;

  return {
    props,
    callbacks: {
      handleSubmit,
      handleReset,
      handleValuesChange,
      handleFinishFailed,
      handleSchemaChange,
    },
  };
};

export const useForm = <T extends FormData = FormData>(
  options: UseFormOptions<T>,
): [BoundDynamicForm, DynamicFormApi<T>] => {
  // state 驱动预绑定组件重新渲染，setState 无需操作组件实例即可更新大部分配置。
  const initialSchema = cloneSchema(
    options.schema as DynamicFormSchema<FormData>,
  ) as DynamicFormSchema<T>;
  const state = shallowRef<UseFormOptions<T>>({ ...options, schema: initialSchema });
  const formData = ref<T>(cloneDeep(options.initialValues ?? {}) as T) as Ref<T>;
  const store = createDynamicFormStore(formData, formData.value);
  const instanceRef = shallowRef<DynamicFormInstance<T>>();
  const formRef = shallowRef<FormInstance>();

  const requireInstance = () => {
    if (!instanceRef.value) throw new Error('[DynamicForm] 表单尚未挂载');
    return instanceRef.value;
  };

  // 挂载前允许读写内存态；依赖真实 FormInstance 的校验、滚动等能力会明确报错。
  const api = {
    formData: readonly(formData) as Readonly<Ref<T>>,
    formRef: readonly(formRef) as Readonly<ShallowRef<FormInstance | undefined>>,
    getValues: async (getOptions) =>
      instanceRef.value ? instanceRef.value.getValues(getOptions) : cloneDeep(formData.value),
    setValues: (values: DeepPartial<T>) => {
      if (instanceRef.value) instanceRef.value.setValues(values);
      else store.setValues(values);
    },
    getValue: (fieldName: FormPath) =>
      instanceRef.value
        ? instanceRef.value.getValue(fieldName)
        : cloneDeep(store.getValue(fieldName)),
    setValue: (fieldName: FormPath, value: unknown) => {
      if (instanceRef.value) {
        instanceRef.value.setValue(fieldName, value);
        return;
      }
      store.setValue(fieldName, value);
    },
    resetFields: (fieldNames?: FormPath[]) => requireInstance().resetFields(fieldNames),
    validate: (fieldNames?: FormPath[]) => requireInstance().validate(fieldNames),
    submit: () => requireInstance().submit(),
    clearValidate: (fieldNames?: FormPath[]) => requireInstance().clearValidate(fieldNames),
    scrollToField: (fieldName: FormPath) => requireInstance().scrollToField(fieldName),
    getSchema: () =>
      instanceRef.value ? instanceRef.value.getSchema() : cloneSchema(state.value.schema),
    setSchema: (schema: DynamicFormSchema<T>) => {
      state.value = { ...state.value, schema: cloneSchema(schema) };
      instanceRef.value?.setSchema(schema);
    },
    updateSchema: (patches) => {
      const schema = patchSchema(state.value.schema, patches);
      state.value = { ...state.value, schema };
      instanceRef.value?.setSchema(schema);
    },
    setState: (
      nextState:
        | Partial<UseFormOptions<T>>
        | ((previous: UseFormOptions<T>) => Partial<UseFormOptions<T>>),
    ) => {
      const patch = typeof nextState === 'function' ? nextState(state.value) : nextState;
      const schema = patch.schema ? cloneSchema(patch.schema) : state.value.schema;
      state.value = { ...state.value, ...patch, schema };

      if (patch.initialValues) api.setValues(patch.initialValues);
      if (patch.schema) instanceRef.value?.setSchema(schema);
    },
  } satisfies DynamicFormApi<T>;

  const BoundForm = markRaw(
    // 返回预绑定配置的无 Props 组件，让页面只需渲染 <BoundForm />。
    defineComponent({
      name: 'BoundDynamicForm',
      inheritAttrs: false,
      setup(_props, { attrs, slots }) {
        /** 同步 DynamicForm 暴露实例以及内部 antdv FormInstance。 */
        const setInstance = (instance: unknown) => {
          instanceRef.value = (instance ?? undefined) as DynamicFormInstance<T> | undefined;
          nextTick(() => {
            formRef.value = instanceRef.value?.getFormInstance();
          });
        };

        return () => {
          const { props, callbacks } = splitOptions(state.value);

          return h(
            DynamicForm as Component,
            {
              ...props,
              ...attrs,
              ref: setInstance,
              modelValue: formData.value,
              store,
              onValuesChange: (values: T, fieldsChanged: string[]) => {
                callbacks.handleValuesChange?.(values, fieldsChanged);
              },
              onFinish: callbacks.handleSubmit,
              onFinishFailed: callbacks.handleFinishFailed,
              onReset: callbacks.handleReset,
              onSchemaChange: (schema: DynamicFormSchema<T>) => {
                state.value = { ...state.value, schema };
                callbacks.handleSchemaChange?.(schema);
              },
            },
            slots,
          );
        };
      },
    }),
  ) as BoundDynamicForm;

  return [BoundForm, api];
};
