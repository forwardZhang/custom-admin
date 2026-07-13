import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { storage } from '@package/shared';

const PAGE_TABS_STORAGE_KEY = 'page-tabs';

export interface PageTab {
  /** 标签唯一键，使用完整地址以区分 query / params 不同的页面。 */
  key: string;
  /** 路由名称，同时作为 KeepAlive include 的组件名称。 */
  name: string;
  /** 可直接交给 router.push 的完整地址。 */
  fullPath: string;
  /** 标签显示标题。 */
  title: string;
  /** Antdv 图标组件名称。 */
  icon?: string;
  /** 是否启用页面缓存。 */
  keepAlive: boolean;
  /** 是否固定在标签栏左侧。 */
  pinned: boolean;
  /** 是否为系统固定标签（例如首页），系统固定标签不可取消固定。 */
  affix: boolean;
}

function isPageTab(value: unknown): value is PageTab {
  if (!value || typeof value !== 'object') return false;

  const tab = value as Record<string, unknown>;
  return (
    typeof tab.key === 'string' &&
    typeof tab.name === 'string' &&
    typeof tab.fullPath === 'string' &&
    typeof tab.title === 'string' &&
    typeof tab.keepAlive === 'boolean' &&
    typeof tab.pinned === 'boolean' &&
    typeof tab.affix === 'boolean' &&
    (tab.icon === undefined || typeof tab.icon === 'string')
  );
}

function readStoredTabs() {
  const value = storage.get<unknown>(PAGE_TABS_STORAGE_KEY, []);
  return Array.isArray(value) ? value.filter(isPageTab) : [];
}

function sortPinnedTabs(tabList: PageTab[]) {
  return [...tabList.filter((tab) => tab.pinned), ...tabList.filter((tab) => !tab.pinned)];
}

export const useTabsStore = defineStore('tabs', () => {
  const tabs = ref<PageTab[]>(sortPinnedTabs(readStoredTabs()));

  /** 当前仍需由 Vue KeepAlive 保留的组件名称。 */
  const cachedRouteNames = computed(() => {
    return [...new Set(tabs.value.filter((tab) => tab.keepAlive).map((tab) => tab.name))];
  });

  watch(
    tabs,
    (value) => {
      storage.set(PAGE_TABS_STORAGE_KEY, value);
    },
    { deep: true },
  );

  function addTab(tab: PageTab) {
    const index = tabs.value.findIndex((item) => item.key === tab.key);

    if (index >= 0) {
      const current = tabs.value[index]!;
      tabs.value[index] = {
        ...current,
        ...tab,
        pinned: current.pinned || tab.pinned,
        affix: current.affix || tab.affix,
      };
    } else {
      tabs.value.push(tab);
    }

    tabs.value = sortPinnedTabs(tabs.value);
  }

  function removeInvalidTabs(validRouteNames: Set<string>) {
    tabs.value = tabs.value.filter((tab) => validRouteNames.has(tab.name));
  }

  function closeTab(key: string) {
    tabs.value = tabs.value.filter((tab) => tab.key !== key || tab.pinned);
  }

  function closeOtherTabs(key: string) {
    tabs.value = tabs.value.filter((tab) => tab.key === key || tab.pinned);
  }

  function closeLeftTabs(key: string) {
    const index = tabs.value.findIndex((tab) => tab.key === key);
    if (index <= 0) return;

    tabs.value = tabs.value.filter((tab, tabIndex) => tabIndex >= index || tab.pinned);
  }

  function closeRightTabs(key: string) {
    const index = tabs.value.findIndex((tab) => tab.key === key);
    if (index < 0 || index === tabs.value.length - 1) return;

    tabs.value = tabs.value.filter((tab, tabIndex) => tabIndex <= index || tab.pinned);
  }

  function closeAllTabs() {
    tabs.value = tabs.value.filter((tab) => tab.pinned);
  }

  function togglePinned(key: string) {
    const tab = tabs.value.find((item) => item.key === key);
    if (!tab || tab.affix) return;

    tab.pinned = !tab.pinned;
    tabs.value = sortPinnedTabs(tabs.value);
  }

  function resetTabs() {
    tabs.value = [];
    storage.remove(PAGE_TABS_STORAGE_KEY);
  }

  return {
    tabs,
    cachedRouteNames,
    addTab,
    removeInvalidTabs,
    closeTab,
    closeOtherTabs,
    closeLeftTabs,
    closeRightTabs,
    closeAllTabs,
    togglePinned,
    resetTabs,
  };
});
