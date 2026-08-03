<template>
  <div class="h-full overflow-auto bg-fill-quaternary">
    <header class="border-b border-border-secondary bg-container px-4 py-5 sm:px-6">
      <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <div>
          <div class="mb-2 flex items-center gap-2">
            <Tag color="blue">COMMON UI</Tag>
            <span class="text-xs text-text-tertiary">DynamicButton</span>
          </div>
          <h1 class="m-0 text-2xl font-semibold text-text">动态按钮</h1>
          <p class="mt-1 mb-0 text-sm text-text-secondary">
            用一份配置统一直接操作、二次确认、Modal、Drawer 与异步生命周期。
          </p>
        </div>

        <div class="grid grid-cols-4 gap-2 text-center">
          <div
            v-for="item in overview"
            :key="item.label"
            class="min-w-16 rounded-lg bg-fill-quaternary px-3 py-2"
          >
            <div class="text-base font-semibold text-text">{{ item.value }}</div>
            <div class="text-xs text-text-secondary">{{ item.label }}</div>
          </div>
        </div>
      </div>
    </header>

    <main class="mx-auto grid max-w-7xl gap-4 p-4 sm:p-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div class="grid min-w-0 gap-4">
        <section class="demo-card">
          <div class="demo-card__header">
            <div>
              <h2 class="demo-card__title">基础与异步操作</h2>
              <p class="demo-card__description">
                `click` 适合刷新、导出和状态切换；Promise 执行期间自动 loading 并阻止重复点击。
              </p>
            </div>
            <Tag>action.type = click</Tag>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <DynamicButton ref="quickActionButton" :config="quickActionConfig" />
            <Button @click="quickActionButton?.trigger()">主动触发刷新</Button>
            <DynamicButton :config="asyncActionConfig" />
            <DynamicButton :config="externalLoadingConfig" />
            <DynamicButton :config="disabledActionConfig" />
            <DynamicButton :config="errorActionConfig" />
          </div>

          <div
            class="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-border-secondary pt-4 text-xs text-text-secondary"
          >
            <span>最近刷新：{{ lastRefreshedAt }}</span>
            <span>导出批次：{{ lastExportBatch }}</span>
            <span>错误按钮用于演示 `error` 事件</span>
          </div>
        </section>

        <section class="demo-card">
          <div class="demo-card__header">
            <div>
              <h2 class="demo-card__title">列表行操作与二次确认</h2>
              <p class="demo-card__description">
                `record` 驱动动态文案和禁用状态；确认、取消都支持异步回调。
              </p>
            </div>
            <Tag color="orange">action.type = confirm</Tag>
          </div>

          <div class="overflow-hidden rounded-lg border border-border-secondary">
            <div
              v-for="member in members"
              :key="member.id"
              class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border-secondary px-4 py-3 last:border-b-0"
            >
              <div class="flex min-w-0 items-center gap-3">
                <Avatar :style="{ backgroundColor: member.avatarColor }">
                  {{ member.name.slice(0, 1) }}
                </Avatar>
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="truncate text-sm font-medium text-text">
                      {{ member.name }}
                    </span>
                    <Tag :color="member.enabled ? 'green' : 'default'">
                      {{ member.enabled ? '已启用' : '已停用' }}
                    </Tag>
                  </div>
                  <div class="mt-0.5 truncate text-xs text-text-secondary">
                    {{ member.department }} · {{ member.role }}
                  </div>
                </div>
              </div>

              <DynamicButton :config="toggleMemberConfig" :record="member" />
            </div>
          </div>
          <p class="mt-3 mb-0 text-xs text-text-tertiary">
            管理员账号通过 `disabled({ record })` 禁止停用。
          </p>
        </section>

        <section class="grid gap-4 lg:grid-cols-2">
          <div class="demo-card">
            <div class="demo-card__header">
              <div>
                <h2 class="demo-card__title">Modal 编辑表单</h2>
                <p class="demo-card__description">
                  异步加载默认值，内容组件通过 `validate()` 返回最终提交值。
                </p>
              </div>
              <Tag color="purple">modal</Tag>
            </div>

            <div class="rounded-lg bg-fill-quaternary p-4">
              <div class="mb-4 flex items-center gap-3">
                <Avatar :style="{ backgroundColor: selectedMember.avatarColor }" :size="42">
                  {{ selectedMember.name.slice(0, 1) }}
                </Avatar>
                <div>
                  <div class="font-medium text-text">
                    {{ selectedMember.name }}
                  </div>
                  <div class="text-xs text-text-secondary">
                    {{ selectedMember.email }}
                  </div>
                </div>
              </div>
              <DynamicButton :config="editMemberConfig" :record="selectedMember" />
            </div>
          </div>

          <div class="demo-card">
            <div class="demo-card__header">
              <div>
                <h2 class="demo-card__title">Drawer 新建表单</h2>
                <p class="demo-card__description">
                  同一内容组件复用于 Drawer，并可定制底部按钮文案和属性。
                </p>
              </div>
              <Tag color="cyan">drawer</Tag>
            </div>

            <div class="flex min-h-31 flex-col justify-between rounded-lg bg-fill-quaternary p-4">
              <p class="mt-0 text-sm text-text-secondary">
                适合信息较多、需要保留页面上下文的新增或编辑任务。
              </p>
              <DynamicButton :config="createMemberConfig" />
            </div>
          </div>
        </section>

        <section class="demo-card">
          <div class="demo-card__header">
            <div>
              <h2 class="demo-card__title">常用配置速查</h2>
              <p class="demo-card__description">
                外观、数据和行为保持分层，配置可直接用于表格操作列。
              </p>
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div v-for="item in configTips" :key="item.key" class="config-tip">
              <code>{{ item.key }}</code>
              <span>{{ item.description }}</span>
            </div>
          </div>
        </section>
      </div>

      <aside class="min-w-0 xl:sticky xl:top-4 xl:self-start">
        <section class="demo-card">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h2 class="demo-card__title">生命周期事件</h2>
              <p class="demo-card__description">实时观察打开、加载、成功、取消和错误事件。</p>
            </div>
            <Button :disabled="!eventLogs.length" size="small" type="text" @click="clearLogs">
              清空
            </Button>
          </div>

          <div class="mt-4 grid grid-cols-2 gap-2">
            <div class="event-stat">
              <span>进行中</span>
              <strong>{{ activeTasks }}</strong>
            </div>
            <div class="event-stat">
              <span>弹层打开</span>
              <strong>{{ openedLayers }}</strong>
            </div>
          </div>

          <div v-if="eventLogs.length" class="mt-4 grid max-h-130 gap-2 overflow-auto pr-1">
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
        </section>
      </aside>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, h, reactive, ref } from 'vue';
