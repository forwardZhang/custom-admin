<template>
  <a-layout class="mobile-layout">
    <a-layout class="layout-main">
      <AppHeader
        :show-menu-button="false"
        :collapsed="appStore.collapsed"
        @toggle-menu="toggleMenu"
        @refresh="refreshPage"
      >
        <template #navigation>
          <Breadcrumb class="mobile-breadcrumb" />
        </template>
      </AppHeader>

      <PageContent :refresh-key="refreshKey" />
    </a-layout>

    <button
      class="mobile-menu-fab"
      :class="{ 'is-open': mobileMenuOpen }"
      type="button"
      :aria-label="mobileMenuOpen ? '关闭菜单' : '展开菜单'"
      @click="mobileMenuOpen = !mobileMenuOpen"
    >
      <CloseOutlined v-if="mobileMenuOpen" />
      <MenuOutlined v-else />
    </button>

    <a-drawer
      v-model:open="mobileMenuOpen"
      placement="left"
      :size="280"
      :closable="false"
      root-class="layout-mobile-drawer"
      :styles="{ body: { padding: 0 } }"
    >
      <Logo />
      <div class="mobile-menu-scroll">
        <Menu :menu-list="visibleMenus" />
      </div>
    </a-drawer>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { CloseOutlined, MenuOutlined } from '@antdv-next/icons';
import { useLayout } from '../composables/use-layout';
import AppHeader from './app-header.vue';
import Breadcrumb from './breadcrumb.vue';
import Logo from './logo.vue';
import Menu from './menu.vue';
import PageContent from './page-content.vue';

const { appStore, refreshKey, visibleMenus, toggleMenu, refreshPage } = useLayout();
const route = useRoute();
const mobileMenuOpen = ref(false);

watch(
  () => route.fullPath,
  () => {
    mobileMenuOpen.value = false;
  },
);
</script>

<style scoped lang="scss">
.mobile-layout {
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

.mobile-breadcrumb {
  flex-shrink: 0;
  background: var(--ant-color-bg-container);
}

.mobile-menu-fab {
  position: fixed;
  bottom: 22px;
  left: 16px;
  z-index: 1101;
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: var(--ant-color-primary);
  box-shadow: 0 8px 24px rgb(22 119 255 / 35%);
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  transition:
    left 0.28s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:active {
    transform: scale(0.94);
  }

  &.is-open {
    left: 216px;
    box-shadow: 0 6px 18px rgb(16 24 40 / 25%);
  }
}

.mobile-menu-scroll {
  height: calc(100dvh - var(--ant-layout-header-height));
  overflow-y: auto;
  padding: 8px 0 82px;
}
</style>

<style lang="scss">
.layout-mobile-drawer {
  .ant-drawer-body {
    overflow: hidden;
  }
}
</style>
