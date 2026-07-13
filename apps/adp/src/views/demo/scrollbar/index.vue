<template>
  <div class="h-full p-4">
    <div class="mx-auto">
      <h1 class="mb-1 text-2xl font-semibold">Scrollbar Demo</h1>
      <p class="mb-6 text-sm">基于 @package/common-ui 的 Scrollbar 组件，参考 element-plus 实现</p>

      <!-- ── 基础用法：固定高度垂直滚动 ── -->
      <DemoCard title="基础用法" description="height=300px，自定义滚动条替代原生">
        <Scrollbar height="300px" class="rounded-lg border border-[var(--ant-color-border)]">
          <div class="space-y-3 p-4">
            <p v-for="i in 30" :key="i" class="text-sm text-[var(--ant-color-text)]">
              第 {{ i }} 行 —
              这是一段用于演示垂直滚动效果的占位文本，内容会超出容器高度从而出现滚动条。
            </p>
          </div>
        </Scrollbar>
      </DemoCard>

      <!-- ── always 始终显示 ── -->
      <DemoCard title="始终显示" description="always=true，滚动条不会自动隐藏">
        <Scrollbar height="200px" always class="rounded-lg border border-[var(--ant-color-border)]">
          <div class="space-y-3 p-4">
            <p v-for="i in 20" :key="i" class="text-sm text-[var(--ant-color-text)]">
              第 {{ i }} 行 — always 模式下滚动条始终可见。
            </p>
          </div>
        </Scrollbar>
      </DemoCard>

      <!-- ── native 原生滚动条 ── -->
      <DemoCard title="原生滚动条" description="native=true，使用浏览器默认滚动条">
        <Scrollbar height="200px" native class="rounded-lg border border-[var(--ant-color-border)]">
          <div class="space-y-3 p-4">
            <p v-for="i in 20" :key="i" class="text-sm text-[var(--ant-color-text)]">
              第 {{ i }} 行 — native 模式下显示浏览器原生滚动条。
            </p>
          </div>
        </Scrollbar>
      </DemoCard>

      <!-- ── 水平 + 垂直滚动 ── -->
      <DemoCard title="水平 + 垂直滚动" description="内容宽高均超出容器">
        <Scrollbar height="200px" class="rounded-lg border border-[var(--ant-color-border)]">
          <div class="w-[600px] space-y-3 p-4">
            <p v-for="i in 20" :key="i" class="text-sm text-[var(--ant-color-text)]">
              第 {{ i }} 行 — 内容宽度 600px 超出容器，同时出现水平滚动条。
            </p>
          </div>
        </Scrollbar>
      </DemoCard>

      <!-- ── 自定义颜色 ── -->
      <DemoCard title="自定义样式" description="通过 CSS 变量自定义滚动条颜色和尺寸">
        <Scrollbar
          height="200px"
          class="rounded-lg border border-[var(--ant-color-border)]"
          style="
            --cu-scrollbar-size: 10px;
            --cu-scrollbar-thumb-color: var(--ant-color-primary);
            --cu-scrollbar-thumb-hover-color: var(--ant-color-primary-hover);
            --cu-scrollbar-radius: 5px;
          "
        >
          <div class="space-y-3 p-4">
            <p v-for="i in 20" :key="i" class="text-sm text-[var(--ant-color-text)]">
              第 {{ i }} 行 — 使用 --cu-scrollbar-* 变量自定义滚动条外观。
            </p>
          </div>
        </Scrollbar>
      </DemoCard>

      <!-- ── 事件 & 方法 ── -->
      <DemoCard
        title="事件与方法"
        description="监听 scroll / end-reached，调用 scrollTo / setScrollTop"
      >
        <div class="mb-3 flex flex-wrap gap-2">
          <a-button size="small" @click="scrollToTop">scrollTo 顶部</a-button>
          <a-button size="small" @click="scrollToBottom">scrollTo 底部</a-button>
          <a-button size="small" @click="scrollToMiddle">setScrollTop 50%</a-button>
          <a-button size="small" @click="updateScrollbar">手动 update</a-button>
        </div>
        <div class="mb-3 flex gap-6 text-xs text-[var(--ant-color-text-secondary)]">
          <span
            >scrollTop:
            <span class="font-mono text-[var(--ant-color-text)]">{{
              scrollInfo.scrollTop
            }}</span></span
          >
          <span
            >scrollLeft:
            <span class="font-mono text-[var(--ant-color-text)]">{{
              scrollInfo.scrollLeft
            }}</span></span
          >
          <span
            >end-reached:
            <span class="font-mono text-[var(--ant-color-primary)]">{{
              endReachedDir || '-'
            }}</span></span
          >
        </div>
        <Scrollbar
          ref="demoScrollRef"
          height="220px"
          :distance="20"
          class="rounded-lg border border-[var(--ant-color-border)]"
          @scroll="onScroll"
          @end-reached="onEndReached"
        >
          <div class="space-y-3 p-4">
            <p v-for="i in 30" :key="i" class="text-sm text-[var(--ant-color-text)]">
              第 {{ i }} 行 — 滚动时上方会实时显示 scrollTop / scrollLeft，到达边缘（20px 内）时触发
              end-reached。
            </p>
          </div>
        </Scrollbar>
      </DemoCard>

      <!-- ── maxHeight ── -->
      <DemoCard title="maxHeight 模式" description="maxHeight=200px，内容少时不出现滚动条">
        <Scrollbar max-height="200px" class="rounded-lg border border-[var(--ant-color-border)]">
          <div class="space-y-3 p-4">
            <p v-for="i in 5" :key="i" class="text-sm text-[var(--ant-color-text)]">
              第 {{ i }} 行 — 内容未超出 maxHeight，不滚动。
            </p>
          </div>
        </Scrollbar>
      </DemoCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, h, ref } from 'vue';
