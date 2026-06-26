import type { AxiosInstance } from 'axios';
import { APP_TOKEN_KEY, storage } from '@package/shared';

export function setupRequestInterceptors(instance: AxiosInstance): void {
  instance.interceptors.request.use((config) => {
    const token = storage.get(APP_TOKEN_KEY, '');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });
}

export function setupResponseInterceptors(instance: AxiosInstance): void {
  instance.interceptors.response.use((response) => response.data);
}
