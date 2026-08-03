import type { Component, ShallowRef, Slots } from 'vue';

import { h, shallowRef } from 'vue';

import { useApiProxy } from './use-api-proxy';

import type { ApiProxyDefinition } from './use-api-proxy';

/** Hook 的运行时部分：组件实例引用 + 引用稳定的命令式 API。 */
export interface DynamicHost<TApi extends object> {
  /** 包装组件把内部 SFC 的实例写进这里。 */
  instance: ShallowRef<TApi | undefined>;
  /** 生命周期跟随挂载、但引用始终稳定的命令式 API。 */
  api: TApi;
}

/**
 * 五个 useDynamicXxx 共用的运行时部分。
 * 泛型绑定留给各 Hook 自己用 defineComponent 的 props 类型注解完成，这里不碰类型，
 * 因此不需要把包装组件强转成内部 SFC 的类型。
 */
export function useDynamicHost<TApi extends object>(
  label: string,
  definition: ApiProxyDefinition<TApi>,
): DynamicHost<TApi> {
  const instance = shallowRef<TApi>();
  const api = useApiProxy<TApi>(label, () => instance.value, definition);

  return { instance, api };
}

/**
 * 包装组件的渲染函数：属性与插槽原样透传给内部 SFC，并把它的实例登记给 API 代理。
 * 包装组件只声明 props 类型不声明运行时 props，因此调用方传的所有配置都会经 attrs 透传下去。
 * component 用 unknown 收口：泛型 SFC 的类型不满足 Component，但运行时就是普通组件。
 */
export function renderDynamicHost<TApi extends object>(
  component: unknown,
  instance: ShallowRef<TApi | undefined>,
  ctx: { attrs: Record<string, unknown>; slots: Slots },
): () => ReturnType<typeof h> {
  return () => h(component as Component, { ...ctx.attrs, ref: instance }, ctx.slots);
}
