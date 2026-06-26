import type { AxiosRequestConfig } from 'axios';

export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

export type RequestConfig = AxiosRequestConfig;