import { Avatar, Button, Empty, Tag, message } from 'antdv-next';
import {
  DeleteOutlined,
  EditOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  UserAddOutlined,
} from '@antdv-next/icons';

import type {
  DynamicButtonApi,
  DynamicButtonCancelPayload,
  DynamicButtonConfig,
  DynamicButtonErrorPayload,
  DynamicButtonHandlers,
  DynamicButtonLoadingPayload,
  DynamicButtonOpenPayload,
  DynamicButtonSuccessPayload,
} from '@package/common-ui';
import { DynamicButton } from '@package/common-ui';

import MemberEditor from './components/member-editor.vue';
import type { MemberEditorValue } from './types';

defineOptions({ name: 'DemoDynamicButton' });

interface DemoMember extends MemberEditorValue {
  avatarColor: string;
  id: number;
}

/** 导出行为在打开前生成的批次号。 */
interface ExportBatch {
  batch: string;
}

/** 二次确认在打开前预取的目标状态。 */
interface ToggleResult {
  nextEnabled: boolean;
}

type EventName = 'cancel' | 'error' | 'loading' | 'open' | 'success';

interface EventLog {
  event: EventName;
  id: number;
  summary: string;
  time: string;
}

const overview = [
  { label: '行为类型', value: '4' },
  { label: '生命周期', value: '5' },
  { label: '默认值', value: 'Async' },
  { label: '表单协议', value: 'v-model' },
];

