<template>
  <div class="demo-page">
    <header class="demo-header">
      <div class="demo-header__content">
        <div>
          <div class="mb-2 flex items-center gap-2">
            <Tag color="blue">COMMON UI</Tag>
            <span class="text-xs text-text-tertiary">DynamicTable</span>
          </div>
          <h1 class="demo-header__title">动态表格组件</h1>
          <p class="demo-header__description">
            支持本地分页和远程分页的表格组件，内置搜索、排序、筛选和批量操作
          </p>
        </div>
      </div>
    </header>

    <main class="demo-content">
      <Tabs v-model:active-key="activeTab" type="card" class="demo-tabs">
        <TabPane key="basic" tab="基础用法">
          <BasicExample />
        </TabPane>
        <TabPane key="pagination" tab="分页模式">
          <PaginationExample />
        </TabPane>
        <TabPane key="selection" tab="行选择">
          <SelectionExample />
        </TabPane>
        <TabPane key="custom" tab="自定义列">
          <CustomExample />
        </TabPane>
        <TabPane key="toolbar" tab="工具栏">
          <ToolbarExample />
        </TabPane>
      </Tabs>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Tag, Tabs, TabPane } from 'antdv-next';

import BasicExample from './examples/basic.vue';
import PaginationExample from './examples/pagination.vue';
import SelectionExample from './examples/selection.vue';
import CustomExample from './examples/custom.vue';
import ToolbarExample from './examples/toolbar.vue';

defineOptions({ name: 'DemoDynamicTable' });

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
