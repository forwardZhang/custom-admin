<template>
  <div class="demo-page">
    <header class="demo-header">
      <div class="demo-header__content">
        <div>
          <div class="mb-2 flex items-center gap-2">
            <Tag color="blue">COMMON UI</Tag>
            <span class="text-xs text-text-tertiary">Scrollbar</span>
          </div>
          <h1 class="demo-header__title">滚动条组件</h1>
          <p class="demo-header__description">
            自定义滚动条组件，替代浏览器原生滚动条，提供更好的视觉体验
          </p>
        </div>
      </div>
    </header>

    <main class="demo-content">
      <Tabs v-model:active-key="activeTab" type="card" class="demo-tabs">
        <TabPane key="basic" tab="基础用法">
          <BasicExample />
        </TabPane>
        <TabPane key="options" tab="配置选项">
          <OptionsExample />
        </TabPane>
        <TabPane key="events" tab="事件与方法">
          <EventsExample />
        </TabPane>
        <TabPane key="custom" tab="自定义样式">
          <CustomExample />
        </TabPane>
      </Tabs>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Tag, Tabs, TabPane } from 'antdv-next';

import BasicExample from './examples/basic.vue';
import OptionsExample from './examples/options.vue';
import EventsExample from './examples/events.vue';
import CustomExample from './examples/custom.vue';

defineOptions({ name: 'DemoScrollbar' });

const activeTab = ref('basic');
</script>

<style scoped>
.demo-page {
  height: 100%;
  overflow: auto;
  background: var(--ant-color-fill-quaternary);
}

.demo-header {
  border-bottom: 1px solid var(--ant-color-border-secondary);
  background: var(--ant-color-bg-container);
  padding: 24px;
}

.demo-header__content {
  max-width: 1280px;
  margin: 0 auto;
}

.demo-header__title {
  margin: 0;
  color: var(--ant-color-text);
  font-size: 24px;
  font-weight: 600;
}

.demo-header__description {
  margin: 8px 0 0;
  color: var(--ant-color-text-secondary);
  font-size: 14px;
}

.demo-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px;
}

.demo-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 20px;
}

.demo-tabs :deep(.ant-tabs-content) {
  min-height: 400px;
}
</style>
