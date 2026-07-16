<template>
  <div ref="scrollbarRef" class="scrollbar">
    <div
      ref="wrapRef"
      :class="wrapKls"
      :style="wrapStyle"
      :tabindex="tabindex"
      @scroll="handleScroll"
    >
      <component
        :is="tag"
        :id="id"
        ref="resizeRef"
        :class="resizeKls"
        :style="viewStyle"
        :role="role"
        :aria-label="ariaLabel"
        :aria-orientation="ariaOrientation"
      >
        <slot />
      </component>
    </div>
    <template v-if="!native">
      <Bar ref="barRef" :always="always" :min-size="minSize" />
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onActivated,
  onMounted,
  onUpdated,
  provide,
  reactive,
  ref,
  watch,
} from 'vue';
import { useEventListener, useResizeObserver } from '@vueuse/core';
import Bar from './bar.vue';
import { scrollbarContextKey } from './constants';
import { addUnit, isGreaterThan, isNumber } from './util';

import type { CSSProperties, StyleValue } from 'vue';
import type { BarInstance, ScrollbarDirection, ScrollbarEmits, ScrollbarProps } from './types';

defineOptions({ name: 'Scrollbar' });

const props = withDefaults(defineProps<ScrollbarProps>(), {
  distance: 0,
  height: '',
  maxHeight: '',
  wrapStyle: '',
  wrapClass: '',
  viewStyle: '',
  viewClass: '',
  tag: 'div',
  minSize: 20,
});
const emit = defineEmits<ScrollbarEmits>();

let stopResizeObserver: (() => void) | undefined;
let stopWrapResizeObserver: (() => void) | undefined;
let stopResizeListener: (() => void) | undefined;
let wrapScrollTop = 0;
let wrapScrollLeft = 0;
let direction = '' as ScrollbarDirection;

const distanceScrollState: Record<ScrollbarDirection, boolean> = {
  bottom: false,
  top: false,
  right: false,
  left: false,
};

const scrollbarRef = ref<HTMLDivElement>();
const wrapRef = ref<HTMLDivElement>();
const resizeRef = ref<HTMLElement>();
const barRef = ref<BarInstance>();

const wrapStyle = computed<StyleValue>(() => {
  const style: CSSProperties = {};
  const height = addUnit(props.height);
  const maxHeight = addUnit(props.maxHeight);
  if (height) style.height = height;
  if (maxHeight) style.maxHeight = maxHeight;
  return [props.wrapStyle, style];
});

const wrapKls = computed(() => [
  props.wrapClass,
  'scrollbar__wrap',
  { 'scrollbar__wrap--hidden-default': !props.native },
]);

const resizeKls = computed(() => ['scrollbar__view', props.viewClass]);

const DIRECTION_PAIRS: Record<ScrollbarDirection, ScrollbarDirection> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

const shouldSkipDirection = (dir: ScrollbarDirection) => distanceScrollState[dir] ?? false;

const updateTriggerStatus = (arrivedStates: Record<string, boolean>) => {
  const oppositeDirection = DIRECTION_PAIRS[direction];
  if (!oppositeDirection) return;

  const arrived = arrivedStates[direction];
  const oppositeArrived = arrivedStates[oppositeDirection];

  if (arrived && !distanceScrollState[direction]) {
    distanceScrollState[direction] = true;
  }

  if (!oppositeArrived && distanceScrollState[oppositeDirection]) {
    distanceScrollState[oppositeDirection] = false;
  }
};

