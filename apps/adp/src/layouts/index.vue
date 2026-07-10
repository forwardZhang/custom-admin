<template>
  <div class="layout-wrap">
    <component :is="currentLayout" />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { useMediaQuery } from '@vueuse/core';
import { useAppStore } from '@/store/modules/app';

defineOptions({ name: 'AppLayout' });

const Vertical = defineAsyncComponent(() => import('./modules/vertical/index.vue'));
const VerticalTop = defineAsyncComponent(() => import('./modules/vertical-top/index.vue'));
const TwoColumn = defineAsyncComponent(() => import('./modules/two-column/index.vue'));
const Top = defineAsyncComponent(() => import('./modules/top/index.vue'));
const Mobile = defineAsyncComponent(() => import('./modules/components/mobile-layout.vue'));

const appStore = useAppStore();
const isMobile = useMediaQuery('(max-width: 959px)');

/** 布局模式与对应组件的映射表 */
const layoutComponents = {
  vertical: Vertical,
  'vertical-top': VerticalTop,
  'two-column': TwoColumn,
  top: Top,
};

/** 根据系统偏好动态计算当前生效的布局组件，移动端固定使用移动布局 */
const currentLayout = computed(() => {
  if (isMobile.value) {
    return Mobile;
  }
  const mode = appStore.preference.layout.mode;
  return layoutComponents[mode] || Vertical;
});
</script>

<style scoped lang="scss">
.layout-wrap {
  width: 100%;
  min-height: 100vh;
}
</style>
