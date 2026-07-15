import { computed, onBeforeUnmount, reactive, watch } from 'vue';

import { cloneDeep, get, resolvePath } from '../utils';

import type { DynamicFormContext } from '../core/context';
import type { DynamicFormDependencies, DynamicFormRule, FormData } from '../types';

export interface DependencyRuntimeState {
  shouldRender: boolean;
  shouldShow: boolean;
  disabled: boolean;
  required?: boolean;
  rules: DynamicFormRule[];
  componentProps: Record<string, unknown>;
}

const resolveDependencyValue = <T extends FormData, R>(
  value: R | ((values: Readonly<T>, api: DynamicFormContext<T>['formApi']) => R) | undefined,
  context: DynamicFormContext<T>,
  fallback: R,
) => {
  if (typeof value !== 'function') return value ?? fallback;

  try {
    return (value as (values: Readonly<T>, api: DynamicFormContext<T>['formApi']) => R)(
      context.formData.value,
      context.formApi,
    );
  } catch (error) {
    console.error('[DynamicForm] dependency evaluation failed:', error);
    return fallback;
  }
};

export const useDependencies = <T extends FormData>(
  dependencies: () => DynamicFormDependencies<T> | undefined,
  basePath: () => Array<string | number>,
  context: DynamicFormContext<T>,
): DependencyRuntimeState => {
  /** dependencies 的计算结果统一收敛为稳定的响应式状态。 */
  const state = reactive<DependencyRuntimeState>({
    shouldRender: true,
    shouldShow: true,
    disabled: false,
    required: undefined,
    rules: [],
    componentProps: {},
  });

  let scheduled = false;
  let disposed = false;

  const evaluate = (runTrigger: boolean) => {
    // 每轮都重算完整状态，避免依赖配置删除某项后遗留上一次结果。
    const config = dependencies();
    state.shouldRender = resolveDependencyValue(config?.if, context, true);
    state.shouldShow = resolveDependencyValue(config?.show, context, true);
    state.disabled = resolveDependencyValue(config?.disabled, context, false);
    state.required =
      config?.required === undefined
        ? undefined
        : resolveDependencyValue(config.required, context, false);
    state.rules = resolveDependencyValue(config?.rules, context, []);
    state.componentProps = resolveDependencyValue(config?.componentProps, context, {});

    if (runTrigger && config?.trigger) {
      try {
        config.trigger(context.formData.value, context.formApi);
      } catch (error) {
        console.error('[DynamicForm] dependency trigger failed:', error);
      }
    }
  };

  const scheduleEvaluate = () => {
    if (scheduled) return;
    scheduled = true;
    // 同一事件循环内多个 triggerFields 变化只计算一次，避免联动重复执行。
    queueMicrotask(() => {
      scheduled = false;
      if (!disposed) evaluate(true);
    });
  };

  const triggerValues = computed(() =>
    // 只读取声明过的依赖字段，getter 内访问的其他字段不会扩大监听范围。
    (dependencies()?.triggerFields ?? []).map((path) =>
      cloneDeep(get(context.formData.value, resolvePath(basePath(), path))),
    ),
  );

  watch(
    [() => dependencies(), triggerValues],
    (_value, oldValue) => {
      if (oldValue === undefined) evaluate(false);
      else scheduleEvaluate();
    },
    { deep: true, immediate: true },
  );

  onBeforeUnmount(() => {
    disposed = true;
  });

  return state;
};
