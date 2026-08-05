<template>
  <div class="example-container">
    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">scroll 事件</h3>
          <p class="section-description">监听滚动位置变化</p>
        </div>
      </div>

      <div class="demo-block">
        <div class="mb-3 flex gap-6 text-xs text-text-secondary">
          <span
            >scrollTop: <span class="font-mono text-text">{{ scrollInfo.scrollTop }}</span></span
          >
          <span
            >scrollLeft: <span class="font-mono text-text">{{ scrollInfo.scrollLeft }}</span></span
          >
        </div>
        <Scrollbar
          height="220px"
          class="rounded-lg border border-border-secondary"
          @scroll="onScroll"
        >
          <div class="space-y-3 p-4">
            <p v-for="i in 30" :key="i" class="m-0 text-sm text-text">
              第 {{ i }} 行 — 滚动时上方会实时显示 scrollTop / scrollLeft
            </p>
          </div>
        </Scrollbar>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">end-reached 事件</h3>
          <p class="section-description">滚动到达边缘时触发，可用于无限加载</p>
        </div>
      </div>

      <div class="demo-block">
        <div class="mb-3 text-xs text-text-secondary">
          到达边缘: <span class="font-mono text-primary">{{ endReachedDir || '-' }}</span>
        </div>
        <Scrollbar
          height="220px"
          :distance="20"
          class="rounded-lg border border-border-secondary"
          @end-reached="onEndReached"
        >
          <div class="space-y-3 p-4">
            <p v-for="i in 30" :key="i" class="m-0 text-sm text-text">
              第 {{ i }} 行 — 滚动到距离边缘 20px 内时触发 end-reached 事件
            </p>
          </div>
        </Scrollbar>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">方法调用</h3>
          <p class="section-description">通过 ref 调用滚动条的方法</p>
        </div>
      </div>

      <div class="demo-block">
        <div class="mb-3 flex flex-wrap gap-2">
          <Button size="small" @click="scrollToTop">scrollTo 顶部</Button>
          <Button size="small" @click="scrollToBottom">scrollTo 底部</Button>
          <Button size="small" @click="scrollToMiddle">setScrollTop 50%</Button>
          <Button size="small" @click="updateScrollbar">手动 update</Button>
        </div>
        <Scrollbar
          ref="scrollbarRef"
          height="220px"
          class="rounded-lg border border-border-secondary"
        >
          <div class="space-y-3 p-4">
            <p v-for="i in 30" :key="i" class="m-0 text-sm text-text">
              第 {{ i }} 行 — 点击上方按钮控制滚动位置
            </p>
          </div>
        </Scrollbar>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Button } from 'antdv-next';
import type { ScrollbarDirection, ScrollbarInstance } from '@package/common-ui';
import { Scrollbar } from '@package/common-ui';

defineOptions({ name: 'EventsExample' });

const scrollbarRef = ref<ScrollbarInstance>();
const scrollInfo = ref({ scrollTop: 0, scrollLeft: 0 });
const endReachedDir = ref<ScrollbarDirection | ''>('');

const onScroll = ({ scrollTop, scrollLeft }: { scrollTop: number; scrollLeft: number }) => {
  scrollInfo.value = { scrollTop, scrollLeft };
};

const onEndReached = (dir: ScrollbarDirection) => {
  endReachedDir.value = dir;
  setTimeout(() => {
    endReachedDir.value = '';
  }, 2000);
};

const scrollToTop = () => {
  scrollbarRef.value?.scrollTo({ top: 0, behavior: 'smooth' });
};

const scrollToBottom = () => {
  const wrap = scrollbarRef.value?.wrapRef;
  if (wrap) {
    scrollbarRef.value?.scrollTo({ top: wrap.scrollHeight, behavior: 'smooth' });
  }
};

const scrollToMiddle = () => {
  const wrap = scrollbarRef.value?.wrapRef;
  if (wrap) {
    scrollbarRef.value?.setScrollTop(Math.floor((wrap.scrollHeight - wrap.clientHeight) / 2));
  }
};

const updateScrollbar = () => {
  scrollbarRef.value?.update();
};
</script>

<style scoped>
.example-container {
  display: grid;
  gap: 24px;
}

.example-section {
  border: 1px solid var(--ant-color-border-secondary);
  border-radius: 8px;
  background: var(--ant-color-bg-container);
  padding: 20px;
}

.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.section-title {
  margin: 0;
  color: var(--ant-color-text);
  font-size: 16px;
  font-weight: 600;
}

.section-description {
  margin: 4px 0 0;
  color: var(--ant-color-text-secondary);
  font-size: 13px;
}

.demo-block {
  border-top: 1px solid var(--ant-color-border-secondary);
  padding-top: 16px;
}
</style>
