<template>
  <div class="example-container">
    <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div class="space-y-6">
        <section class="example-section">
          <div class="section-header">
            <div>
              <h3 class="section-title">事件监听</h3>
              <p class="section-description">监听按钮操作的各个生命周期事件</p>
            </div>
          </div>

          <div class="demo-block">
            <div class="flex flex-wrap gap-3">
              <DynamicButton :config="successConfig" />
              <DynamicButton :config="errorConfig" />
              <DynamicButton :config="cancelConfig" />
              <DynamicButton :config="modalConfig" />
            </div>
            <div class="mt-4 text-xs text-text-tertiary">操作按钮查看右侧事件日志</div>
          </div>
        </section>

        <section class="example-section">
          <div class="section-header">
            <div>
              <h3 class="section-title">可用事件</h3>
              <p class="section-description">DynamicButton 支持的所有生命周期事件</p>
            </div>
          </div>

          <div class="demo-block">
            <div class="grid gap-3 sm:grid-cols-2">
              <div v-for="event in eventDocs" :key="event.name" class="event-doc">
                <code class="event-name">{{ event.name }}</code>
                <div class="event-desc">{{ event.description }}</div>
                <div class="event-timing">触发时机：{{ event.timing }}</div>
              </div>
            </div>
          </div>
        </section>

        <section class="example-section">
          <div class="section-header">
            <div>
              <h3 class="section-title">事件顺序示例</h3>
              <p class="section-description">观察不同操作类型的事件触发顺序</p>
            </div>
          </div>

          <div class="demo-block">
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <DynamicButton :config="clickFlowConfig" />
                <span class="text-xs text-text-tertiary">
                  loading(true) → loading(false) → success
                </span>
              </div>
              <div class="flex items-center gap-3">
                <DynamicButton :config="modalFlowConfig" />
                <span class="text-xs text-text-tertiary">
                  open → loading(true) → loading(false) → loading(true) → loading(false) → success →
                  open(false)
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <aside class="xl:sticky xl:top-4 xl:self-start">
        <section class="example-section">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h3 class="section-title">事件日志</h3>
              <p class="section-description">实时观察事件触发</p>
            </div>
            <Button :disabled="!eventLogs.length" size="small" type="text" @click="clearLogs">
              清空
            </Button>
          </div>

          <div class="demo-block">
            <div class="mb-3 grid grid-cols-2 gap-2">
              <div class="event-stat">
                <span>进行中</span>
                <strong>{{ activeTasks }}</strong>
              </div>
              <div class="event-stat">
                <span>弹层打开</span>
                <strong>{{ openedLayers }}</strong>
              </div>
            </div>

            <div v-if="eventLogs.length" class="max-h-130 space-y-2 overflow-auto">
              <div v-for="log in eventLogs" :key="log.id" class="event-log">
                <div class="flex items-center justify-between gap-3">
                  <Tag :color="eventColors[log.event]" class="m-0">{{ log.event }}</Tag>
                  <time class="text-xs text-text-tertiary">{{ log.time }}</time>
                </div>
                <p class="mt-2 mb-0 text-xs leading-5 text-text-secondary">
                  {{ log.summary }}
                </p>
              </div>
            </div>

            <Empty v-else :image="Empty.PRESENTED_IMAGE_SIMPLE" description="操作按钮后查看事件" />
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Button, Empty, Tag, message } from 'antdv-next';
import { CheckOutlined, CloseOutlined, FormOutlined, ThunderboltOutlined } from '@antdv-next/icons';
import type {
  DynamicButtonCancelPayload,
  DynamicButtonConfig,
  DynamicButtonErrorPayload,
  DynamicButtonLoadingPayload,
  DynamicButtonOpenPayload,
  DynamicButtonSuccessPayload,
} from '@package/common-ui';
import { DynamicButton } from '@package/common-ui';

import UserForm from '../components/user-form.vue';

defineOptions({ name: 'LifecycleExample' });

type EventName = 'cancel' | 'error' | 'loading' | 'open' | 'success';

interface EventLog {
  event: EventName;
  id: number;
  summary: string;
  time: string;
}

const eventLogs = ref<EventLog[]>([]);
const activeTasks = ref(0);
const openedLayers = ref(0);
const logId = ref(0);

const eventColors: Record<EventName, string> = {
  success: 'green',
  error: 'red',
  cancel: 'orange',
  loading: 'blue',
  open: 'purple',
};

const eventDocs = [
  {
    name: 'onSuccess',
    description: '操作成功完成',
    timing: 'submit 返回的 Promise resolve 后',
  },
  {
    name: 'onError',
    description: '操作执行失败',
    timing: 'getDefaultValue 或 submit 抛出异常时',
  },
  {
    name: 'onCancel',
    description: '用户取消操作',
    timing: '点击取消按钮或关闭弹层时',
  },
  {
    name: 'onLoadingChange',
    description: 'Loading 状态变化',
    timing: '异步操作开始/结束时',
  },
  {
    name: 'onOpenChange',
    description: '弹层打开/关闭',
    timing: 'Modal/Drawer 显示/隐藏时',
  },
];

