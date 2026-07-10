import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import type { MenuItem } from '@/api/auth';
import { useAppStore } from '@/store/modules/app';
import { useUserStore } from '@/store/modules/user';
import { filterVisibleMenus, findFirstLeaf, findMenuTrail } from '../components/menu-utils';

export function useLayout() {
  const route = useRoute();
  const router = useRouter();
  const appStore = useAppStore();
  const { menus } = storeToRefs(useUserStore());

  const refreshKey = ref(0);
  const activePrimaryName = ref('');

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

  const siderMenus = computed(() => activePrimaryMenu.value?.children ?? []);

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

  return {
    appStore,
    refreshKey,
    activePrimaryName,
    visibleMenus,
    primaryOnlyMenus,
    activePrimaryMenu,
    selectedPrimaryKeys,
    siderMenus,
    toggleMenu,
    refreshPage,
    selectPrimaryMenu,
    handlePrimaryMenuClick,
  };
}