const configTips = [
  { key: 'label / icon', description: '静态或基于 record 动态渲染文案，并配置图标。' },
  {
    key: 'buttonProps / confirmProps',
    description: '按容器透传 Button、Popconfirm、Modal、Drawer 原生属性。',
  },
  { key: 'getDefaultValue', description: '打开前异步加载数据，失败会进入 error 事件。' },
  { key: 'submit / cancel', description: '统一 Promise 流程，内置 loading 与并发保护。' },
];

const eventColors: Record<EventName, string> = {
  success: 'green',
  error: 'red',
  cancel: 'orange',
  loading: 'blue',
  open: 'purple',
};

const members = reactive<DemoMember[]>([
  {
    id: 1,
    name: '林默',
    email: 'lin.mo@example.com',
    department: '前端研发',
    role: '管理员',
    remark: '负责前端架构与体验规范',
    enabled: true,
    avatarColor: '#1677ff',
  },
  {
    id: 2,
    name: '周宁',
    email: 'zhou.ning@example.com',
    department: '产品设计',
    role: '编辑者',
    remark: '负责工作台和设计系统',
    enabled: true,
    avatarColor: '#722ed1',
  },
  {
    id: 3,
    name: '陈一',
    email: 'chen.yi@example.com',
    department: '数据平台',
    role: '只读成员',
    remark: '负责数据质量巡检',
    enabled: false,
    avatarColor: '#13c2c2',
  },
]);

const eventLogs = ref<EventLog[]>([]);
const activeTasks = ref(0);
const openedLayers = ref(0);
const logId = ref(0);
const lastRefreshedAt = ref('尚未刷新');
const lastExportBatch = ref('-');

const selectedMember = computed(() => members[1] ?? members[0]!);
const quickActionButton = ref<DynamicButtonApi>();

/** 六种配置共用同一套日志回调；回调只读取 payload 的公共字段，与各自的泛型无关。 */
const buttonHandlers: DynamicButtonHandlers<unknown, unknown> = {
  onSuccess: handleSuccess,
  onError: handleError,
  onCancel: handleCancel,
  onLoadingChange: handleLoadingChange,
  onOpenChange: handleOpenChange,
};

const quickActionConfig: DynamicButtonConfig = {
  label: '刷新数据',
  icon: ReloadOutlined,
  buttonProps: { type: 'primary' },
  ...buttonHandlers,
  action: {
    type: 'click',
    submit: () => {
      lastRefreshedAt.value = formatTime();
    },
  },
};

const asyncActionConfig: DynamicButtonConfig<void, ExportBatch> = {
  label: '异步导出',
  icon: ThunderboltOutlined,
  buttonProps: { color: 'primary', variant: 'outlined' },
  ...buttonHandlers,
  action: {
    type: 'click',
    getDefaultValue: async () => {
      await delay(500);
      return { batch: `EXP-${Date.now().toString().slice(-6)}` };
    },
    submit: async ({ value }) => {
      await delay(900);
      lastExportBatch.value = value?.batch ?? '-';
    },
  },
};

const externalLoadingConfig: DynamicButtonConfig = {
  label: '外部 Loading',
  buttonProps: { loading: { delay: 200 }, type: 'dashed' },
  ...buttonHandlers,
  action: { type: 'click', submit: () => undefined },
};

const disabledActionConfig: DynamicButtonConfig = {
  label: '无权限操作',
  disabled: true,
  action: { type: 'click', submit: () => undefined },
};

