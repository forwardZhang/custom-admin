<template>
  <a-config-provider :locale="zh_CN" :theme="theme">
    <a-app>
      <RouterView />
      <a-button type="primary" @click="updateThemeColor">随机更换颜色</a-button>
      <div class="h-48 bg-primary p-4 text-white">test -dev</div>
      <a-range-picker v-model:value="date" show-time />
    </a-app>
  </a-config-provider>
</template>

<script setup lang="ts">
import zh_CN from 'antdv-next/locale/zh_CN';
import { computed, ref, shallowRef } from 'vue';

import { useAppStore } from './store/modules/app';

const value = ref('');
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