import { Scrollbar } from '@package/common-ui';

import type { ScrollbarInstance, ScrollbarDirection } from '@package/common-ui';

defineOptions({ name: 'DemoScrollbar' });

// ── 内联 DemoCard 组件 ──
const DemoCard = defineComponent({
  name: 'DemoCard',
  props: {
    title: { type: String, required: true },
    description: { type: String, default: '' },
  },
  setup(props, { slots }) {
    return () =>
      h('div', { class: 'mb-6' }, [
        h('div', { class: 'mb-2' }, [
          h('h3', { class: 'text-base font-medium text-[var(--ant-color-text)]' }, props.title),
          props.description
            ? h(
                'p',
                { class: 'mt-0.5 text-xs text-[var(--ant-color-text-secondary)]' },
                props.description,
              )
            : null,
        ]),
        slots.default?.(),
      ]);
  },
});

// ── 事件 & 方法 demo ──
const demoScrollRef = ref<ScrollbarInstance>();

const scrollInfo = ref({ scrollTop: 0, scrollLeft: 0 });
const endReachedDir = ref<ScrollbarDirection | ''>('');

const onScroll = ({ scrollTop, scrollLeft }: { scrollTop: number; scrollLeft: number }) => {
  scrollInfo.value = { scrollTop, scrollLeft };
};

const onEndReached = (dir: ScrollbarDirection) => {
  endReachedDir.value = dir;
};

const scrollToTop = () => {
  demoScrollRef.value?.scrollTo({ top: 0, behavior: 'smooth' });
};

const scrollToBottom = () => {
  const wrap = demoScrollRef.value?.wrapRef;
  if (wrap) {
    demoScrollRef.value?.scrollTo({ top: wrap.scrollHeight, behavior: 'smooth' });
  }
};

const scrollToMiddle = () => {
  const wrap = demoScrollRef.value?.wrapRef;
  if (wrap) {
    demoScrollRef.value?.setScrollTop(Math.floor((wrap.scrollHeight - wrap.clientHeight) / 2));
  }
};

const updateScrollbar = () => {
  demoScrollRef.value?.update();
};
</script>
