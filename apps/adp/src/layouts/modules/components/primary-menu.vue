<template>
  <div class="primary-menu">
    <button
      v-for="menu in menuList"
      :key="menu.name"
      class="primary-menu-item"
      :class="{ 'is-active': menu.name === activeName }"
      type="button"
      :title="menu.title"
      @click="$emit('select', menu)"
    >
      <component :is="getMenuIcon(menu.icon)" v-if="getMenuIcon(menu.icon)" class="menu-icon" />
      <span v-else class="menu-icon menu-icon-placeholder">{{ menu.title.slice(0, 1) }}</span>
      <span class="menu-label">{{ menu.title }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { MenuItem } from '@/api/auth';
import { getMenuIcon } from './menu-utils';

defineProps<{
  menuList: MenuItem[];
  activeName?: string;
}>();

defineEmits<{
  select: [menu: MenuItem];
}>();
</script>

<style scoped lang="scss">
.primary-menu {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 8px;
}

.primary-menu-item {
  position: relative;
  display: flex;
  min-height: 58px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 7px 4px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--ant-color-text-secondary);
  font: inherit;
  cursor: pointer;
  transition: 0.2s ease;

  &:hover {
    background: var(--ant-color-primary-bg);
    color: var(--ant-color-primary);
  }

  &.is-active {
    background: var(--ant-color-primary-bg);
    color: var(--ant-color-primary);
    font-weight: 600;
  }

  &.is-active::before {
    position: absolute;
    top: 13px;
    bottom: 13px;
    left: -8px;
    width: 3px;
    border-radius: 0 3px 3px 0;
    background: var(--ant-color-primary);
    content: '';
  }
}

.menu-icon {
  font-size: 20px;
}

.menu-icon-placeholder {
  display: grid;
  width: 22px;
  height: 22px;
  place-items: center;
  border-radius: 6px;
  background: var(--ant-color-fill-secondary);
  font-size: 12px;
}

.menu-label {
  width: 100%;
  overflow: hidden;
  font-size: 12px;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