const handleScroll = () => {
  if (wrapRef.value) {
    barRef.value?.handleScroll(wrapRef.value);
    const prevTop = wrapScrollTop;
    const prevLeft = wrapScrollLeft;
    wrapScrollTop = wrapRef.value.scrollTop;
    wrapScrollLeft = wrapRef.value.scrollLeft;

    const arrivedStates = {
      bottom: !isGreaterThan(
        wrapRef.value.scrollHeight - props.distance,
        wrapRef.value.clientHeight + wrapScrollTop,
      ),
      top: wrapScrollTop <= props.distance && prevTop !== 0,
      right:
        !isGreaterThan(
          wrapRef.value.scrollWidth - props.distance,
          wrapRef.value.clientWidth + wrapScrollLeft,
        ) && prevLeft !== wrapScrollLeft,
      left: wrapScrollLeft <= props.distance && prevLeft !== 0,
    };

    emit('scroll', {
      scrollTop: wrapScrollTop,
      scrollLeft: wrapScrollLeft,
    });

    if (prevTop !== wrapScrollTop) {
      direction = wrapScrollTop > prevTop ? 'bottom' : 'top';
    }
    if (prevLeft !== wrapScrollLeft) {
      direction = wrapScrollLeft > prevLeft ? 'right' : 'left';
    }
    if (props.distance > 0) {
      if (shouldSkipDirection(direction)) return;
      updateTriggerStatus(arrivedStates);
    }
    if (arrivedStates[direction]) emit('end-reached', direction);
  }
};

function scrollTo(xCord: number, yCord?: number): void;
function scrollTo(options: ScrollToOptions): void;
function scrollTo(arg1: unknown, arg2?: number) {
  if (typeof arg1 === 'object' && arg1 !== null) {
    wrapRef.value?.scrollTo(arg1 as ScrollToOptions);
  } else if (isNumber(arg1) && isNumber(arg2)) {
    wrapRef.value?.scrollTo(arg1, arg2);
  }
}

const setScrollTop = (value: number) => {
  if (!isNumber(value)) {
    console.warn('[Scrollbar] value must be a number');
    return;
  }
  wrapRef.value!.scrollTop = value;
};

const setScrollLeft = (value: number) => {
  if (!isNumber(value)) {
    console.warn('[Scrollbar] value must be a number');
    return;
  }
  wrapRef.value!.scrollLeft = value;
};

const update = () => {
  barRef.value?.update();
  distanceScrollState[direction] = false;
  if (wrapRef.value) barRef.value?.handleScroll(wrapRef.value);
};

watch(
  () => props.noresize,
  (noresize) => {
    if (noresize) {
      stopResizeObserver?.();
      stopWrapResizeObserver?.();
      stopResizeListener?.();
    } else {
      ({ stop: stopResizeObserver } = useResizeObserver(resizeRef, update));
      ({ stop: stopWrapResizeObserver } = useResizeObserver(wrapRef, update));
      stopResizeListener = useEventListener(window, 'resize', update);
    }
  },
  { immediate: true },
);

watch(
  () => [props.maxHeight, props.height],
  () => {
    if (!props.native) {
      nextTick(() => {
        update();
      });
    }
  },
);

provide(
  scrollbarContextKey,
  reactive({
    scrollbarElement: scrollbarRef,
    wrapElement: wrapRef,
  }),
);

onActivated(() => {
  if (wrapRef.value) {
    wrapRef.value.scrollTop = wrapScrollTop;
    wrapRef.value.scrollLeft = wrapScrollLeft;
  }
});

onMounted(() => {
  if (!props.native) {
    nextTick(() => {
      update();
    });
  }
});

onUpdated(() => update());

defineExpose({
  /** scrollbar wrap ref */
  wrapRef,
  /** update scrollbar state manually */
  update,
  /** scrolls to a particular set of coordinates */
  scrollTo,
  /** set distance to scroll top */
  setScrollTop,
  /** set distance to scroll left */
  setScrollLeft,
  /** handle scroll event */
  handleScroll,
});
</script>

<style scoped>
.scrollbar {
  --scrollbar-size: 6px;
  --scrollbar-thumb-color: rgba(144, 147, 153, 0.3);
  --scrollbar-thumb-hover-color: rgba(144, 147, 153, 0.5);
  --scrollbar-radius: 4px;
  position: relative;
  overflow: hidden;
}

.scrollbar__wrap {
  height: 100%;
  overflow: auto;
}

.scrollbar__wrap--hidden-default {
  scrollbar-width: none;
}

.scrollbar__wrap--hidden-default::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

.scrollbar__view {
  display: block;
}
</style>
