<template>
  <div class="example-container">
    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">Click 操作</h3>
          <p class="section-description">适合刷新、导出等不需要用户确认的即时操作</p>
        </div>
        <Tag>action.type = click</Tag>
      </div>

      <div class="demo-block">
        <div class="flex flex-wrap items-center gap-3">
          <DynamicButton ref="refreshButton" :config="refreshConfig" />
          <Button @click="refreshButton?.trigger()">程序触发</Button>
          <DynamicButton :config="exportConfig" />
        </div>
        <div class="mt-4 text-sm text-text-secondary">
          <div>最近刷新：{{ lastRefresh }}</div>
          <div>导出批次：{{ exportBatch }}</div>
        </div>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">异步操作与 Loading</h3>
          <p class="section-description">Promise 执行期间自动显示 loading 并阻止重复点击</p>
        </div>
      </div>

      <div class="demo-block">
        <div class="flex flex-wrap items-center gap-3">
          <DynamicButton :config="asyncConfig" />
          <DynamicButton :config="slowConfig" />
        </div>
        <div class="mt-4 text-sm text-text-secondary">异步操作完成后会自动恢复按钮状态</div>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">禁用与错误处理</h3>
          <p class="section-description">
            通过 disabled 控制按钮状态，submit 返回 rejected Promise 触发错误
          </p>
        </div>
      </div>

      <div class="demo-block">
        <div class="flex flex-wrap items-center gap-3">
          <DynamicButton :config="disabledConfig" />
          <DynamicButton :config="errorConfig" />
        </div>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">动态配置</h3>
          <p class="section-description">基于 record 动态生成按钮文案和禁用状态</p>
        </div>
      </div>

      <div class="demo-block">
        <div class="space-y-3">
          <div
            v-for="item in items"
            :key="item.id"
            class="flex items-center justify-between rounded-lg border border-border-secondary p-3"
          >
            <div>
              <div class="font-medium text-text">{{ item.name }}</div>
              <div class="text-xs text-text-secondary">{{ item.description }}</div>
            </div>
            <DynamicButton :config="itemActionConfig" :record="item" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Button, Tag, message } from 'antdv-next';
import { ReloadOutlined, ExportOutlined, ThunderboltOutlined } from '@antdv-next/icons';
import type { DynamicButtonApi, DynamicButtonConfig } from '@package/common-ui';
import { DynamicButton } from '@package/common-ui';

defineOptions({ name: 'BasicExample' });

interface DemoItem {
  id: number;
  name: string;
  description: string;
  processing: boolean;
}

const lastRefresh = ref('尚未刷新');
const exportBatch = ref('-');
const refreshButton = ref<DynamicButtonApi>();

const items = ref<DemoItem[]>([
  { id: 1, name: '任务 A', description: '可以执行', processing: false },
  { id: 2, name: '任务 B', description: '处理中，禁止操作', processing: true },
  { id: 3, name: '任务 C', description: '可以执行', processing: false },
]);

const refreshConfig: DynamicButtonConfig = {
  label: '刷新数据',
  icon: ReloadOutlined,
  buttonProps: { type: 'primary' },
  action: {
    type: 'click',
    submit: async () => {
      await delay(300);
      lastRefresh.value = formatTime();
      message.success('刷新完成');
    },
  },
};

/** getDefaultValue 有返回值时，TValue 要在泛型上声明，submit 才能读到它。 */
const exportConfig: DynamicButtonConfig<void, { batch: string }> = {
  label: '导出数据',
  icon: ExportOutlined,
  buttonProps: { color: 'primary', variant: 'outlined' },
  action: {
    type: 'click',
    getDefaultValue: async () => {
      await delay(500);
      return { batch: `EXP-${Date.now().toString().slice(-6)}` };
    },
    submit: async ({ value }) => {
      await delay(800);
      exportBatch.value = value?.batch ?? '-';
      message.success('导出成功');
    },
  },
};

const asyncConfig: DynamicButtonConfig = {
  label: '异步操作',
  icon: ThunderboltOutlined,
  action: {
    type: 'click',
    submit: async () => {
      await delay(1500);
      message.success('操作完成');
    },
  },
};

const slowConfig: DynamicButtonConfig = {
  label: '慢速操作 (3s)',
  buttonProps: { type: 'dashed' },
  action: {
    type: 'click',
    submit: async () => {
      await delay(3000);
      message.success('慢速操作完成');
    },
  },
};

const disabledConfig: DynamicButtonConfig = {
  label: '无权限操作',
  disabled: true,
  action: {
    type: 'click',
    submit: () => undefined,
  },
};

const errorConfig: DynamicButtonConfig = {
  label: '模拟失败',
  buttonProps: { danger: true },
  action: {
    type: 'click',
    submit: async () => {
      await delay(500);
      throw new Error('服务暂时不可用，请稍后重试');
    },
  },
  onError: ({ error }) => {
    const msg = error instanceof Error ? error.message : '未知错误';
    message.error(msg);
  },
};

const itemActionConfig: DynamicButtonConfig<DemoItem> = {
  label: ({ record }) => (record?.processing ? '处理中...' : '执行任务'),
  disabled: ({ record }) => record?.processing ?? false,
  buttonProps: { size: 'small' },
  action: {
    type: 'click',
    submit: async ({ record }) => {
      await delay(1000);
      message.success(`任务 ${record?.name} 执行完成`);
    },
  },
};

function formatTime(): string {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date());
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
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
