<template>
  <div class="page-tabs">
    <div ref="tabsScroller" class="page-tabs__scroller" @wheel="handleWheel">
      <a-dropdown
        v-for="tab in tabsStore.tabs"
        :key="tab.key"
        :trigger="['contextmenu']"
        :menu="{ items: getContextMenuItems(tab) }"
        @menu-click="({ key }) => handleContextMenu({ action: String(key), tab })"
      >
        <div
          class="page-tab"
          :class="{ 'is-active': tab.key === route.fullPath, 'is-pinned': tab.pinned }"
          :data-active="tab.key === route.fullPath"
        >
          <button class="page-tab__main" type="button" @click="navigateToTab(tab)">
            <component
              :is="getMenuIcon(tab.icon)"
              v-if="getMenuIcon(tab.icon)"
              class="page-tab__icon"
            />
            <span class="page-tab__title" :title="tab.title">{{ tab.title }}</span>
          </button>
          <button
            v-if="!tab.pinned"
            class="page-tab__close"
            type="button"
            aria-label="关闭标签"
            @click.stop="closeSingleTab(tab)"
          >
            <CloseOutlined />
          </button>
        </div>
      </a-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h, nextTick, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { MenuItemType } from 'antdv-next';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CloseOutlined,
  ColumnWidthOutlined,
  MinusOutlined,
  PushpinOutlined,
} from '@antdv-next/icons';
import { getAuthorizedHomeRouteName } from '@/router/routes/route-runtime';
import { useTabsStore } from '@/store/modules/tabs';
import type { PageTab } from '@/store/modules/tabs';
import { getMenuIcon } from './menu-utils';

type ContextMenuAction =
  | 'close'
  | 'close-other'
  | 'close-left'
  | 'close-right'
  | 'close-all'
  | 'toggle-pin';

const route = useRoute();
const router = useRouter();
const tabsStore = useTabsStore();
const tabsScroller = ref<HTMLElement | null>(null);

function createPageTab({
  fullPath,
  name,
  meta,
  pinned = false,
  affix = false,
}: {
  fullPath: string;
  name: string | symbol | null | undefined;
  meta: {
    title?: string;
    icon?: string;
    keepAlive?: boolean;
  };
  pinned?: boolean;
  affix?: boolean;
}): PageTab | null {
  if (typeof name !== 'string') return null;

  return {
    key: fullPath,
    name,
    fullPath,
    title: meta.title || name,
    icon: meta.icon,
    keepAlive: Boolean(meta.keepAlive),
    pinned,
    affix,
  };
}

function syncTabsWithRoute() {
  const validRouteNames = new Set(
    router
      .getRoutes()
      .map((record) => record.name)
      .filter((name): name is string => typeof name === 'string'),
  );
  tabsStore.removeInvalidTabs(validRouteNames);

  const homeRouteName = getAuthorizedHomeRouteName();
  if (homeRouteName) {
    const homeRoute = router.resolve({ name: homeRouteName });
    const homeTab = createPageTab({
      fullPath: homeRoute.fullPath,
      name: homeRoute.name,
      meta: homeRoute.meta,
      pinned: true,
      affix: true,
    });
    if (homeTab) tabsStore.addTab(homeTab);
  }

  const currentTab = createPageTab({
    fullPath: route.fullPath,
    name: route.name,
    meta: route.meta,
  });
  if (currentTab) tabsStore.addTab(currentTab);
}

function navigateToTab(tab: PageTab) {
  if (tab.key !== route.fullPath) {
    void router.push(tab.fullPath);
  }
}

function mutateTabs({ mutate, preferredKey }: { mutate: () => void; preferredKey?: string }) {
  const activeKey = route.fullPath;
  const activeIndex = tabsStore.tabs.findIndex((tab) => tab.key === activeKey);
  mutate();

  if (tabsStore.tabs.some((tab) => tab.key === activeKey)) return;

  const target =
    tabsStore.tabs.find((tab) => tab.key === preferredKey) ??
    tabsStore.tabs[Math.min(Math.max(activeIndex, 0), tabsStore.tabs.length - 1)] ??
    tabsStore.tabs.at(-1);

  if (target) {
    void router.push(target.fullPath);
  }
}

function closeSingleTab(tab: PageTab) {
  if (tab.pinned) return;

  mutateTabs({
    mutate: () => tabsStore.closeTab(tab.key),
  });
}

function getContextMenuItems(tab: PageTab): MenuItemType[] {
  const index = tabsStore.tabs.findIndex((item) => item.key === tab.key);
  const hasClosableOther = tabsStore.tabs.some((item) => item.key !== tab.key && !item.pinned);
  const hasClosableLeft = tabsStore.tabs.some(
    (item, itemIndex) => itemIndex < index && !item.pinned,
  );
  const hasClosableRight = tabsStore.tabs.some(
    (item, itemIndex) => itemIndex > index && !item.pinned,
  );
  const hasClosableTab = tabsStore.tabs.some((item) => !item.pinned);

  return [
    {
      key: 'close',
      label: '关闭',
      icon: h(CloseOutlined),
      disabled: tab.pinned,
    },
    {
      key: 'close-other',
      label: '关闭其他',
      icon: h(ColumnWidthOutlined),
      disabled: !hasClosableOther,
    },
    {
      key: 'close-left',
      label: '关闭左侧',
      icon: h(ArrowLeftOutlined),
      disabled: !hasClosableLeft,
    },
    {
      key: 'close-right',
      label: '关闭右侧',
      icon: h(ArrowRightOutlined),
      disabled: !hasClosableRight,
    },
    {
      key: 'close-all',
      label: '关闭所有',
      icon: h(MinusOutlined),
      disabled: !hasClosableTab,
    },
    { type: 'divider' },
    {
      key: 'toggle-pin',
      label: tab.pinned ? '取消固定标签' : '固定标签',
      icon: h(PushpinOutlined),
      disabled: tab.affix,
    },
  ];
}

