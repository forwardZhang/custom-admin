import type { Component, VNodeChild } from 'vue';
import type { FormItemProps, Rule } from 'antdv-next';

import { computed, defineComponent, h, toHandlerKey } from 'vue';
import { get, has } from 'lodash-es';

import { useDynamicFormContext } from '../core/context';
import { createFieldApi } from '../core/form-api';
import { BUILTIN_FIELD_MAP } from '../field';
import { normalizePath, resolveFormPath } from '../utils/path';
import { getDefaultPlaceholder } from '../utils/placeholder';
import { cloneValue, valuesEqual } from '../utils/value';

import type {
  DynamicFormFieldApi,
  DynamicFormFieldEventApi,
  DynamicFormFieldSchema,
  FormData,
  FormPath,
  NormalizedFormPath,
} from '../types';

interface UseFormFieldProps<T extends FormData> {
  schema: DynamicFormFieldSchema<T>;
  basePath?: FormPath;
}

/**
 * 字段唯一入口：解析 schema → 生成 fieldApi → 产出 FormItem 状态与控件。
 * 读一个字段时只需要看这个文件。
 */
export function useFormField<T extends FormData>(props: UseFormFieldProps<T>) {
  const { formApi, props: formProps, disabled: formDisabled } = useDynamicFormContext<T>();

  const schemaRef = computed(() => props.schema);
  const basePath = computed<NormalizedFormPath>(() => normalizePath(props.basePath ?? []));
  const fieldPath = computed(() => resolveFormPath(basePath.value, props.schema.fieldName));
  const formItemName = computed(() => [...fieldPath.value]);

  // List 子字段的 basePath 以行索引结尾，可直接推导 list 上下文。
  const listIndex = computed(() => {
    const lastSegment = basePath.value[basePath.value.length - 1];
    return typeof lastSegment === 'number' ? lastSegment : undefined;
  });
  const itemPath = computed(() =>
    listIndex.value === undefined ? undefined : [...basePath.value],
  );

  const fieldApi = createFieldApi(formApi, () => ({
    get state() {
      return get(formApi.states, fieldPath.value);
    },
    field: {
      name: props.schema.fieldName,
      path: fieldPath.value,
      parentPath: basePath.value,
      listIndex: listIndex.value,
      itemPath: itemPath.value,
    },
  })) as DynamicFormFieldApi<T>;

  /** 静态值或 (api) => value 统一在这里解析。 */
  function resolve<R>(value: R | ((api: DynamicFormFieldApi<T>) => R)): R {
    return typeof value === 'function'
      ? (value as (api: DynamicFormFieldApi<T>) => R)(fieldApi)
      : value;
  }

  function resolveContent(
    content: VNodeChild | ((api: DynamicFormFieldApi<T>) => VNodeChild) | undefined,
  ) {
    return typeof content === 'function' ? content(fieldApi) : content;
  }

  const resolvedIf = computed(() =>
    props.schema.if === undefined ? true : Boolean(resolve(props.schema.if)),
  );
  const resolvedShow = computed(() =>
    props.schema.show === undefined ? true : Boolean(resolve(props.schema.show)),
  );
  const resolvedDisabled = computed(() => {
    const value = props.schema.disabled;
    return formDisabled.value || (value === undefined ? false : Boolean(resolve(value)));
  });
  const resolvedRequired = computed(() =>
    props.schema.required === undefined ? false : Boolean(resolve(props.schema.required)),
  );

  const resolvedLabel = computed(
    () => resolveContent(props.schema.label) as FormItemProps['label'],
  );
  const resolvedHelp = computed(() => resolveContent(props.schema.help) as FormItemProps['help']);
  const resolvedDescription = computed(
    () => resolveContent(props.schema.description) as FormItemProps['extra'],
  );

  const resolvedRules = computed<Rule[]>(() => {
    const rawRules = resolve(props.schema.rules ?? []) as Rule[];
    if (!resolvedRequired.value) return rawRules;
    return [
      {
        required: true,
        ...(props.schema.requiredMessage ? { message: props.schema.requiredMessage } : {}),
      },
      ...rawRules,
    ];
  });

  const resolvedFieldProps = computed<Record<string, unknown>>(() => {
    const rawProps = resolve(
      'fieldProps' in props.schema ? (props.schema.fieldProps ?? {}) : {},
    ) as Record<string, unknown>;
    const nextProps = { ...rawProps };
    const modelName = props.schema.componentModel?.prop ?? 'modelValue';

    // model 由 DynamicForm 接管，避免 fieldProps 覆盖受控值。
    delete nextProps[modelName];
    if (typeof props.schema.component === 'string') {
      delete nextProps.value;
      delete nextProps.checked;
    }

    if (resolvedDisabled.value || 'disabled' in rawProps) {
      nextProps.disabled = resolvedDisabled.value || rawProps.disabled === true;
    }

    if (
      typeof props.schema.component === 'string' &&
      props.schema.component !== 'list' &&
      !has(rawProps, 'placeholder')
    ) {
      const placeholder = getDefaultPlaceholder(props.schema.component, resolvedLabel.value);
      if (placeholder !== undefined) nextProps.placeholder = placeholder;
    }

    return nextProps;
  });

  const resolvedFormItemProps = computed(() => {
    const itemProps = { ...props.schema.formItemProps } as Record<string, unknown>;
    const width = formProps.value.labelWidth;
    if (width !== undefined) {
      itemProps.labelCol = {
        flex: `0 0 ${typeof width === 'number' ? `${width}px` : width}`,
      };
    }
    return itemProps;
  });

  // ---- 控件渲染 ----
  const fieldComponent = computed<Component>(() => {
    const component = props.schema.component;
    if (component === 'list') {
      throw new Error('[DynamicForm] List fields are rendered by FormField');
    }
    return typeof component === 'string' ? BUILTIN_FIELD_MAP[component] : component;
  });

  const modelPropName = computed(() => props.schema.componentModel?.prop ?? 'modelValue');
  const modelEventName = computed(() => props.schema.componentModel?.event ?? 'update:modelValue');
  const modelListenerName = computed(() => toHandlerKey(modelEventName.value));

  const handleModelUpdate = (...args: unknown[]) => {
    const nextValue = args[0];
    const oldValue = cloneValue(fieldApi.state);
    if (valuesEqual(oldValue, nextValue)) return;

    fieldApi.setState(fieldApi.field.path, nextValue);
    const eventApi: DynamicFormFieldEventApi<T> = {
      ...fieldApi,
      state: nextValue,
      oldValue,
      nativeArgs: args,
    };
    props.schema.onChange?.(eventApi);
  };

  const componentSlots = computed(() => {
    const slots = props.schema.renderComponentContent?.(fieldApi) ?? {};
    return Object.fromEntries(
      Object.entries(slots).map(([name, render]) => [name, () => render()]),
    );
  });

  const FieldControl = defineComponent({
    name: 'DynamicFormFieldControl',
    setup() {
      return () => {
        const rawProps = resolvedFieldProps.value;
        const userModelHandler = rawProps[modelListenerName.value];
        const updateHandler = (...args: unknown[]) => {
          if (typeof userModelHandler === 'function') userModelHandler(...args);
          handleModelUpdate(...args);
        };

        // 内置包装组件吃 fieldProps；自定义组件直接展开 props。
        const controlProps: Record<string, unknown> =
          typeof props.schema.component === 'string'
            ? {
                fieldProps: rawProps,
                [modelPropName.value]: fieldApi.state,
                [modelListenerName.value]: updateHandler,
              }
            : {
                ...rawProps,
                [modelPropName.value]: fieldApi.state,
                [modelListenerName.value]: updateHandler,
              };

        return h(fieldComponent.value, controlProps, componentSlots.value);
      };
    },
  });

  return {
    schemaRef,
    fieldApi,
    fieldPath,
    formItemName,
    resolvedIf,
    resolvedShow,
    resolvedDisabled,
    resolvedLabel,
    resolvedHelp,
    resolvedDescription,
    resolvedRules,
    resolvedFormItemProps,
    FieldControl,
  };
}
