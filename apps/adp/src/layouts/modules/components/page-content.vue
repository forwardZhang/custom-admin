<template>
  <a-layout-content class="page-shell">
    <PageTabs />
    <div class="page-content">
      <RouterView v-slot="{ Component, route: currentRoute }">
        <Transition name="page-fade" mode="out-in">
          <KeepAlive :include="tabsStore.cachedRouteNames" :max="10">
            <component
              :is="Component"
              v-if="currentRoute.meta.keepAlive"
              :key="`${currentRoute.fullPath}-${refreshKey}`"
            />
          </KeepAlive>
        </Transition>
        <Transition name="page-fade" mode="out-in">
          <component
            :is="Component"
            v-if="!currentRoute.meta.keepAlive"
            :key="`${currentRoute.fullPath}-${refreshKey}`"
          />
        </Transition>
      </RouterView>
    </div>
  </a-layout-content>
</template>

<script setup lang="ts">
import { useTabsStore } from '@/store/modules/tabs';
import PageTabs from './page-tabs.vue';

withDefaults(
  defineProps<{
    refreshKey?: number;
  }>(),
  {
    refreshKey: 0,
  },
);

const tabsStore = useTabsStore();
</script>

<style scoped lang="scss">
.page-shell {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--ant-color-bg-layout);
}

.page-content {
  min-height: 0;
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
  background: var(--ant-color-bg-layout);
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateX(8px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}
</style>
