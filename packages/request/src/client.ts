import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type {
  Abortable,
  ApiResponse,
  RequestConfig,
  RequestError,
  RequestInstanceConfig,
} from './types';

const DEFAULT_TIMEOUT = 60_000;
const DEFAULT_SUCCESS_CODE = 0;

/**
 * 请求实例：函数 + 方法集 + 底层 axios 实例
 *
 * - 作为函数调用：`request<T>(config)` 直接发起请求；
 * - `request.get/post/put/delete`：便捷方法，统一 `(url, data?, config?)` 签名；
 * - `request.instance`：底层 axios 实例，用于高级操作（全局取消、追加拦截器等）。
 *
 * 参数自适应：GET/DELETE 的 data 会合并到 query params；POST/PUT 的 data 作为请求体。
 */
export interface RequestInstance {
  <T = unknown>(config: RequestConfig): Promise<T>;
  /** GET：data 合并到 query params */
  get: <T = unknown>(
    url: string,
    data?: Record<string, unknown>,
    config?: RequestConfig,
  ) => Promise<T>;
  /** POST：data 作为请求体 */
  post: <T = unknown>(url: string, data?: unknown, config?: RequestConfig) => Promise<T>;
  /** PUT：data 作为请求体 */
  put: <T = unknown>(url: string, data?: unknown, config?: RequestConfig) => Promise<T>;
  /** DELETE：data 合并到 query params */
  delete: <T = unknown>(
    url: string,
    data?: Record<string, unknown>,
    config?: RequestConfig,
  ) => Promise<T>;
  /** 底层 axios 实例（用于全局取消、追加拦截器等高级场景） */
  instance: AxiosInstance;
}

/**
 * 创建请求实例
 *
 * 参考 soybean-admin 的 `@sa/axios` 工厂模式，适配当前项目：
 * 1. 多域名：每个 baseURL 创建一个实例；
 * 2. header 注入：通过 `onHeader` 外部自定义，请求层不耦合任何鉴权/存储细节；
 * 3. 业务解包：成功时直接返回 `res.data`，调用方无需判断 code；
 * 4. 取消请求：调用方通过 `createAbortable()` 拿 signal 传入 config.signal。
 *
 * @param options - 实例配置
 * @returns 请求实例
 */
export function createRequest(options: RequestInstanceConfig): RequestInstance {
  const {
    baseURL,
    timeout = DEFAULT_TIMEOUT,
    headers,
    onHeader,
    successCode = DEFAULT_SUCCESS_CODE,
    onError,
  } = options;

  const instance = axios.create({ baseURL, timeout, headers });

  // ── 请求拦截：外部自定义 header 注入（token / 鉴权 / 自定义字段统一在此处理）──
  instance.interceptors.request.use((config) => {
    if (onHeader) {
      config.headers = config.headers ?? {};
      onHeader(config.headers as Record<string, string>);
    }
    return config;
  });

  // ── 响应拦截：解包 ApiResponse → 直接返回 data；业务失败/网络错误 → reject RequestError ──
  // 返回 any：拦截器实际返回 body.data（非 AxiosResponse），需绕过 axios 类型约束
  instance.interceptors.response.use(
    (response): any => {
      const body = response.data as ApiResponse;

      // 业务成功：直接返回 data，调用方拿到的就是业务数据
      if (body.code === successCode) {
        return body.data;
      }

      // 业务失败：构造 RequestError 抛出，调用方 try/catch 即可
      const err: RequestError = {
        message: body.message || '请求失败',
        code: body.code,
        isBizError: true,
        response: body,
      };
      onError?.(err);
      return Promise.reject(err);
    },
    (error) => {
      const message = getErrorMessage({ error });

      // 请求被主动取消：返回友好提示
      if (axios.isCancel(error) || error?.name === 'CanceledError') {
        const err: RequestError = {
          message,
          isBizError: false,
        };
        return Promise.reject(err);
      }

      // 网络/超时/非 2xx 错误：统一封装
      const err: RequestError = {
        message,
        code: error?.response?.status,
        isBizError: false,
        response: error?.response?.data,
      };
      onError?.(err);
      return Promise.reject(err);
    },
  );

  // ── 请求函数（泛型 T = 业务数据类型）──
  // instance.request<未知响应体, 实际返回类型 T>：第二个泛型覆盖 axios 默认的 AxiosResponse
  const request = <T = unknown>(config: RequestConfig): Promise<T> => {
    return instance.request<unknown, T>(config);
  };

  // 便捷方法：统一 (url, data?, config?) 签名，内部自适应参数格式
  // GET / DELETE：data 合并到 params（query string）
  // POST / PUT：data 作为 body
  request.get = <T = unknown>(
    url: string,
    data?: Record<string, unknown>,
    config?: RequestConfig,
  ) => request<T>({ ...config, url, method: 'GET', params: { ...config?.params, ...data } });

  request.post = <T = unknown>(url: string, data?: unknown, config?: RequestConfig) =>
    request<T>({ ...config, url, method: 'POST', data });

  request.put = <T = unknown>(url: string, data?: unknown, config?: RequestConfig) =>
    request<T>({ ...config, url, method: 'PUT', data });

  request.delete = <T = unknown>(
    url: string,
    data?: Record<string, unknown>,
    config?: RequestConfig,
  ) => request<T>({ ...config, url, method: 'DELETE', params: { ...config?.params, ...data } });

  request.instance = instance;

  return request;
}

/**
 * 创建可取消请求句柄
 *
 * 基于 AbortController（axios 原生支持 config.signal）。
 * @example
 * ```ts
 * const { signal, cancel } = createAbortable();
 * getData({ signal });        // 传入请求配置
 * // 需要时：
 * cancel();                    // 请求会被中断，reject RequestError(message='请求已取消')
 * ```
 * @returns `{ signal, cancel }`
 */
export function createAbortable(): Abortable {
  const controller = new AbortController();
  return {
    signal: controller.signal,
    cancel: (reason) => controller.abort(reason),
  };
}

/**
 * 根据网络请求错误对象获取友好的中文错误提示信息
 *
 * @param params 参数对象，便于后续扩展
 * @param params.error Axios 抛出的错误对象
 * @returns 友好的中文错误提示文字
 */
function getErrorMessage(params: { error: any }): string {
  const { error } = params;
  if (!error) return '未知错误';

  // 1. 请求被主动取消
  if (axios.isCancel(error) || error?.name === 'CanceledError') {
    return '请求已取消';
  }

  // 2. 超时处理
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return '请求超时，请稍后重试';
  }

  // 3. 网络异常处理
  if (
    error.message === 'Network Error' ||
    (typeof window !== 'undefined' && !window.navigator.onLine)
  ) {
    return '网络连接异常，请检查网络设置';
  }

  // 4. 服务器响应错误处理（有状态码）
  if (error.response) {
    const status = error.response.status;
    const dataMessage = error.response.data?.message;

    // 优先使用后端返回的具体业务错误消息
    if (dataMessage) return dataMessage;

    switch (status) {
      case 400:
        return '请求参数错误';
      case 401:
        return '未授权，请重新登录';
      case 403:
        return '拒绝访问';
      case 404:
        return '请求地址不存在';
      case 405:
        return '请求方法不允许';
      case 408:
        return '请求超时';
      case 500:
        return '服务器内部错误';
      case 502:
        return '网关错误';
      case 503:
        return '服务不可用';
      case 504:
        return '网关超时';
      default:
        return `服务器异常 (HTTP ${status})`;
    }
  }

  // 5. 兜底返回原生错误消息
  return error.message || '网络异常';
}
