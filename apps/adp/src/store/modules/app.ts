import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import type { Preference, DeepPartial } from '@/constants/preference';
import {
  applyPreferenceToHtml,
  setDefaultPreference,
  getDefaultPreference,
} from '@/utils/preference';
import { merge } from 'es-toolkit';

export const useAppStore = defineStore('app', () => {
  const collapsed = ref(false);

  /** 偏好配置，优先从本地存储加载 */

  const preference = ref<Preference>(getDefaultPreference());

  // 监听偏好配置变化，自动同步到本地存储与 HTML 标签上
  watch(
    preference,
    (newVal) => {
      setDefaultPreference(newVal);
      applyPreferenceToHtml({ preference: newVal });
    },
    { deep: true },
  );

  function toggleCollapsed() {
    collapsed.value = !collapsed.value;
  }

  /**
   * 更新偏好配置
   * @param {DeepPartial<Preference>} params - 偏好配置局部参数对象
   */
  function updatePreference(params: DeepPartial<Preference>) {
    merge(preference.value, params);
  }

  return {
    collapsed,
    preference,
    toggleCollapsed,
    updatePreference,
  };
});
