import axios from 'axios';

import { setupRequestInterceptors, setupResponseInterceptors } from './interceptors';
import type { ApiResponse, RequestConfig } from './types';

const requestClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10_000,
});

setupRequestInterceptors(requestClient);
setupResponseInterceptors(requestClient);

export async function request<T>(config: RequestConfig): Promise<ApiResponse<T>> {
  return requestClient.request<unknown, ApiResponse<T>>(config);
}

export { requestClient };
