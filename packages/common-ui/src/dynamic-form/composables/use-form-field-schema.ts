import type { FormItemProps, Rule } from 'antdv-next';
import type { VNodeChild } from 'vue';

import { computed } from 'vue';
import { get, has } from 'lodash-es';

import { useDynamicFormContext } from '../core/context';
import { scopeDynamicFormApi } from '../core/form-api';
import { normalizePath, resolveFormPath } from '../utils/path';
import { getDefaultPlaceholder } from '../utils/placeholder';

import type {
  DynamicFormFieldSchema,
  DynamicFormFieldApi,
  FormData,
  FormPath,
  NormalizedFormPath,
} from '../types';

interface FormFieldSchemaProps<T extends FormData> {
  schema: DynamicFormFieldSchema<T>;
  basePath?: FormPath;
}

/**
 * 将原始字段 schema 解析成 FormItem 和字段控件可以直接消费的响应式状态。
 * 函数式配置统一接收字段 API，因此会自动追踪它实际读取的表单值。
 */
export function useFormFieldSchema<T extends FormData>(props: FormFieldSchemaProps<T>) {
  const { formApi, props: formProps, disabled: formDisabled } = useDynamicFormContext<T>();

  // basePath 用于嵌套表单；fieldPath 是字段在完整表单数据中的最终路径。
  const schemaRef = computed(() => props.schema);
  const basePath = computed<NormalizedFormPath>(() => normalizePath(props.basePath ?? []));
  const fieldPath = computed(() => resolveFormPath(basePath.value, props.schema.fieldName));
  const formItemName = computed(() => [...fieldPath.value]);
  // List 子字段的 basePath 以当前行索引结尾，因此可以无额外 props 推导行上下文。
  const listIndex = computed(() => {
    const lastSegment = basePath.value[basePath.value.length - 1];
    return typeof lastSegment === 'number' ? lastSegment : undefined;
  });
  const itemPath = computed(() =>
    listIndex.value === undefined ? undefined : [...basePath.value],
  );

  // value 使用 getter 延迟读取，只有函数式配置真正访问时才建立依赖。
  const fieldApi = scopeDynamicFormApi(formApi, () => ({
    get value() {
      return get(formApi.values, fieldPath.value);
    },
    field: {
      name: props.schema.fieldName,
      path: fieldPath.value,
      parentPath: basePath.value,
      listIndex: listIndex.value,
      itemPath: itemPath.value,
    },
  })) as DynamicFormFieldApi<T>;

  /** 统一解析静态值和接收字段上下文的函数式配置。 */
  function resolveValue<R>(value: R | ((api: DynamicFormFieldApi<T>) => R)): R {
    return typeof value === 'function'
      ? (value as (api: DynamicFormFieldApi<T>) => R)(fieldApi)
      : value;
  }

  // 字段行为状态既可静态声明，也可根据表单值动态计算。
  const resolvedIf = computed(() => {
    const value = props.schema.if;
    return value === undefined ? true : Boolean(resolveValue(value));
  });

  const resolvedShow = computed(() => {
    const value = props.schema.show;
    return value === undefined ? true : Boolean(resolveValue(value));
  });

  const resolvedDisabled = computed(() => {
    const value = props.schema.disabled;
    return formDisabled.value || (value === undefined ? false : Boolean(resolveValue(value)));
  });

  const resolvedRequired = computed(() => {
    const value = props.schema.required;
    return value === undefined ? false : Boolean(resolveValue(value));
  });

  /** 解析 label、help、description 等允许返回 VNodeChild 的内容配置。 */
  const resolveContent = (
    content: VNodeChild | ((api: DynamicFormFieldApi<T>) => VNodeChild) | undefined,
  ) => (typeof content === 'function' ? content(fieldApi) : content);

  const resolvedLabel = computed<FormItemProps['label']>(
    () => resolveContent(props.schema.label) as FormItemProps['label'],
  );
  const resolvedHelp = computed<FormItemProps['help']>(
    () => resolveContent(props.schema.help) as FormItemProps['help'],
  );
  const resolvedDescription = computed<FormItemProps['extra']>(
    () => resolveContent(props.schema.description) as FormItemProps['extra'],
  );

  // required 转换为标准校验规则，并放在用户 rules 前面。
  const resolvedRules = computed<Rule[]>(() => {
    const rawRules = resolveValue(props.schema.rules ?? []) as Rule[];
    if (!resolvedRequired.value) return rawRules;

    return [
      {
        required: true,
        ...(props.schema.requiredMessage ? { message: props.schema.requiredMessage } : {}),
      },
      ...rawRules,
    ];
  });

  // model 值由 DynamicForm 接管，需删除 fieldProps 中可能冲突的受控属性。
  const resolvedFieldProps = computed<Record<string, unknown>>(() => {
    const rawProps = resolveValue(
      'fieldProps' in props.schema ? (props.schema.fieldProps ?? {}) : {},
    ) as Record<string, unknown>;
    const nextProps = { ...rawProps };
    const modelPropName = props.schema.componentModel?.prop ?? 'modelValue';

    delete nextProps[modelPropName];
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

  // labelWidth 最终转换为 Antdv FormItem 所需的 labelCol.flex。
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

  return {
    fieldApi,
    schemaRef,
    basePath,
    fieldPath,
    formItemName,
    listIndex,
    itemPath,
    resolvedIf,
    resolvedShow,
    resolvedDisabled,
    resolvedLabel,
    resolvedHelp,
    resolvedDescription,
    resolvedRules,
    resolvedFieldProps,
    resolvedFormItemProps,
  };
}
