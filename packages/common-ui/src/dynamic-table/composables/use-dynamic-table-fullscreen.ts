import { onBeforeUnmount, onMounted, ref } from 'vue';

interface UseDynamicTableFullscreenOptions {
  onChange: (fullscreen: boolean) => void;
}

/** 管理全屏状态以及 body 滚动锁定，避免污染表格主体逻辑。 */
export function useDynamicTableFullscreen({ onChange }: UseDynamicTableFullscreenOptions) {
  const isFullscreen = ref(false);
  let originalBodyOverflow = '';

  function toggleFullscreen(force?: boolean): void {
    const nextValue = force ?? !isFullscreen.value;
    if (nextValue === isFullscreen.value) return;

    if (nextValue) {
      originalBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = originalBodyOverflow;
    }

    isFullscreen.value = nextValue;
    onChange(nextValue);
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && isFullscreen.value) toggleFullscreen(false);
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeydown);
    if (isFullscreen.value) document.body.style.overflow = originalBodyOverflow;
  });

  return { isFullscreen, toggleFullscreen };
}
