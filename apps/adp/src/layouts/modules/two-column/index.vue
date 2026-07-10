<template>
  <a-layout class="two-column-layout">
    <a-layout class="layout-body">
      <a-layout-sider :width="84" class="primary-sider">
        <Logo collapsed :avatar-size="34" />
        <div class="sider-scroll primary-scroll">
          <PrimaryMenu
            :menu-list="visibleMenus"
            :active-name="activePrimaryMenu?.name"
            @select="selectPrimaryMenu"
          />
        </div>
      </a-layout-sider>

      <a-layout-sider
        v-if="showMenuSider"
        :width="196"
        :collapsed-width="0"
        :collapsed="appStore.collapsed"
        class="menu-sider"
      >
        <div class="secondary-title">
          <span>{{ activePrimaryMenu?.title }}</span>
        </div>
        <div class="sider-scroll">
          <Menu :menu-list="siderMenus" />
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
  </a-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useLayout } from '../composables/use-layout';
import AppHeader from '../components/app-header.vue';
import Logo from '../components/logo.vue';
import Menu from '../components/menu.vue';
import PageContent from '../components/page-content.vue';
import PrimaryMenu from '../components/primary-menu.vue';
import Breadcrumb from '../components/breadcrumb.vue';

const {
  appStore,
  refreshKey,
  visibleMenus,
  activePrimaryMenu,
  siderMenus,
  toggleMenu,
  refreshPage,
  selectPrimaryMenu,
} = useLayout();

const showMenuSider = computed(() => siderMenus.value.length > 0);
</script>

<style scoped lang="scss">
.two-column-layout {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: var(--ant-color-bg-layout);

  @media (max-width: 640px) {
    height: 100dvh;
  }
}

.layout-body,
.layout-main {
  min-width: 0;
  min-height: 0;
}

.layout-body {
  flex: 1;
}

.layout-main {
  height: 100%;
}

.primary-sider,
.menu-sider {
  z-index: 8;
  overflow: hidden;
  border-right: 1px solid var(--ant-color-border-secondary);
  background: var(--ant-color-bg-container) !important;
}

.primary-sider {
  background: #fbfcfe !important;
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

.primary-scroll {
  height: calc(100% - var(--ant-layout-header-height));
  padding: 0;
}

.secondary-title {
  display: flex;
  height: var(--ant-layout-header-height);
  align-items: center;
  padding: 0 18px;
  overflow: hidden;
  border-bottom: 1px solid var(--ant-color-border-secondary);
  color: var(--ant-color-text);
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
}

.secondary-title + .sider-scroll {
  height: calc(100% - var(--ant-layout-header-height));
}
</style>