const errorActionConfig: DynamicButtonConfig = {
  label: '模拟失败',
  buttonProps: { danger: true, type: 'text' },
  ...buttonHandlers,
  action: {
    type: 'click',
    submit: async () => {
      await delay(500);
      throw new Error('服务暂时不可用，请稍后重试');
    },
  },
};

const toggleMemberConfig: DynamicButtonConfig<DemoMember, ToggleResult> = {
  label: ({ record }) => (record?.enabled ? '停用账号' : '启用账号'),
  icon: DeleteOutlined,
  disabled: ({ record }) => record?.role === '管理员',
  buttonProps: { danger: true, size: 'small', type: 'text' },
  ...buttonHandlers,
  action: {
    type: 'confirm',
    confirmProps: {
      title: '确认变更账号状态？',
      description: '操作会立即生效，之后仍可再次切换。',
      okText: '确认变更',
      cancelText: '再想想',
      okButtonProps: { danger: true },
    },
    getDefaultValue: async ({ record }) => {
      await delay(300);
      return { nextEnabled: !record?.enabled };
    },
    submit: async ({ record, value }) => {
      await delay(700);
      const member = members.find((item) => item.id === record?.id);
      if (member && value) member.enabled = value.nextEnabled;
    },
    cancel: async () => {
      await delay(250);
    },
  },
};

const editMemberConfig: DynamicButtonConfig<DemoMember, MemberEditorValue> = {
  label: ({ record }) => `编辑 ${record?.name ?? '成员'}`,
  icon: EditOutlined,
  buttonProps: { block: true, type: 'primary' },
  ...buttonHandlers,
  action: {
    type: 'modal',
    component: MemberEditor,
    componentProps: ({ record }) => ({
      mode: 'edit',
      description: `默认值来自 record：${record?.department ?? '-'}`,
    }),
    footerExtra: ({ phase, value }) =>
      h(
        Button,
        {
          disabled: phase !== null,
          onClick: () => {
            message.info(`当前编辑：${value?.name || '未命名成员'}`);
          },
        },
        { default: () => '预览' },
      ),
    modalProps: {
      title: '编辑成员',
      width: 620,
      centered: true,
      okText: '保存修改',
      cancelText: '取消',
    },
    getDefaultValue: async ({ record }) => {
      await delay(500);
      return toEditorValue(record);
    },
    submit: async ({ record, value }) => {
      await delay(900);
      const member = members.find((item) => item.id === record?.id);
      if (!member || !value) throw new Error('成员数据格式不正确');
      Object.assign(member, value);
    },
    cancel: async () => {
      await delay(200);
    },
  },
};

const createMemberConfig: DynamicButtonConfig<void, MemberEditorValue> = {
  label: '新建成员',
  icon: UserAddOutlined,
  buttonProps: { block: true, type: 'primary' },
  ...buttonHandlers,
  action: {
    type: 'drawer',
    component: MemberEditor,
    componentProps: {
      mode: 'create',
      description: 'Drawer 复用同一表单组件，并使用独立的初始值。',
    },
    drawerProps: {
      title: '新建成员',
      placement: 'right',
      size: 'large',
      okText: '创建成员',
      cancelText: '暂不创建',
      okButtonProps: { type: 'primary' },
    },
    getDefaultValue: async () => {
      await delay(400);
      return createEmptyEditorValue();
    },
    submit: async ({ value }) => {
      await delay(900);
      if (!value) throw new Error('成员数据格式不正确');
      members.push({
        ...value,
        id: Math.max(...members.map((item) => item.id)) + 1,
        avatarColor: '#52c41a',
      });
    },
    cancel: async () => {
      await delay(200);
    },
  },
};

function handleSuccess(payload: DynamicButtonSuccessPayload<unknown, unknown>): void {
  addLog('success', `${payload.type} 执行成功${formatRecord(payload.record)}`);
  message.success(`${actionName[payload.type]}成功`);
}

