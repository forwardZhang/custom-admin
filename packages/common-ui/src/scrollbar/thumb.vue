<template>
  <transition name="scrollbar-fade">
    <div
      v-show="always || visible"
      ref="instanceRef"
      :class="['scrollbar__bar', bar.key === 'vertical' ? 'is-vertical' : 'is-horizontal']"
      @mousedown="clickTrackHandler"
      @click.stop
    >
      <div
        ref="thumbRef"
        class="scrollbar__thumb"
        :style="thumbStyle"
        @mousedown="clickThumbHandler"
      />
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, inject, onBeforeUnmount, ref, toRef } from 'vue';
import { useEventListener } from '@vueuse/core';
import { scrollbarContextKey } from './constants';
import { BAR_MAP, renderThumbStyle } from './util';

defineOptions({ name: 'ScrollbarThumb' });

interface ThumbProps {
  vertical?: boolean;
  size?: string;
  move?: number;
  ratio: number;
  always?: boolean;
}

const props = defineProps<ThumbProps>();

const scrollbar = inject(scrollbarContextKey);

if (!scrollbar) {
  throw new Error('[ScrollbarThumb] can not inject scrollbar context');
}

const instanceRef = ref<HTMLDivElement>();
const thumbRef = ref<HTMLDivElement>();

const thumbState = ref<Partial<Record<'X' | 'Y', number>>>({});
const visible = ref(false);

let cursorDown = false;
let cursorLeave = false;
let baseScrollHeight = 0;
let baseScrollWidth = 0;
let originalOnSelectStart = typeof window !== 'undefined' ? document.onselectstart : null;

const bar = computed(() => BAR_MAP[props.vertical ? 'vertical' : 'horizontal']);

const thumbStyle = computed(() =>
  renderThumbStyle({
    size: props.size,
    move: props.move,
    bar: bar.value,
  }),
);

const offsetRatio = computed(
  () =>
    // offsetRatioX = original width of thumb / current width of thumb / ratioX
    // offsetRatioY = original height of thumb / current height of thumb / ratioY
    // instance height = wrap height - GAP
    instanceRef.value![bar.value.offset] ** 2 /
      scrollbar.wrapElement![bar.value.scrollSize] /
      props.ratio /
      thumbRef.value![bar.value.offset] || 1,
);

const clickThumbHandler = (e: MouseEvent) => {
  // prevent click event of middle and right button
  e.stopPropagation();
  if (e.ctrlKey || [1, 2].includes(e.button)) return;

  window.getSelection()?.removeAllRanges();
  startDrag(e);

  const el = e.currentTarget as HTMLDivElement;
  if (!el) return;
  thumbState.value[bar.value.axis] =
    el[bar.value.offset] - (e[bar.value.client] - el.getBoundingClientRect()[bar.value.direction]);
};

const clickTrackHandler = (e: MouseEvent) => {
  if (!thumbRef.value || !instanceRef.value || !scrollbar.wrapElement) return;

  const offset = Math.abs(
    (e.target as HTMLElement).getBoundingClientRect()[bar.value.direction] - e[bar.value.client],
  );
  const thumbHalf = thumbRef.value[bar.value.offset] / 2;
  const thumbPositionPercentage =
    ((offset - thumbHalf) * 100 * offsetRatio.value) / instanceRef.value[bar.value.offset];

  scrollbar.wrapElement[bar.value.scroll] =
    (thumbPositionPercentage * scrollbar.wrapElement[bar.value.scrollSize]) / 100;
};

const startDrag = (e: MouseEvent) => {
  e.stopImmediatePropagation();
  cursorDown = true;
  baseScrollHeight = scrollbar.wrapElement!.scrollHeight;
  baseScrollWidth = scrollbar.wrapElement!.scrollWidth;
  document.addEventListener('mousemove', mouseMoveDocumentHandler);
  document.addEventListener('mouseup', mouseUpDocumentHandler);
  originalOnSelectStart = document.onselectstart;
  document.onselectstart = () => false;
};

const mouseMoveDocumentHandler = (e: MouseEvent) => {
  if (!instanceRef.value || !thumbRef.value) return;
  if (cursorDown === false) return;

  const prevPage = thumbState.value[bar.value.axis];
  if (!prevPage) return;

  const offset =
    (instanceRef.value.getBoundingClientRect()[bar.value.direction] - e[bar.value.client]) * -1;
  const thumbClickPosition = thumbRef.value[bar.value.offset] - prevPage;
  const thumbPositionPercentage =
    ((offset - thumbClickPosition) * 100 * offsetRatio.value) / instanceRef.value[bar.value.offset];

  if (bar.value.scroll === 'scrollLeft') {
    scrollbar.wrapElement![bar.value.scroll] = (thumbPositionPercentage * baseScrollWidth) / 100;
  } else {
    scrollbar.wrapElement![bar.value.scroll] = (thumbPositionPercentage * baseScrollHeight) / 100;
  }
};

const mouseUpDocumentHandler = () => {
  cursorDown = false;
  thumbState.value[bar.value.axis] = 0;
  document.removeEventListener('mousemove', mouseMoveDocumentHandler);
  document.removeEventListener('mouseup', mouseUpDocumentHandler);
  restoreOnselectstart();
  if (cursorLeave) visible.value = false;
};

const mouseMoveScrollbarHandler = () => {
  cursorLeave = false;
  visible.value = !!props.size;
};

const mouseLeaveScrollbarHandler = () => {
  cursorLeave = true;
  visible.value = cursorDown;
};

const restoreOnselectstart = () => {
  if (document.onselectstart !== originalOnSelectStart) {
    document.onselectstart = originalOnSelectStart;
  }
};

onBeforeUnmount(() => {
  restoreOnselectstart();
  document.removeEventListener('mouseup', mouseUpDocumentHandler);
});

useEventListener(toRef(scrollbar, 'scrollbarElement'), 'mousemove', mouseMoveScrollbarHandler);
useEventListener(toRef(scrollbar, 'scrollbarElement'), 'mouseleave', mouseLeaveScrollbarHandler);
</script>

<style scoped>
.scrollbar__bar {
  position: absolute;
  right: 2px;
  bottom: 2px;
  z-index: 1;
  border-radius: var(--scrollbar-radius, 4px);
}

.scrollbar__bar.is-vertical {
  width: var(--scrollbar-size, 6px);
  top: 2px;
}

.scrollbar__bar.is-vertical > .scrollbar__thumb {
  width: 100%;
}

.scrollbar__bar.is-horizontal {
  height: var(--scrollbar-size, 6px);
  left: 2px;
}

.scrollbar__bar.is-horizontal > .scrollbar__thumb {
  height: 100%;
}

.scrollbar__thumb {
  position: relative;
  display: block;
  border-radius: inherit;
  background-color: var(--scrollbar-thumb-color, rgba(144, 147, 153, 0.3));
  cursor: pointer;
  transition: background-color 300ms ease;
}

.scrollbar__thumb:hover {
  background-color: var(--scrollbar-thumb-hover-color, rgba(144, 147, 153, 0.5));
}

.scrollbar-fade-enter-active,
.scrollbar-fade-leave-active {
  transition: opacity 120ms ease;
}

.scrollbar-fade-enter-from,
.scrollbar-fade-leave-to {
  opacity: 0;
}
</style>