function handleContextMenu({ action, tab }: { action: string; tab: PageTab }) {
  switch (action as ContextMenuAction) {
    case 'close':
      closeSingleTab(tab);
      break;
    case 'close-other':
      mutateTabs({
        mutate: () => tabsStore.closeOtherTabs(tab.key),
        preferredKey: tab.key,
      });
      break;
    case 'close-left':
      mutateTabs({
        mutate: () => tabsStore.closeLeftTabs(tab.key),
        preferredKey: tab.key,
      });
      break;
    case 'close-right':
      mutateTabs({
        mutate: () => tabsStore.closeRightTabs(tab.key),
        preferredKey: tab.key,
      });
      break;
    case 'close-all':
      mutateTabs({ mutate: tabsStore.closeAllTabs });
      break;
    case 'toggle-pin':
      tabsStore.togglePinned(tab.key);
      break;
  }
}

function handleWheel(event: WheelEvent) {
  if (!tabsScroller.value || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

  tabsScroller.value.scrollLeft += event.deltaY;
  event.preventDefault();
}

async function scrollActiveTabIntoView() {
  await nextTick();
  const activeTab = tabsScroller.value?.querySelector<HTMLElement>('[data-active="true"]');
  activeTab?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
}

watch(
  () => route.fullPath,
  () => {
    syncTabsWithRoute();
    void scrollActiveTabIntoView();
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
.page-tabs {
  height: 37px;
  flex: 0 0 37px;
  overflow: hidden;
  border-bottom: 1px solid var(--ant-color-border-secondary);
  background: var(--ant-color-bg-container);
  box-shadow: 0 2px 8px rgb(16 24 40 / 3%);
}

.page-tabs__scroller {
  display: flex;
  height: 100%;
  align-items: flex-end;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 5px 16px 0;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.page-tab {
  position: relative;
  display: flex;
  height: 32px;
  min-width: 0;
  flex: 0 0 auto;
  align-items: center;
  border-radius: 8px;
  background: transparent;
  color: var(--ant-color-text);
  font-size: 14px;
  transition:
    background 0.2s ease,
    color 0.2s ease;

  &::after {
    position: absolute;
    top: 7px;
    right: -4.5px;
    width: 1px;
    height: 18px;
    background: var(--ant-color-border-secondary);
    content: '';
    transition: opacity 0.2s ease;
  }

  &:hover {
    background: var(--ant-color-fill-tertiary);
    color: var(--ant-color-primary);

    &::after {
      opacity: 0;
    }
  }

  &.is-active {
    background: color-mix(in srgb, var(--ant-color-primary) 20%, transparent);
    color: var(--ant-color-primary);
    border-radius: 8px 8px 0 0;
    z-index: 2;

    &::before,
    &::after {
      content: '';
      position: absolute;
      width: 10px;
      height: 10px;
      bottom: 0;
      pointer-events: none;
    }

    &::before {
      left: -10px;
      background: radial-gradient(
        circle at 0 0,
        transparent 10px,
        color-mix(in srgb, var(--ant-color-primary) 20%, transparent) 11px
      );
    }

    &::after {
      right: -10px;
      background: radial-gradient(
        circle at 100% 0,
        transparent 10px,
        color-mix(in srgb, var(--ant-color-primary) 20%, transparent) 11px
      );
      // 重写非激活态下 ::after 竖线的定位与样式
      top: auto;
      width: 10px;
      height: 10px;
      opacity: 1;
    }
  }

  &:not(.is-active):focus-within {
    &::after {
      opacity: 0;
    }
  }
}

// 当前标签左侧的分隔线属于前一个标签，需要一并隐藏（排除激活态 Tab，防止激活态右侧滑梯被隐藏）。
.page-tab:not(.is-active):has(+ .page-tab.is-active)::after,
.page-tab:not(.is-active):has(+ .page-tab:hover)::after,
.page-tab:not(.is-active):has(+ .page-tab:focus-within)::after {
  opacity: 0;
}

.page-tab__main {
  display: flex;
  height: 100%;
  min-width: 0;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border: 0;
  outline: none;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;

  &:focus-visible {
    border-radius: 6px 6px 0 0;
    box-shadow: inset 0 0 0 2px var(--ant-color-primary-border);
  }
}

.page-tab__icon {
  flex: 0 0 auto;
  font-size: 16px;
}

.page-tab__title {
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.page-tab__close {
  display: grid;
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  place-items: center;
  margin-right: 8px;
  margin-left: -6px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  outline: none;
  background: transparent;
  color: var(--ant-color-text-secondary);
  font-size: 10px;
  transition: 0.18s ease;

  &:hover {
    background: var(--ant-color-fill-secondary);
    color: var(--ant-color-text);
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px var(--ant-color-primary-border);
  }
}

@media (max-width: 640px) {
  .page-tabs__scroller {
    padding-top: 5px;
  }

  .page-tab__main {
    padding: 0 10px;
  }

  .page-tab__close {
    margin-right: 6px;
  }
}
</style>
