import { storage } from '@package/shared';
import { defaultPreference, APP_PREFERENCE_KEY } from '@/constants/preference';
import type { Preference } from '@/constants/preference';

/**
 * 将偏好配置应用到 HTML 元素上（声明 CSS 变量与 HTML 属性）
 * @param {Object} params - 参数对象
 * @param {Preference} params.preference - 偏好配置对象
 */
export function applyPreferenceToHtml(params: { preference: Preference }) {
  const { preference } = params;
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (root) {
    root.style.setProperty('--primary-color', preference.theme.primaryColor);
    root.setAttribute('layout-mode', preference.layout.mode);
  }
}

/**
 * 获取默认偏好配置
 * @returns {Preference} 偏好配置对象
 */
export function getDefaultPreference() {
  const preference = storage.get<Preference>(APP_PREFERENCE_KEY, defaultPreference);
  return preference;
}

/**
 * 设置默认偏好配置
 * @param {Preference} preference - 偏好配置对象
 */
export function setDefaultPreference(preference: Preference) {
  storage.set(APP_PREFERENCE_KEY, preference);
}

/**
 * 初始化偏好配置，从本地存储中读取配置并应用到 HTML 标签上
 */
export function initPreference() {
  const preference = getDefaultPreference();
  applyPreferenceToHtml({ preference });
}
