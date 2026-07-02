<template>
  <a-config-provider :locale="zh_CN" :theme="theme">
    <a-app class="h-full relative">
      <RouterView />

      <div
        class="p-6 flex flex-col gap-4 max-w-md mx-auto mt-10 bg-white rounded-xl shadow-md border border-gray-100"
      >
        <h3 class="text-lg font-bold text-gray-800">ADP 开发预览面板</h3>
        <p class="text-sm text-gray-500">
          点击按钮测试主题色切换，Loading 样式会自动适配新主题色。
        </p>
        <a-button type="primary" size="large" @click="updateThemeColor">随机更换颜色</a-button>
        <a-range-picker v-model:value="date" show-time class="w-full" />
      </div>
    </a-app>
  </a-config-provider>
</template>

<script setup lang="ts">
import zh_CN from 'antdv-next/locale/zh_CN';
import { computed, shallowRef } from 'vue';

import { useAppStore } from './store';

const date = shallowRef();

const appStore = useAppStore();
const theme = computed(() => {
  const preference = appStore.preference;
  const theme = {
    token: {
      colorPrimary: preference.theme.primaryColor,
    },
  };
  return theme;
});

function updateThemeColor() {
  const colors = ['#1890ff', '#28a745', '#dc3545', '#ffc107', '#6f42c1'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  appStore.updatePreference({ theme: { primaryColor: randomColor } });
}
</script>

<style lang="scss"></style>
