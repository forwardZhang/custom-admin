import { storage } from '@package/shared';
import { defaultPreference, APP_PREFERENCE_KEY } from '@/constants/preference';
import type { Preference } from '@/constants/preference';
import { cloneDeep, merge } from 'lodash-es';

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
    root.style.setProperty('--color-primary', preference.theme.colorPrimary);
    root.setAttribute('layout-mode', preference.layout.mode);
  }
}

/**
 * 获取默认偏好配置
 * @returns {Preference} 偏好配置对象
 */
export function getDefaultPreference() {
  const cloneDefaultPreference = cloneDeep(defaultPreference);
  const preference = storage.get<Preference>(APP_PREFERENCE_KEY, cloneDefaultPreference);
  // 以默认值为基底，用户存储的值覆盖其上，既补全新增字段又保留用户修改
  return merge(cloneDefaultPreference, preference);
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
  return preference;
}
