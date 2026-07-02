import { createRequest } from '@package/request';
import { storage } from '@package/shared';
import { APP_TOKEN_KEY } from '@/constants';

/**
 * 默认请求实例（adp 应用专用）
 *
 * 基于 `VITE_API_BASE_URL` 创建，token 通过 `onHeader` 注入 Bearer 头。
 * 请求层已自动解包 ApiResponse.data，业务失败/网络错误统一 reject RequestError。
 *
 * 多域名场景：在本文件再 `createRequest` 一个实例导出即可。
 */
export const request = createRequest({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  onHeader: (headers) => {
    const token = storage.get(APP_TOKEN_KEY, '');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  },
});
