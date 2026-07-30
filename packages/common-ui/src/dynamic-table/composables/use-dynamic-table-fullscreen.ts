import type { Ref } from 'vue';

import { onBeforeUnmount, onMounted, watch } from 'vue';

interface UseDynamicTableFullscreenEffectOptions {
  isFullscreen: Ref<boolean>;
  exit: () => void;
}

/**
 * 全屏的 DOM 副作用：锁定 body 滚动、支持 Escape 退出。
 * 全屏状态本身由 DynamicTableState 持有，这里只负责宿主组件生命周期内的副作用。
 */
export function useDynamicTableFullscreenEffect({
  isFullscreen,
  exit,
}: UseDynamicTableFullscreenEffectOptions) {
  let originalBodyOverflow = '';

  function lock(): void {
    originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  function unlock(): void {
    document.body.style.overflow = originalBodyOverflow;
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && isFullscreen.value) exit();
  }

  watch(isFullscreen, (value) => (value ? lock() : unlock()));

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown);
    // Hook 模式下可能在挂载前就切到了全屏。
    if (isFullscreen.value) lock();
  });

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeydown);
    if (isFullscreen.value) unlock();
  });
}
