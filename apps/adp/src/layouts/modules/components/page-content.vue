<template>
  <a-layout-content class="page-content">
    <RouterView v-slot="{ Component, route: currentRoute }">
      <Transition name="page-fade" mode="out-in">
        <KeepAlive :max="10">
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
  </a-layout-content>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    refreshKey?: number;
  }>(),
  {
    refreshKey: 0,
  },
);
</script>

<style scoped lang="scss">
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