function handleError(payload: DynamicButtonErrorPayload<unknown, unknown>): void {
  const errorMessage = payload.error instanceof Error ? payload.error.message : '未知错误';
  addLog('error', `${payload.type} 在 ${payload.phase} 阶段失败：${errorMessage}`);
  message.error(errorMessage);
}

function handleCancel(payload: DynamicButtonCancelPayload<unknown, unknown>): void {
  addLog(
    'cancel',
    `${payload.type} 已取消，来源：${payload.reason}${formatRecord(payload.record)}`,
  );
}

function handleLoadingChange(payload: DynamicButtonLoadingPayload<unknown>): void {
  activeTasks.value = payload.loading ? 1 : 0;
  addLog(
    'loading',
    `${payload.type} · ${payload.phase ?? 'idle'} · ${payload.loading ? '开始' : '结束'}`,
  );
}

function handleOpenChange(payload: DynamicButtonOpenPayload<unknown>): void {
  openedLayers.value = Math.max(0, openedLayers.value + (payload.open ? 1 : -1));
  addLog(
    'open',
    `${payload.type} ${payload.open ? '已打开' : '已关闭'}${formatRecord(payload.record)}`,
  );
}

function addLog(event: EventName, summary: string): void {
  eventLogs.value.unshift({ id: ++logId.value, event, summary, time: formatTime() });
  eventLogs.value = eventLogs.value.slice(0, 30);
}

function clearLogs(): void {
  eventLogs.value = [];
}

/** 日志面板不关心 record 的具体类型，只在存在 name 字段时补一段后缀。 */
function formatRecord(record: unknown): string {
  if (!record || typeof record !== 'object') return '';
  const name = (record as { name?: unknown }).name;
  return typeof name === 'string' ? ` · ${name}` : '';
}

function formatTime(): string {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date());
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function createEmptyEditorValue(): MemberEditorValue {
  return { name: '', email: '', department: '', role: '', remark: '', enabled: true };
}

/** 编辑弹层的初始值直接取自当前行，字段类型由 DemoMember 保证。 */
function toEditorValue(member: DemoMember | undefined): MemberEditorValue {
  if (!member) return createEmptyEditorValue();

  const { name, email, department, role, remark, enabled } = member;

  return { name, email, department, role, remark, enabled };
}

const actionName: Record<DynamicButtonSuccessPayload['type'], string> = {
  click: '操作',
  confirm: '状态变更',
  modal: '保存',
  drawer: '创建',
};
</script>

<style scoped>
.demo-card {
  min-width: 0;
  border: 1px solid var(--ant-color-border-secondary);
  border-radius: 12px;
  background: var(--ant-color-bg-container);
  padding: 20px;
  box-shadow: 0 1px 2px rgb(0 0 0 / 2%);
}

.demo-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.demo-card__title {
  margin: 0;
  color: var(--ant-color-text);
  font-size: 16px;
  font-weight: 600;
}

.demo-card__description {
  margin: 4px 0 0;
  color: var(--ant-color-text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.config-tip {
  display: grid;
  gap: 8px;
  border-radius: 8px;
  background: var(--ant-color-fill-quaternary);
  padding: 14px;
}

.config-tip code {
  color: var(--ant-color-primary);
  font-size: 12px;
  font-weight: 600;
}

.config-tip span {
  color: var(--ant-color-text-secondary);
  font-size: 12px;
  line-height: 1.6;
}

.event-stat {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 8px;
  background: var(--ant-color-fill-quaternary);
  padding: 10px 12px;
  color: var(--ant-color-text-secondary);
  font-size: 12px;
}

.event-stat strong {
  color: var(--ant-color-primary);
  font-size: 16px;
}

.event-log {
  border: 1px solid var(--ant-color-border-secondary);
  border-radius: 8px;
  padding: 10px;
}

@media (max-width: 640px) {
  .demo-card {
    padding: 16px;
  }

  .demo-card__header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
