<template>
  <a-layout
    class="layout-shell"
    :class="{
      'is-top-header': headerAtTop,
      'is-dual': isDual,
    }"
  >
    <AppHeader
      v-if="headerAtTop"
      :show-logo="isTopOnly"
      :show-menu-button="isVerticalTop && showMenuSider"
      :reserve-menu-button-space="isVerticalTop"
      :collapsed="appStore.collapsed"
      @toggle-menu="toggleMenu"
      @refresh="refreshPage"
    >
      <template #navigation>
        <Menu
          v-if="isVerticalTop"
          v-model:selected-keys="selectedPrimaryKeys"
          mode="horizontal"
          :menu-list="primaryOnlyMenus"
          :auto-route="false"
          @click="handlePrimaryMenuClick"
        />
        <Menu v-else-if="isTopOnly" mode="horizontal" :menu-list="visibleMenus" />
      </template>
    </AppHeader>

    <a-layout class="layout-body">
      <template v-if="!isMobile">
        <a-layout-sider v-if="isDual" :width="84" class="primary-sider">
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
          :width="isDual ? 196 : 220"
          :collapsed-width="isDual || isVerticalTop ? 0 : 72"
          :collapsed="appStore.collapsed"
          class="menu-sider"
        >
          <Logo
            v-if="effectiveMode === 'vertical' || isVerticalTop"
            :collapsed="appStore.collapsed"
          />
          <div v-if="isDual" class="secondary-title">
            <span>{{ activePrimaryMenu?.title }}</span>
          </div>
          <div class="sider-scroll">
            <Menu
              :menu-list="siderMenus"
              :collapsed="effectiveMode === 'vertical' && appStore.collapsed"
            />
          </div>
        </a-layout-sider>
      </template>

      <a-layout class="layout-main">
        <AppHeader
          v-if="!headerAtTop"
          :show-menu-button="!isMobile"
          :collapsed="appStore.collapsed"
          @toggle-menu="toggleMenu"
          @refresh="refreshPage"
        >
          <template #navigation>
            <Menu
              v-if="isVerticalTop"
              v-model:selected-keys="selectedPrimaryKeys"
              mode="horizontal"
              :menu-list="primaryOnlyMenus"
              :auto-route="false"
              @click="handlePrimaryMenuClick"
            />
          </template>
        </AppHeader>
        <PageContent :refresh-key="refreshKey" />
      </a-layout>
    </a-layout>

    <button
      v-if="isMobile"
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
import { computed, ref, watch } from 'vue';
import { useMediaQuery } from '@vueuse/core';
import { CloseOutlined, MenuOutlined } from '@antdv-next/icons';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import type { MenuItem } from '@/api/auth';
import type { LayoutMode } from '@/constants/preference';
import { useAppStore } from '@/store/modules/app';
import { useUserStore } from '@/store/modules/user';
import AppHeader from './app-header.vue';
import Logo from './logo.vue';
import Menu from './menu.vue';
import PageContent from './page-content.vue';
import PrimaryMenu from './primary-menu.vue';
import { filterVisibleMenus, findFirstLeaf, findMenuTrail } from './menu-utils';

const props = defineProps<{
  mode: LayoutMode;
}>();

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const { menus } = storeToRefs(useUserStore());

const isMobile = useMediaQuery('(max-width: 959px)');
const mobileMenuOpen = ref(false);
const refreshKey = ref(0);
const activePrimaryName = ref('');

/** 移动端固定使用垂直布局，忽略桌面端保存的布局偏好。 */
const effectiveMode = computed<LayoutMode>(() => (isMobile.value ? 'vertical' : props.mode));
const headerAtTop = computed(() => effectiveMode.value === 'top');
const isVerticalTop = computed(() => effectiveMode.value === 'vertical-top');
const isTopOnly = computed(() => effectiveMode.value === 'top');
const isDual = computed(() => effectiveMode.value === 'two-column');
const visibleMenus = computed(() => filterVisibleMenus(menus.value));

/** 混合布局下顶部仅展示一级菜单，需将其子孙菜单屏蔽。 */
const primaryOnlyMenus = computed(() => {
  return visibleMenus.value.map(({ children, ...rest }) => rest);
});

const activePrimaryMenu = computed(() => {
  return (
    visibleMenus.value.find((menu) => menu.name === activePrimaryName.value) ??
    visibleMenus.value[0]
  );
});

/** 混合布局下顶部仅展示一级菜单，高亮状态受路由驱动计算得出。 */
const selectedPrimaryKeys = computed({
  get: () => (activePrimaryMenu.value?.name ? [activePrimaryMenu.value.name] : []),
  set: () => {},
});

const siderMenus = computed(() => {
  if (effectiveMode.value === 'vertical') return visibleMenus.value;
  if (isVerticalTop.value || isDual.value) return activePrimaryMenu.value?.children ?? [];
  return [];
});

const showMenuSider = computed(() => {
  if (isTopOnly.value) return false;
  if (effectiveMode.value === 'vertical') return true;
  return siderMenus.value.length > 0;
});

function syncActivePrimaryMenu() {
  const targetName = String(route.meta.activeMenu ?? route.name ?? '');
  const trail = findMenuTrail(visibleMenus.value, targetName);

  if (trail[0]) {
    activePrimaryName.value = trail[0].name;
  } else if (!visibleMenus.value.some((menu) => menu.name === activePrimaryName.value)) {
    activePrimaryName.value = visibleMenus.value[0]?.name ?? '';
  }
}

function selectPrimaryMenu(menu: MenuItem) {
  activePrimaryName.value = menu.name;
  void router.push({ name: findFirstLeaf(menu).name });
}

/**
 * 处理顶部一级菜单项点击事件。
 * @param params 点击参数对象，包含被点击菜单项的 key
 */
function handlePrimaryMenuClick(params: { key: string | number }) {
  const menu = visibleMenus.value.find((m) => m.name === String(params.key));
  if (menu) {
    selectPrimaryMenu(menu);
  }
}

function toggleMenu() {
  appStore.toggleCollapsed();
}

function refreshPage() {
  refreshKey.value += 1;
}

watch([() => route.name, () => route.meta.activeMenu, visibleMenus], syncActivePrimaryMenu, {
  immediate: true,
});

watch(
  () => route.fullPath,
  () => {
    mobileMenuOpen.value = false;
  },
);

watch(isMobile, () => {
  mobileMenuOpen.value = false;
});
</script>

<style scoped lang="scss">
.layout-shell {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: var(--ant-color-bg-layout);
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

@media (max-width: 640px) {
  .layout-shell {
    height: 100dvh;
  }
}
</style>

<style lang="scss">
.layout-mobile-drawer {
  .ant-drawer-body {
    overflow: hidden;
  }
}
</style>
