<template>
  <div class="demo-page">
    <header class="demo-header">
      <div class="demo-header__content">
        <div>
          <div class="mb-2 flex items-center gap-2">
            <Tag color="blue">COMMON UI</Tag>
            <span class="text-xs text-text-tertiary">DynamicForm</span>
          </div>
          <h1 class="demo-header__title">动态表单组件</h1>
          <p class="demo-header__description">
            Schema 驱动的表单组件，支持动态字段、自定义组件、异步数据和复杂验证
          </p>
        </div>
      </div>
    </header>

    <main class="demo-content">
      <Tabs v-model:active-key="activeTab" type="card" class="demo-tabs">
        <TabPane key="basic" tab="基础表单">
          <BasicExample />
        </TabPane>
        <TabPane key="dynamic" tab="动态字段">
          <DynamicExample />
        </TabPane>
        <TabPane key="custom" tab="自定义组件">
          <CustomExample />
        </TabPane>
        <TabPane key="list" tab="List 子表单">
          <ListExample />
        </TabPane>
        <TabPane key="async" tab="异步请求">
          <AsyncExample />
        </TabPane>
        <TabPane key="validation" tab="表单验证">
          <ValidationExample />
        </TabPane>
      </Tabs>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Tag, Tabs, TabPane } from 'antdv-next';

import BasicExample from './examples/basic.vue';
import DynamicExample from './examples/dynamic.vue';
import CustomExample from './examples/custom.vue';
import ListExample from './examples/list.vue';
import AsyncExample from './examples/async.vue';
import ValidationExample from './examples/validation.vue';

defineOptions({ name: 'DemoDynamicForm' });

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
