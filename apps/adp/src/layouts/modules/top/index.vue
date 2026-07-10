<template>
  <a-layout class="top-layout">
    <AppHeader
      show-logo
      :show-menu-button="false"
      :collapsed="appStore.collapsed"
      @toggle-menu="toggleMenu"
      @refresh="refreshPage"
    >
      <template #navigation>
        <Menu mode="horizontal" :menu-list="visibleMenus" />
      </template>
    </AppHeader>
    <PageContent :refresh-key="refreshKey" />
  </a-layout>
</template>

<script setup lang="ts">
import { useLayout } from '../composables/use-layout';
import AppHeader from '../components/app-header.vue';
import Menu from '../components/menu.vue';
import PageContent from '../components/page-content.vue';

const { appStore, refreshKey, visibleMenus, toggleMenu, refreshPage } = useLayout();
</script>

<style scoped lang="scss">
.top-layout {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: var(--ant-color-bg-layout);

  @media (max-width: 640px) {
    height: 100dvh;
  }
}
</style>
