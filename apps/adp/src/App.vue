<template>
  <a-config-provider :locale="zh_CN" :theme="theme" component-size="middle">
    <a-app class="h-full relative">
      <RouterView />
    </a-app>
  </a-config-provider>
</template>

<script setup lang="ts">
import zh_CN from 'antdv-next/locale/zh_CN';
import { computed, shallowRef } from 'vue';

import { useAppStore } from './store';

const appStore = useAppStore();
const theme = computed(() => {
  const preference = appStore.preference;
  const theme = {
    token: {
      colorPrimary: preference.theme.colorPrimary,
    },
  };
  return theme;
});
</script>

<style lang="scss"></style>
