<template>
  <div :class="['layout-menu', `is-${mode}`]">
    <a-menu
      v-model:open-keys="openKeys"
      v-model:selected-keys="selectedKeys"
      :mode="mode"
      theme="light"
      :items="menuItems"
      :inline-collapsed="mode === 'inline' ? collapsed : undefined"
      :overflowed-indicator="mode === 'horizontal' ? overflowedIndicator : undefined"
      @click="handleMenuClick"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, h, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { EllipsisOutlined } from '@antdv-next/icons';
import type { MenuItemType } from 'antdv-next';
import { useUserStore } from '@/store/modules/user';
import type { MenuItem } from '@/api/auth';
import { filterVisibleMenus, findMenuTrail, getMenuIcon } from './menu-utils';

interface Props {
  mode?: 'vertical' | 'horizontal' | 'inline';
  menuList?: MenuItem[];
  collapsed?: boolean;
  /** 是否自动处理路由高亮与跳转。若为 false，则点击项时触发 click 事件且停止内部路由同步高亮。 */
  autoRoute?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'inline',
  menuList: undefined,
  collapsed: false,
  autoRoute: true,
});

const emit = defineEmits<{
  click: [info: { key: string | number }];
}>();

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const { menus } = storeToRefs(userStore);

const selectedKeys = defineModel<string[]>('selectedKeys', { default: () => [] });
const openKeys = ref<string[]>([]);
const overflowedIndicator = h(EllipsisOutlined, { title: '更多菜单' });

const visibleMenus = computed(() => filterVisibleMenus(props.menuList ?? menus.value));

/** 将业务菜单转换为 Antdv Next Menu 的 items 数据。 */
function transformMenusToItems(menuList: MenuItem[]): MenuItemType[] {
  return menuList.map((menu) => {
    const iconComponent = getMenuIcon(menu.icon);
    const item: MenuItemType = {
      key: menu.name,
      label: menu.title,
      title: menu.title,
      icon: iconComponent ? h(iconComponent) : undefined,
    };

    if (menu.children?.length) {
      item.children = transformMenusToItems(menu.children);
    }

    return item;
  });
}

const menuItems = computed(() => transformMenusToItems(visibleMenus.value));

function handleMenuClick(info: { key: string | number }) {
  if (props.autoRoute) {
    void router.push({ name: String(info.key) });
  } else {
    emit('click', info);
  }
}

// 监听当前路由，高亮并自动展开菜单树。若开启了 autoRoute，则由路由自动驱动高亮状态。
watch(
  [() => route.name, () => route.meta.activeMenu, visibleMenus],
  ([routeName, activeMenu]) => {
    if (!props.autoRoute) return;
    const targetName = String(activeMenu ?? routeName ?? '');
    if (!targetName) return;

    selectedKeys.value = [targetName];
    const trail = findMenuTrail(visibleMenus.value, targetName);
    openKeys.value = props.mode === 'inline' ? trail.slice(0, -1).map((menu) => menu.name) : [];
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
.layout-menu {
  &.is-horizontal {
    line-height: var(--ant-layout-header-height);
  }
  :deep(.ant-menu) {
    border-inline-end: none;
  }
}
</style>
