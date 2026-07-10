<template>
  <a-layout class="vertical-top-layout">
    <a-layout-sider
      v-if="showMenuSider"
      :width="220"
      :collapsed-width="0"
      :collapsed="appStore.collapsed"
      class="menu-sider"
    >
      <Logo :collapsed="appStore.collapsed" />
      <div class="sider-scroll">
        <Menu :menu-list="siderMenus" />
      </div>
    </a-layout-sider>

    <a-layout class="layout-right">
      <AppHeader
        :show-logo="false"
        :show-menu-button="showMenuSider"
        :reserve-menu-button-space="true"
        :collapsed="appStore.collapsed"
        @toggle-menu="toggleMenu"
        @refresh="refreshPage"
      >
        <template #navigation>
          <Menu
            v-model:selected-keys="selectedPrimaryKeys"
            mode="horizontal"
            :menu-list="primaryOnlyMenus"
            :auto-route="false"
            @click="handlePrimaryMenuClick"
          />
        </template>
      </AppHeader>

      <a-layout class="layout-main">
        <PageContent :refresh-key="refreshKey" />
      </a-layout>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useLayout } from '../composables/use-layout';
import AppHeader from '../components/app-header.vue';
import Logo from '../components/logo.vue';
import Menu from '../components/menu.vue';
import PageContent from '../components/page-content.vue';

const {
  appStore,
  refreshKey,
  primaryOnlyMenus,
  selectedPrimaryKeys,
  siderMenus,
  toggleMenu,
  refreshPage,
  handlePrimaryMenuClick,
} = useLayout();

const showMenuSider = computed(() => siderMenus.value.length > 0);
</script>

<style scoped lang="scss">
.vertical-top-layout {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: var(--ant-color-bg-layout);

  @media (max-width: 640px) {
    height: 100dvh;
  }
}

.menu-sider {
  z-index: 8;
  overflow: hidden;
  border-right: 1px solid var(--ant-color-border-secondary);
  background: var(--ant-color-bg-container) !important;
}

.layout-right,
.layout-main {
  min-width: 0;
  min-height: 0;
}

.layout-right {
  flex: 1;
}

.layout-main {
  height: 100%;
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
