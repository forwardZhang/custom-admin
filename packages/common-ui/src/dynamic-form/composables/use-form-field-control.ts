import type { Component, Ref } from 'vue';

import { computed, defineComponent, h, toHandlerKey } from 'vue';

import { scopeDynamicFormApi } from '../core/form-api';
import { BUILTIN_FIELD_MAP } from '../field';
import { cloneValue, valuesEqual } from '../utils/value';

import type { DynamicFormFieldApi, DynamicFormFieldSchema, FormData } from '../types';

interface FormFieldControlOptions<T extends FormData> {
  schema: Readonly<Ref<DynamicFormFieldSchema<T>>>;
  api: DynamicFormFieldApi<T>;
  fieldProps: Readonly<Ref<Record<string, unknown>>>;
}

/**
 * 将字段 schema 转换为真正可渲染的控件，并统一接管 model 更新与 schema 插槽。
 * 内置控件通过 fieldProps 接收属性，自定义控件则直接接收展开后的属性。
 */
export function useFormFieldControl<T extends FormData>(options: FormFieldControlOptions<T>) {
  // 字符串组件名映射到内置包装组件；Component 类型则按自定义组件直接使用。
  const fieldComponent = computed<Component>(() => {
    const component = options.schema.value.component;
    if (component === 'list') {
      throw new Error('[DynamicForm] List fields are rendered by FormField');
    }
    return typeof component === 'string' ? BUILTIN_FIELD_MAP[component] : component;
  });

  // componentModel 允许自定义组件声明自己的 model prop 和更新事件。
  const modelPropName = computed(() => options.schema.value.componentModel?.prop ?? 'modelValue');
  const modelEventName = computed(
    () => options.schema.value.componentModel?.event ?? 'update:modelValue',
  );
  const modelListenerName = computed(() => toHandlerKey(modelEventName.value));

  /** 将控件新值写入表单，并用完整上下文触发 schema.onChange。 */
  const handleModelUpdate = (...args: unknown[]) => {
    const nextValue = args[0];
    const oldValue = cloneValue(options.api.field.value);
    if (valuesEqual(oldValue, nextValue)) return;

    options.api.setValue(options.api.field.path, nextValue);
    const eventApi = scopeDynamicFormApi(options.api, () => ({
      ...options.api.field,
      value: nextValue,
      oldValue,
      nativeArgs: args,
    }));
    options.schema.value.onChange?.(eventApi);
  };

  // 把 schema 返回的插槽渲染函数转换成 Vue h() 需要的 slots 对象。
  const componentSlots = computed(() => {
    const slots = options.schema.value.renderComponentContent?.(options.api) ?? {};
    return Object.fromEntries(
      Object.entries(slots).map(([name, render]) => [name, () => render()]),
    );
  });

  // 使用渲染函数可以动态切换控件类型，同时保留统一的 model 事件代理。
  const FieldControl = defineComponent({
    name: 'DynamicFormFieldControl',
    setup() {
      return () => {
        const rawProps = options.fieldProps.value;
        const userModelHandler = rawProps[modelListenerName.value];

        // 先执行用户传入的 model 监听器，再同步 DynamicForm 内部状态。
        const updateHandler = (...args: unknown[]) => {
          if (typeof userModelHandler === 'function') {
            userModelHandler(...args);
          }
          handleModelUpdate(...args);
        };

        // 内置包装组件约定接收 fieldProps；自定义组件遵循原生 props 传递方式。
        const controlProps: Record<string, unknown> =
          typeof options.schema.value.component === 'string'
            ? {
                fieldProps: rawProps,
                [modelPropName.value]: options.api.field.value,
                [modelListenerName.value]: updateHandler,
              }
            : {
                ...rawProps,
                [modelPropName.value]: options.api.field.value,
                [modelListenerName.value]: updateHandler,
              };

        return h(fieldComponent.value, controlProps, componentSlots.value);
      };
    },
  });

  return { FieldControl };
}
