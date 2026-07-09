<template>
  <div class="app-layout">
    <aside class="app-sider">
      <div class="app-logo">ADP</div>

      <nav class="app-menu">
        <div v-for="menu in visibleMenus" :key="menu.name" class="menu-group">
          <button
            class="menu-item"
            :class="{ 'is-active': isMenuActive(menu), 'is-group': hasVisibleChildren(menu) }"
            type="button"
            @click="handleMenuClick(menu)"
          >
            <span class="menu-icon">{{ menu.icon?.slice(0, 1) ?? '#' }}</span>
            <span class="menu-title">{{ menu.title }}</span>
          </button>

          <div v-if="hasVisibleChildren(menu)" class="sub-menu">
            <button
              v-for="child in getVisibleChildren(menu)"
              :key="child.name"
              class="menu-item sub-menu-item"
              :class="{ 'is-active': isMenuActive(child) }"
              type="button"
              @click="handleMenuClick(child)"
            >
              <span class="menu-title">{{ child.title }}</span>
            </button>
          </div>
        </div>
      </nav>
    </aside>

    <main class="app-main">
      <header class="app-header">
        <span>{{ currentTitle }}</span>
      </header>

      <section class="app-content">
        <RouterView />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { MenuItem } from '@/api/auth';
import { useUserStore } from '@/store/modules/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const visibleMenus = computed(() => userStore.menus.filter((menu) => !menu.hideInMenu));
const activeRouteName = computed(() => String(route.name ?? ''));
const currentTitle = computed(() => String(route.meta.title ?? ''));

function getVisibleChildren(menu: MenuItem) {
  return menu.children?.filter((child) => !child.hideInMenu) ?? [];
}

function hasVisibleChildren(menu: MenuItem) {
  return getVisibleChildren(menu).length > 0;
}

function isMenuActive(menu: MenuItem): boolean {
  return menu.name === activeRouteName.value || getVisibleChildren(menu).some(isMenuActive);
}

function handleMenuClick(menu: MenuItem) {
  if (hasVisibleChildren(menu)) {
    return;
  }

  router.push({ name: menu.name });
}
</script>

<style scoped lang="scss">
.app-layout {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #f5f7fb;
}

.app-sider {
  display: flex;
  flex: 0 0 232px;
  flex-direction: column;
  min-width: 232px;
  border-right: 1px solid #e5e7eb;
  background: #ffffff;
}

.app-logo {
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 20px;
  border-bottom: 1px solid #eef0f4;
  color: #111827;
  font-size: 18px;
  font-weight: 700;
}

.app-menu {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
}

.menu-group {
  margin-bottom: 4px;
}

.menu-item {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 38px;
  padding: 0 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #374151;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.menu-item:hover {
  background: #f3f6fb;
  color: #1677ff;
}

.menu-item.is-active {
  background: #eaf2ff;
  color: #1677ff;
  font-weight: 600;
}

.menu-item.is-group {
  cursor: default;
}

.menu-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin-right: 8px;
  border-radius: 6px;
  background: #eef2f7;
  color: #64748b;
  font-size: 12px;
}

.menu-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sub-menu {
  margin: 2px 0 6px 30px;
  padding-left: 8px;
  border-left: 1px solid #e5e7eb;
}

.sub-menu-item {
  min-height: 34px;
  padding-left: 10px;
  font-size: 13px;
}

.app-main {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
}

.app-header {
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #ffffff;
  color: #111827;
  font-weight: 600;
}

.app-content {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 16px;
}
</style>
