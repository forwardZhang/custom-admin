import { watch } from 'vue';

/** 命令式 API 方法的签名上界；参数用 never[] 以接受任意具体方法。 */
type ApiMethod = (...args: never[]) => unknown;

/** 成员清单：代理需要知道每个成员的种类，才能决定组件挂载前的行为。 */
export interface ApiProxyDefinition<TApi extends object> {
  /** 返回 Promise 的命令：挂载前排队，挂载后按调用顺序补发。 */
  commands?: readonly (keyof TApi & string)[];
  /** 同步方法：挂载前有 fallbacks 就返回兜底值，否则开发期告警并返回 undefined。 */
  methods?: readonly (keyof TApi & string)[];
  /** 只读属性：挂载前返回 fallbacks 给出的兜底值。 */
  properties?: readonly (keyof TApi & string)[];
  /** 挂载前的兜底值，键既可以是只读属性也可以是同步方法。 */
  fallbacks?: Partial<Record<keyof TApi & string, () => unknown>>;
  /** 与组件实例无关的固定成员，例如组合出来的子 API。 */
  constants?: Partial<TApi>;
}

/**
 * 由组件实例生成引用稳定的命令式 API。
 *
 * 配置走 props、命令走组件 expose 之后，API 的生命周期天然跟随挂载。
 * 这里用一层代理把这件事收敛掉：方法引用在整个生命周期内不变，可解构、可放进依赖数组；
 * 挂载前的调用按种类分流——异步命令排队补发，同步方法取兜底值或告警，只读属性取兜底值。
 */
export function useApiProxy<TApi extends object>(
  label: string,
  getInstance: () => TApi | undefined,
  definition: ApiProxyDefinition<TApi>,
): TApi {
  const pending: Array<(instance: TApi) => void> = [];
  const warned = new Set<string>();
  const api: Record<string, unknown> = {};

  /** 补发排队命令；先进先出，保证调用方看到的执行顺序与调用顺序一致。 */
  function flushPending(instance: TApi): void {
    if (pending.length === 0) return;
    for (const run of pending.splice(0, pending.length)) run(instance);
  }

  function warnNotMounted(member: string): void {
    if (!import.meta.env.DEV || warned.has(member)) return;
    warned.add(member);
    console.warn(`[${label}] ${member} 在组件挂载前不可用，本次调用已被忽略。`);
  }

  function invoke(instance: TApi, member: string, args: never[]): unknown {
    const method = (instance as Record<string, unknown>)[member];
    if (typeof method !== 'function') {
      throw new TypeError(`[${label}] 组件实例上没有 ${member} 方法。`);
    }
    return (method as ApiMethod)(...args);
  }

  for (const member of definition.commands ?? []) {
    api[member] = (...args: never[]) => {
      const instance = getInstance();
      if (instance) {
        flushPending(instance);
        return invoke(instance, member, args);
      }

      // 挂载前只记录意图，调用方拿到的 Promise 随补发结果兑现。
      return new Promise((resolve, reject) => {
        pending.push((mounted) => {
          void Promise.resolve(invoke(mounted, member, args)).then(resolve, reject);
        });
      });
    };
  }

  for (const member of definition.methods ?? []) {
    api[member] = (...args: never[]) => {
      const instance = getInstance();
      if (instance) {
        flushPending(instance);
        return invoke(instance, member, args);
      }

      const fallback = definition.fallbacks?.[member];
      if (fallback) return fallback();

      warnNotMounted(member);
      return undefined;
    };
  }

  for (const member of definition.properties ?? []) {
    Object.defineProperty(api, member, {
      enumerable: true,
      get: () => {
        const instance = getInstance();
        if (instance) return (instance as Record<string, unknown>)[member];
        return definition.fallbacks?.[member]?.();
      },
    });
  }

  Object.assign(api, definition.constants ?? {});

  // 挂载后立刻补发，不依赖调用方再次访问 API；sync 刷新让补发早于组件自身的挂载副作用。
  watch(
    getInstance,
    (instance) => {
      if (instance) flushPending(instance);
    },
    { flush: 'sync' },
  );

  return api as TApi;
}