const successConfig: DynamicButtonConfig = {
  label: '成功操作',
  icon: CheckOutlined,
  buttonProps: { type: 'primary' },
  onSuccess: handleSuccess,
  onLoadingChange: handleLoadingChange,
  action: {
    type: 'click',
    submit: async () => {
      await delay(800);
    },
  },
};

const errorConfig: DynamicButtonConfig = {
  label: '失败操作',
  icon: CloseOutlined,
  buttonProps: { danger: true },
  onError: handleError,
  onLoadingChange: handleLoadingChange,
  action: {
    type: 'click',
    submit: async () => {
      await delay(600);
      throw new Error('模拟操作失败');
    },
  },
};

const cancelConfig: DynamicButtonConfig = {
  label: '可取消操作',
  buttonProps: { type: 'dashed' },
  onCancel: handleCancel,
  onLoadingChange: handleLoadingChange,
  action: {
    type: 'confirm',
    confirmProps: {
      title: '确认执行？',
      description: '点击取消测试 cancel 事件',
    },
    submit: async () => {
      await delay(600);
    },
    cancel: async () => {
      await delay(300);
    },
  },
};

const modalConfig: DynamicButtonConfig<void, { name: string }> = {
  label: 'Modal 完整流程',
  icon: FormOutlined,
  onSuccess: handleSuccess,
  onError: handleError,
  onCancel: handleCancel,
  onLoadingChange: handleLoadingChange,
  onOpenChange: handleOpenChange,
  action: {
    type: 'modal',
    component: UserForm,
    modalProps: {
      title: '测试 Modal 事件',
      width: 500,
    },
    getDefaultValue: async () => {
      await delay(800);
      return { name: '', email: '', department: '', role: '' };
    },
    submit: async () => {
      await delay(1000);
    },
  },
};

const clickFlowConfig: DynamicButtonConfig = {
  label: 'Click 事件流',
  icon: ThunderboltOutlined,
  onLoadingChange: handleLoadingChange,
  onSuccess: handleSuccess,
  action: {
    type: 'click',
    submit: async () => {
      await delay(1000);
    },
  },
};

const modalFlowConfig: DynamicButtonConfig<void, { name: string }> = {
  label: 'Modal 事件流',
  onOpenChange: handleOpenChange,
  onLoadingChange: handleLoadingChange,
  onSuccess: handleSuccess,
  action: {
    type: 'modal',
    component: UserForm,
    modalProps: { title: '事件流示例', width: 500 },
    getDefaultValue: async () => {
      await delay(500);
      return { name: '', email: '', department: '', role: '' };
    },
    submit: async () => {
      await delay(800);
    },
  },
};

function handleSuccess(payload: DynamicButtonSuccessPayload<unknown, unknown>): void {
  addLog('success', `${payload.type} 执行成功`);
  message.success('操作成功');
}

function handleError(payload: DynamicButtonErrorPayload<unknown, unknown>): void {
  const errorMessage = payload.error instanceof Error ? payload.error.message : '未知错误';
  addLog('error', `${payload.type} 在 ${payload.phase} 阶段失败：${errorMessage}`);
  message.error(errorMessage);
}

function handleCancel(payload: DynamicButtonCancelPayload<unknown, unknown>): void {
  addLog('cancel', `${payload.type} 已取消，来源：${payload.reason}`);
}

function handleLoadingChange(payload: DynamicButtonLoadingPayload<unknown>): void {
  activeTasks.value = payload.loading ? activeTasks.value + 1 : Math.max(0, activeTasks.value - 1);
  addLog(
    'loading',
    `${payload.type} · ${payload.phase ?? 'idle'} · ${payload.loading ? '开始' : '结束'}`,
  );
}

function handleOpenChange(payload: DynamicButtonOpenPayload<unknown>): void {
  openedLayers.value = Math.max(0, openedLayers.value + (payload.open ? 1 : -1));
  addLog('open', `${payload.type} ${payload.open ? '已打开' : '已关闭'}`);
}

function addLog(event: EventName, summary: string): void {
  eventLogs.value.unshift({ id: ++logId.value, event, summary, time: formatTime() });
  eventLogs.value = eventLogs.value.slice(0, 30);
}

function clearLogs(): void {
  eventLogs.value = [];
  activeTasks.value = 0;
  openedLayers.value = 0;
}

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
  min-width: 0;
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

.event-doc {
  display: grid;
  gap: 6px;
  border-radius: 6px;
  background: var(--ant-color-fill-quaternary);
  padding: 12px;
}

.event-name {
  color: var(--ant-color-primary);
  font-size: 13px;
  font-weight: 600;
}

.event-desc {
  color: var(--ant-color-text);
  font-size: 12px;
}

.event-timing {
  color: var(--ant-color-text-tertiary);
  font-size: 11px;
}

.event-stat {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 6px;
  background: var(--ant-color-fill-quaternary);
  padding: 8px 10px;
  color: var(--ant-color-text-secondary);
  font-size: 12px;
}

.event-stat strong {
  color: var(--ant-color-primary);
  font-size: 16px;
}

.event-log {
  border: 1px solid var(--ant-color-border-secondary);
  border-radius: 6px;
  padding: 10px;
}
</style>
