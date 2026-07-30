/** 命令式 API 的方法签名上界；参数用 never[] 以接受任意具体方法。 */
type ApiMethod = (...args: never[]) => unknown;

export type ApiMethods<TApi extends object> = Partial<Record<keyof TApi, ApiMethod>>;

export type ApiGetters<TApi extends object> = Partial<{
  [K in keyof TApi]: () => TApi[K];
}>;

/**
 * 生成对外暴露的命令式 API。
 * 方法作为自身属性写入，引用在整个生命周期内稳定，可解构、可枚举、devtools 可见；
 * 属性一律用 getter 直读响应式源，保证在 computed / watch 中仍然是响应式的。
 */
export function createApiObject<TApi extends object>(
  methods: ApiMethods<TApi>,
  getters?: ApiGetters<TApi>,
): TApi {
  const api: Record<string, unknown> = {};

  for (const [name, method] of Object.entries(methods)) {
    if (typeof method === 'function') api[name] = method;
  }

  for (const [name, getter] of Object.entries(getters ?? {})) {
    if (typeof getter !== 'function') continue;
    Object.defineProperty(api, name, { enumerable: true, get: getter as () => unknown });
  }

  return api as TApi;
}

/**
 * 按名单从 source 上取方法并绑定 this，得到一组引用稳定的方法。
 * source 可以是 State 实例，也可以是另一个已生成的 API 对象（用于委托组合）。
 */
export function bindApiMethods<TApi extends object, TSource extends object>(
  source: TSource,
  names: readonly (keyof TApi & keyof TSource)[],
): ApiMethods<TApi> {
  const methods: ApiMethods<TApi> = {};

  for (const name of names) {
    const method = source[name];
    if (typeof method !== 'function') continue;
    methods[name] = (method as ApiMethod).bind(source) as ApiMethod;
  }

  return methods;
}
