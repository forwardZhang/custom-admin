<template>
  <a-layout class="vertical-layout">
    <a-layout-sider
      :width="220"
      :collapsed-width="72"
      :collapsed="appStore.collapsed"
      class="menu-sider"
    >
      <Logo :collapsed="appStore.collapsed" />
      <div class="sider-scroll">
        <Menu :menu-list="visibleMenus" :collapsed="appStore.collapsed" />
      </div>
    </a-layout-sider>

    <a-layout class="layout-main">
      <AppHeader
        :show-menu-button="true"
        :collapsed="appStore.collapsed"
        @toggle-menu="toggleMenu"
        @refresh="refreshPage"
      >
        <template #navigation>
          <Breadcrumb />
        </template>
      </AppHeader>
      <PageContent :refresh-key="refreshKey" />
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { useLayout } from '../composables/use-layout';
import AppHeader from '../components/app-header.vue';
import Logo from '../components/logo.vue';
import Menu from '../components/menu.vue';
import Breadcrumb from '../components/breadcrumb.vue';
import PageContent from '../components/page-content.vue';

const { appStore, refreshKey, visibleMenus, toggleMenu, refreshPage } = useLayout();
</script>

<style scoped lang="scss">
.vertical-layout {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: var(--ant-color-bg-layout);

  @media (max-width: 640px) {
    height: 100dvh;
  }
}

.layout-main {
  min-width: 0;
  min-height: 0;
  height: 100%;
}

.menu-sider {
  z-index: 8;
  overflow: hidden;
  border-right: 1px solid var(--ant-color-border-secondary);
  background: var(--ant-color-bg-container) !important;
}

.sider-scroll {
  height: calc(100% - var(--ant-layout-header-height));
  overflow-x: hidden;
  overflow-y: auto;
  padding: 8px 0 12px;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;

  &:hover {
    scrollbar-color: #cfd6df transparent;
  }
}
</style>
