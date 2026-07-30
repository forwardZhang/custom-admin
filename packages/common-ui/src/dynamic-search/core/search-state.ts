import type { ComputedRef, Ref } from 'vue';

import { computed, ref, shallowRef } from 'vue';

import { createAttachGuard } from '../../internal/attach-guard';
import { bindApiMethods, createApiObject } from '../../internal/create-api';
import { DynamicFormState, FORM_API_METHODS } from '../../dynamic-form/core/form-api';
import { createSearchLayout } from './layout';

import type {
  DeepPartial,
  DynamicFormApi,
  DynamicFormSchema,
  DynamicFormValidateError,
  FormData,
} from '../../dynamic-form';
import type { DynamicSearchApi, UseDynamicSearchOptions } from '../types';

/** 宿主组件把 emit 汇入这里，业务侧的 handleXxx 由宿主一并调用。 */
interface SearchApiCallbacks<T extends FormData> {
  onValuesChange?: (values: T, fieldsChanged: string[]) => void;
  onSearch?: (values: T) => void;
  onReset?: (values: T) => void;
  onFinishFailed?: (error: DynamicFormValidateError<T>) => void;
  onSchemaChange?: (schema: DynamicFormSchema<T>) => void;
  onExpandChange?: (expanded: boolean) => void;
}

interface DynamicSearchAttachOptions<T extends FormData> {
  callbacks: SearchApiCallbacks<T>;
}

/** DynamicSearchApi 的方法名；组合组件（DynamicPage）按这份名单委托。 */
export const SEARCH_API_METHODS = [
  ...FORM_API_METHODS,
  'toggleExpand',
] as const satisfies readonly (keyof DynamicSearchApi)[];

/**
 * 搜索状态与命令式 API 的唯一实现。
 * 内聚一个 DynamicFormState，所以表单部分的 API 在任何组件挂载之前就已经可用。
 */
export class DynamicSearchState<T extends FormData = FormData> {
  readonly api: DynamicSearchApi<T>;
  readonly formState: DynamicFormState<T>;
  readonly state: Ref<UseDynamicSearchOptions<T>>;
  readonly expandedRef: Ref<boolean>;

  readonly canCollapse: ComputedRef<boolean>;
  readonly mergedFormProps: ComputedRef<UseDynamicSearchOptions<T>['formProps']>;
  readonly runtimeSchema: ComputedRef<DynamicFormSchema<T>>;

  /** 带默认值的配置；组件模式和 Hook 模式共用同一套默认值。 */
  readonly resolved = computed(() => {
    const options = this.state.value;

    return {
      layout: options.layout ?? 'horizontal',
      disabled: Boolean(options.disabled),
      labelWidth: options.labelWidth,
      scrollToFirstError: options.scrollToFirstError !== false,
      showSearchButton: options.searchButtonOptions?.show !== false,
      showResetButton: options.resetButtonOptions?.show !== false,
      showCollapseButton: this.canCollapse.value && options.collapseButtonOptions?.show !== false,
      searchText: options.searchButtonOptions?.content ?? '查询',
      resetText: options.resetButtonOptions?.content ?? '重置',
    };
  });

  private readonly attachGuard = createAttachGuard('DynamicSearch');
  private callbacks: SearchApiCallbacks<T> = {};

  constructor(options: UseDynamicSearchOptions<T>) {
    this.state = shallowRef({ ...options }) as Ref<UseDynamicSearchOptions<T>>;
    this.expandedRef = ref(Boolean(options.defaultExpanded));

    const layout = createSearchLayout<T>(() => this.state.value, this.expandedRef);
    this.canCollapse = layout.canCollapse;
    this.mergedFormProps = layout.formProps;
    this.runtimeSchema = layout.schema as ComputedRef<DynamicFormSchema<T>>;

    // 表单配置里与布局相关的部分由 DynamicSearch 直接绑定成 DynamicForm 的 props，
    // 这里只交出业务回调，让 DynamicFormState 在提交 / 重置 / 变更时回调到搜索层。
    this.formState = new DynamicFormState<T>({
      schema: this.runtimeSchema.value,
      initialValues: options.initialValues,
      layout: this.resolved.value.layout,
      disabled: this.resolved.value.disabled,
      labelWidth: options.labelWidth,
      wrapperClass: 'contents',
      showDefaultActions: false,
      scrollToFirstError: this.resolved.value.scrollToFirstError,
      formProps: this.mergedFormProps.value,
      handleSubmit: (values) => this.callbacks.onSearch?.(values),
      handleReset: (values) => this.callbacks.onReset?.(values),
      handleValuesChange: (values, fieldsChanged) =>
        this.callbacks.onValuesChange?.(values, fieldsChanged),
      handleFinishFailed: (error) => this.callbacks.onFinishFailed?.(error),
      handleSchemaChange: (schema) => this.callbacks.onSchemaChange?.(schema),
    });

    this.api = this.createPublicApi();
  }

  attach(options: DynamicSearchAttachOptions<T>) {
    this.attachGuard.attach();
    this.callbacks = options.callbacks;
  }

  detach() {
    this.attachGuard.detach();
    this.callbacks = {};
  }

  get expanded(): boolean {
    return this.expandedRef.value;
  }

  /** 切换展开状态；折叠会通过 runtimeSchema 影响传给表单的 schema，但不会丢字段值。 */
  toggleExpand(force?: boolean) {
    const nextExpanded = force ?? !this.expandedRef.value;
    if (nextExpanded === this.expandedRef.value) return;

    this.expandedRef.value = nextExpanded;
    this.callbacks.onExpandChange?.(nextExpanded);
  }

  setOptions(options: Partial<UseDynamicSearchOptions<T>>) {
    this.state.value = { ...this.state.value, ...options };

    // initialValues 同时决定 reset 基线，交给表单状态处理。
    if ('initialValues' in options) {
      this.formState.setOptions({ initialValues: options.initialValues });
    }
    if ('defaultExpanded' in options) this.toggleExpand(Boolean(options.defaultExpanded));
  }

  /** 组件模式下 props 是唯一配置来源，内部同步走这里。 */
  syncOptions(options: Partial<UseDynamicSearchOptions<T>>) {
    this.state.value = { ...this.state.value, ...options };
  }

  /** 把布局处理后的 schema 推给表单；由宿主组件在 runtimeSchema 变化时调用。 */
  syncSchema() {
    this.formState.setSchema(this.runtimeSchema.value);
  }

  private createPublicApi(): DynamicSearchApi<T> {
    const formApi = this.formState.api;

    return createApiObject<DynamicSearchApi<T>>(
      {
        ...bindApiMethods<DynamicSearchApi<T>, DynamicFormApi<T>>(formApi, FORM_API_METHODS),
        // 搜索层的 setOptions 覆盖表单的同名方法，接收的是搜索配置。
        ...bindApiMethods<DynamicSearchApi<T>, DynamicSearchState<T>>(this, [
          'toggleExpand',
          'setOptions',
        ]),
      },
      {
        states: () => formApi.states,
        expanded: () => this.expandedRef.value,
      },
    );
  }
}
