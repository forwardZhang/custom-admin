import type { AxiosRequestConfig } from 'axios';

/**
 * 后端统一响应结构
 *
 * 后端约定所有接口返回 `{ code, data, message }`：
 * - `code === successCode`（默认 0）视为业务成功，请求层会自动解包 `data` 返回给调用方；
 * - 否则视为业务失败，请求层抛出 `RequestError`，调用方只需 try/catch 即可。
 */
export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}

/**
 * 创建请求实例的配置
 *
 * 通过工厂模式支持「不同域名 / 不同 header 注入 / 不同成功码」的多实例场景。
 */
export interface RequestInstanceConfig {
  /** 基础域名，不同服务可创建不同实例 */
  baseURL: string;
  /** 超时时间（ms），默认 10000 */
  timeout?: number;
  /** 默认请求头 */
  headers?: Record<string, string>;
  /**
   * 外部自定义请求头注入
   *
   * 在请求拦截器中调用，传入当前请求的 headers 对象（可读可写）。
   * 外部自行决定如何注入 token / 鉴权头 / 自定义字段，请求层不再耦合任何存储或鉴权细节。
   *
   * @example
   * ```ts
   * // 注入 Bearer token
   * onHeader: (headers) => { headers.Authorization = `Bearer ${getToken()}`; }
   * // 或写入自定义 header
   * onHeader: (headers) => { headers['X-Tenant'] = 'demo'; }
   * ```
   * @param headers - 当前请求的 headers（已含默认 headers），直接原地修改即可
   */
  onHeader?: (headers: Record<string, string>) => void;
  /** 业务成功 code，默认 0（与 mock 约定一致） */
  successCode?: number;
  /** 请求失败（网络错误 / 非 2xx / 业务失败）的统一回调，常用于全局 message 提示 */
  onError?: (error: RequestError) => void;
}

/** 请求配置（在 axios 配置基础上扩展，signal 已由 axios 内置支持） */
export type RequestConfig = AxiosRequestConfig;

/**
 * 请求错误
 *
 * 统一封装网络错误、HTTP 错误、业务错误三类，调用方无需区分 axios 原始 error。
 */
export interface RequestError {
  /** 错误信息（优先取后端 message，其次 axios message，兜底「网络异常」） */
  message: string;
  /** 错误码：业务失败时为后端 code，HTTP 错误时为 HTTP 状态码 */
  code?: number;
  /** 是否为业务失败（code !== successCode），用于区分网络层与业务层错误 */
  isBizError: boolean;
  /** 原始后端响应体（如有） */
  response?: ApiResponse;
}

/** 取消请求句柄（基于 AbortController） */
export interface Abortable {
  /** 传入 RequestConfig.signal 用于关联请求 */
  signal: AbortSignal;
  /** 取消请求；取消后对应请求会 reject 一个 RequestError(message='请求已取消') */
  cancel: (reason?: string) => void;
}
