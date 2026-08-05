<template>
  <div class="demo-page">
    <header class="demo-header">
      <div class="demo-header__content">
        <div>
          <div class="mb-2 flex items-center gap-2">
            <Tag color="blue">COMMON UI</Tag>
            <span class="text-xs text-text-tertiary">DynamicButton</span>
          </div>
          <h1 class="demo-header__title">动态按钮组件</h1>
          <p class="demo-header__description">
            统一处理直接操作、二次确认、Modal、Drawer 与异步生命周期的按钮组件
          </p>
        </div>
      </div>
    </header>

    <main class="demo-content">
      <Tabs v-model:active-key="activeTab" type="card" class="demo-tabs">
        <TabPane key="basic" tab="基础用法">
          <BasicExample />
        </TabPane>
        <TabPane key="confirm" tab="二次确认">
          <ConfirmExample />
        </TabPane>
        <TabPane key="modal" tab="Modal 表单">
          <ModalExample />
        </TabPane>
        <TabPane key="drawer" tab="Drawer 表单">
          <DrawerExample />
        </TabPane>
        <TabPane key="lifecycle" tab="生命周期">
          <LifecycleExample />
        </TabPane>
      </Tabs>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Tag, Tabs, TabPane } from 'antdv-next';

import BasicExample from './examples/basic.vue';
import ConfirmExample from './examples/confirm.vue';
import ModalExample from './examples/modal.vue';
import DrawerExample from './examples/drawer.vue';
import LifecycleExample from './examples/lifecycle.vue';

defineOptions({ name: 'DemoDynamicButton' });

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
