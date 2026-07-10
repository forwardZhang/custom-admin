<template>
  <a-layout-header class="app-header">
    <Logo v-if="showLogo" class="header-logo" />

    <div class="header-main">
      <div class="header-left">
        <div
          v-if="showMenuButton || reserveMenuButtonSpace"
          class="header-action-slot"
          :class="{ 'is-placeholder': !showMenuButton }"
        >
          <a-tooltip v-if="showMenuButton" :title="collapsed ? '展开菜单' : '收起菜单'">
            <button class="header-action" type="button" @click="$emit('toggle-menu')">
              <MenuUnfoldOutlined v-if="collapsed" />
              <MenuFoldOutlined v-else />
            </button>
          </a-tooltip>
        </div>
        <a-tooltip title="刷新当前页">
          <button class="header-action" type="button" @click="$emit('refresh')">
            <ReloadOutlined />
          </button>
        </a-tooltip>
        <div class="header-navigation">
          <slot name="navigation">
            <Breadcrumb />
          </slot>
        </div>
      </div>

      <div class="header-right">
        <a-tooltip :title="isFullscreen ? '退出全屏' : '进入全屏'">
          <button class="header-action hide-on-mobile" type="button" @click="toggleFullscreen">
            <FullscreenExitOutlined v-if="isFullscreen" />
            <FullscreenOutlined v-else />
          </button>
        </a-tooltip>

        <a-tooltip title="布局设置">
          <button class="header-action" type="button" @click="settingsOpen = true">
            <SettingOutlined />
          </button>
        </a-tooltip>

        <a-dropdown placement="bottomRight">
          <button class="user-trigger" type="button">
            <a-avatar :size="32" class="user-avatar">
              {{ avatarText }}
            </a-avatar>
            <span class="user-name">{{ displayName }}</span>
            <DownOutlined class="user-arrow" />
          </button>
          <template #popupRender>
            <div class="user-popup">
              <div class="user-summary">
                <a-avatar :size="40" class="user-avatar">{{ avatarText }}</a-avatar>
                <div class="user-info">
                  <p>{{ displayName }}</p>
                  <p>{{ roleText }}</p>
                </div>
              </div>
              <button class="logout-button" type="button" @click="handleLogout">
                <LogoutOutlined />
                退出登录
              </button>
            </div>
          </template>
        </a-dropdown>
      </div>
    </div>

    <a-drawer v-model:open="settingsOpen" title="界面设置" :size="360">
      <LayoutSettings />
    </a-drawer>
  </a-layout-header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Modal } from 'antdv-next';
import { useFullscreen } from '@vueuse/core';
import {
  DownOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@antdv-next/icons';
import { useUserStore } from '@/store/modules/user';
import Logo from './logo.vue';
import Breadcrumb from './breadcrumb.vue';
import LayoutSettings from './layout-settings.vue';

withDefaults(
  defineProps<{
    collapsed?: boolean;
    showLogo?: boolean;
    showMenuButton?: boolean;
    reserveMenuButtonSpace?: boolean;
  }>(),
  {
    collapsed: false,
    showLogo: false,
    showMenuButton: true,
    reserveMenuButtonSpace: false,
  },
);

defineEmits<{
  'toggle-menu': [];
  refresh: [];
}>();

const userStore = useUserStore();
const settingsOpen = ref(false);
const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();

const displayName = computed(
  () => userStore.userInfo?.nickname || userStore.userInfo?.username || '管理员',
);
const avatarText = computed(() => displayName.value.slice(0, 1).toUpperCase());
const roleText = computed(() => userStore.roles.join('、') || '后台用户');

/**
 * 处理用户退出登录事件，带有弹窗二次确认以防止误触
 */
function handleLogout() {
  Modal.confirm({
    title: '退出登录',
    content: '您确定要退出当前账号吗？未保存的操作可能会丢失。',
    okText: '确定',
    cancelText: '取消',
    onOk() {
      userStore.logout(false);
    },
  });
}
</script>

<style scoped lang="scss">
.app-header {
  z-index: 10;
  display: flex;
  height: var(--ant-layout-header-height);
  padding: 0;
  border-bottom: 1px solid var(--ant-color-border-secondary);
  background: var(--ant-color-bg-container);
  box-shadow: 0 1px 4px rgb(16 24 40 / 3%);
  line-height: normal;
}

.header-logo {
  width: 220px;
  flex: 0 0 220px;
  border-right: 1px solid var(--ant-color-border-secondary);
}

.header-main {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
}

.header-left,
.header-right {
  display: flex;
  min-width: 0;
  align-items: center;
}

.header-left {
  height: var(--ant-layout-header-height);
  flex: 1;
  gap: 8px;
}

.header-navigation {
  display: flex;
  width: 0;
  height: var(--ant-layout-header-height);
  min-width: 0;
  flex: 1;
  align-items: center;
  overflow: hidden;
}

.header-navigation :deep(.layout-menu) {
  width: 100%;
  height: 100%;
  min-width: 0;
  flex: auto;
}

.header-right {
  flex: 0 0 auto;
  gap: 4px;
}

.header-action-slot {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;

  &.is-placeholder {
    visibility: hidden;
    pointer-events: none;
  }
}

.header-action {
  display: grid;
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  place-items: center;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--ant-color-text-secondary);
  font-size: 17px;
  cursor: pointer;
  transition: 0.2s ease;

  &:hover {
    background: var(--ant-color-fill-tertiary);
    color: var(--ant-color-primary);
  }
}

.user-trigger {
  display: flex;
  height: 42px;
  align-items: center;
  gap: 8px;
  margin-left: 4px;
  padding: 0 8px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--ant-color-text);
  font: inherit;
  cursor: pointer;

  &:hover {
    background: var(--ant-color-fill-tertiary);
  }
}

.user-avatar {
  flex: 0 0 auto;
  background: var(--ant-color-primary);
}

.user-name {
  max-width: 100px;
  overflow: hidden;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-arrow {
  color: var(--ant-color-text-quaternary);
  font-size: 10px;
}

.user-popup {
  width: 230px;
  padding: 8px;
  border: 1px solid var(--ant-color-border-secondary);
  border-radius: 10px;
  background: var(--ant-color-bg-elevated);
  box-shadow: 0 10px 30px rgb(16 24 40 / 12%);
}

.user-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-bottom: 1px solid var(--ant-color-border-secondary);

  .user-info {
    display: flex;
    flex-direction: column;
  }
}

.logout-button {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 9px;
  margin-top: 6px;
  padding: 9px 10px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--ant-color-error);
  font: inherit;
  cursor: pointer;

  &:hover {
    background: var(--ant-color-error-bg);
  }
}

@media (max-width: 959px) {
  .header-logo {
    display: none;
  }
}

@media (max-width: 640px) {
  .header-main {
    padding: 0 8px;
  }

  .hide-on-mobile,
  .user-name,
  .user-arrow {
    display: none;
  }
}
</style>
