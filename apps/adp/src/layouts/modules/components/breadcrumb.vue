<template>
  <nav class="layout-breadcrumb" aria-label="面包屑">
    <template v-for="(item, index) in menuTrail" :key="item.name">
      <button
        class="breadcrumb-item"
        :class="{ 'is-current': index === menuTrail.length - 1 }"
        type="button"
        :disabled="index === menuTrail.length - 1"
      >
        {{ item.title }}
      </button>
      <span v-if="index < menuTrail.length - 1" class="breadcrumb-separator">/</span>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import type { MenuItem } from '@/api/auth';
import { useUserStore } from '@/store/modules/user';
import { filterVisibleMenus, findFirstLeaf, findMenuTrail } from './menu-utils';

const route = useRoute();
const router = useRouter();
const { menus } = storeToRefs(useUserStore());

const menuTrail = computed(() => {
  const targetName = String(route.meta.activeMenu ?? route.name ?? '');
  return findMenuTrail(filterVisibleMenus(menus.value), targetName);
});

function navigateToMenu(menu: MenuItem) {
  void router.push({ name: findFirstLeaf(menu).name });
}
</script>

<style scoped lang="scss">
.layout-breadcrumb {
  display: flex;
  min-width: 0;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
}

.breadcrumb-item {
  max-width: 180px;
  padding: 4px 6px;
  overflow: hidden;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--ant-color-text-secondary);
  font: inherit;
  text-overflow: ellipsis;
  transition: 0.2s ease;

  &:not(:disabled):hover {
    background: var(--ant-color-fill-tertiary);
    color: var(--ant-color-primary);
  }

  &.is-current {
    color: var(--ant-color-text);
    cursor: default;
  }
}

.breadcrumb-separator {
  color: var(--ant-color-text-quaternary);
}
</style>
