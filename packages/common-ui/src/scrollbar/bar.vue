<template>
  <Thumb :move="moveX" :ratio="ratioX" :size="sizeWidth" :always="always" />
  <Thumb :move="moveY" :ratio="ratioY" :size="sizeHeight" vertical :always="always" />
</template>

<script setup lang="ts">
import { inject, ref } from 'vue';
import { GAP } from './util';
import Thumb from './thumb.vue';
import { scrollbarContextKey } from './constants';

defineOptions({ name: 'ScrollbarBar' });

interface BarProps {
  always?: boolean;
  minSize: number;
}

const props = withDefaults(defineProps<BarProps>(), {
  always: true,
});

const scrollbar = inject(scrollbarContextKey);

if (!scrollbar) {
  throw new Error('[ScrollbarBar] can not inject scrollbar context');
}

const moveX = ref(0);
const moveY = ref(0);
const sizeWidth = ref('');
const sizeHeight = ref('');
const ratioY = ref(1);
const ratioX = ref(1);

const handleScroll = (wrap: HTMLDivElement) => {
  if (wrap) {
    const offsetHeight = wrap.offsetHeight - GAP;
    const offsetWidth = wrap.offsetWidth - GAP;

    moveY.value = ((wrap.scrollTop * 100) / offsetHeight) * ratioY.value;
    moveX.value = ((wrap.scrollLeft * 100) / offsetWidth) * ratioX.value;
  }
};

const update = () => {
  const wrap = scrollbar.wrapElement;
  if (!wrap) return;

  const offsetHeight = wrap.offsetHeight - GAP;
  const offsetWidth = wrap.offsetWidth - GAP;

  const originalHeight = offsetHeight ** 2 / wrap.scrollHeight;
  const originalWidth = offsetWidth ** 2 / wrap.scrollWidth;
  const height = Math.max(originalHeight, props.minSize);
  const width = Math.max(originalWidth, props.minSize);

  ratioY.value =
    originalHeight / (offsetHeight - originalHeight) / (height / (offsetHeight - height));
  ratioX.value = originalWidth / (offsetWidth - originalWidth) / (width / (offsetWidth - width));

  sizeHeight.value = height + GAP < offsetHeight ? `${height}px` : '';
  sizeWidth.value = width + GAP < offsetWidth ? `${width}px` : '';
};

defineExpose({
  handleScroll,
  update,
});
</script>
