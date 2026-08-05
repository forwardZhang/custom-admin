<template>
  <div class="example-container">
    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">基础二次确认</h3>
          <p class="section-description">操作前弹出 Popconfirm，用户确认后执行</p>
        </div>
        <Tag color="orange">action.type = confirm</Tag>
      </div>

      <div class="demo-block">
        <div class="flex flex-wrap items-center gap-3">
          <DynamicButton :config="deleteConfig" />
          <DynamicButton :config="archiveConfig" />
        </div>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">列表行操作</h3>
          <p class="section-description">基于 record 动态生成确认文案和禁用状态</p>
        </div>
      </div>

      <div class="demo-block">
        <div class="rounded-lg border border-border-secondary">
          <div
            v-for="member in members"
            :key="member.id"
            class="flex items-center justify-between gap-4 border-b border-border-secondary px-4 py-3 last:border-b-0"
          >
            <div class="flex min-w-0 items-center gap-3">
              <Avatar :style="{ backgroundColor: member.color }">
                {{ member.name.slice(0, 1) }}
              </Avatar>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium text-text">{{ member.name }}</span>
                  <Tag :color="member.enabled ? 'green' : 'default'">
                    {{ member.enabled ? '启用' : '停用' }}
                  </Tag>
                </div>
                <div class="text-xs text-text-secondary">{{ member.role }}</div>
              </div>
            </div>
            <DynamicButton :config="toggleMemberConfig" :record="member" />
          </div>
        </div>
        <div class="mt-3 text-xs text-text-tertiary">管理员账号禁止停用</div>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">异步加载确认信息</h3>
          <p class="section-description">通过 getDefaultValue 在打开前预取数据</p>
        </div>
      </div>

      <div class="demo-block">
        <div class="space-y-3">
          <div
            v-for="task in tasks"
            :key="task.id"
            class="flex items-center justify-between rounded-lg border border-border-secondary p-3"
          >
            <div>
              <div class="font-medium text-text">{{ task.name }}</div>
              <div class="text-xs text-text-secondary">依赖任务：{{ task.dependencies }}</div>
            </div>
            <DynamicButton :config="stopTaskConfig" :record="task" />
          </div>
        </div>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">自定义确认框</h3>
          <p class="section-description">通过 confirmProps 自定义按钮文案、样式等</p>
        </div>
      </div>

      <div class="demo-block">
        <div class="flex flex-wrap items-center gap-3">
          <DynamicButton :config="dangerConfig" />
          <DynamicButton :config="warningConfig" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { Avatar, Tag, message } from 'antdv-next';
import { DeleteOutlined, StopOutlined, WarningOutlined } from '@antdv-next/icons';
import type { DynamicButtonConfig } from '@package/common-ui';
import { DynamicButton } from '@package/common-ui';

defineOptions({ name: 'ConfirmExample' });

interface Member {
  id: number;
  name: string;
  role: string;
  enabled: boolean;
  color: string;
}

interface Task {
  id: number;
  name: string;
  dependencies: number;
}

interface ToggleResult {
  nextEnabled: boolean;
}

interface TaskInfo {
  canStop: boolean;
  reason?: string;
}

const members = reactive<Member[]>([
  { id: 1, name: '林默', role: '管理员', enabled: true, color: '#1677ff' },
  { id: 2, name: '周宁', role: '编辑者', enabled: true, color: '#722ed1' },
  { id: 3, name: '陈一', role: '只读成员', enabled: false, color: '#13c2c2' },
]);

const tasks = reactive<Task[]>([
  { id: 1, name: '数据同步任务', dependencies: 0 },
  { id: 2, name: '报表生成任务', dependencies: 2 },
  { id: 3, name: '备份任务', dependencies: 1 },
]);

const deleteConfig: DynamicButtonConfig = {
  label: '删除数据',
  icon: DeleteOutlined,
  buttonProps: { danger: true },
  action: {
    type: 'confirm',
    confirmProps: {
      title: '确认删除？',
      description: '删除后数据无法恢复',
      okText: '确认删除',
      okButtonProps: { danger: true },
    },
    submit: async () => {
      await delay(800);
      message.success('已删除');
    },
  },
};

const archiveConfig: DynamicButtonConfig = {
  label: '归档',
  buttonProps: { type: 'dashed' },
  action: {
    type: 'confirm',
    confirmProps: {
      title: '确认归档？',
      description: '归档后可在归档列表中找回',
    },
    submit: async () => {
      await delay(600);
      message.success('已归档');
    },
  },
};

const toggleMemberConfig: DynamicButtonConfig<Member, ToggleResult> = {
  label: ({ record }) => (record?.enabled ? '停用' : '启用'),
  icon: DeleteOutlined,
  disabled: ({ record }) => record?.role === '管理员',
  buttonProps: { danger: true, size: 'small', type: 'text' },
  action: {
    type: 'confirm',
    confirmProps: {
      title: '确认变更账号状态？',
      description: '操作会立即生效，之后仍可再次切换',
      okText: '确认变更',
      okButtonProps: { danger: true },
    },
    getDefaultValue: async ({ record }) => {
      await delay(300);
      return { nextEnabled: !record?.enabled };
    },
    submit: async ({ record, value }) => {
      await delay(700);
      const member = members.find((m) => m.id === record?.id);
      if (member && value) {
        member.enabled = value.nextEnabled;
        message.success(`已${value.nextEnabled ? '启用' : '停用'} ${member.name}`);
      }
    },
  },
};

const stopTaskConfig: DynamicButtonConfig<Task, TaskInfo> = {
  label: '停止任务',
  icon: StopOutlined,
  buttonProps: { danger: true, size: 'small' },
  action: {
    type: 'confirm',
    confirmProps: ({ value }) => ({
      title: '确认停止任务？',
      description: value?.canStop ? '停止后需要手动重启' : (value?.reason ?? '无法停止'),
      okButtonProps: { danger: true, disabled: !value?.canStop },
    }),
    getDefaultValue: async ({ record }) => {
      await delay(500);
      const canStop = (record?.dependencies ?? 0) === 0;
      return {
        canStop,
        reason: canStop ? undefined : '该任务有其他任务依赖，无法停止',
      };
    },
    submit: async ({ record, value }) => {
      if (!value?.canStop) return;
      await delay(800);
      message.success(`任务 ${record?.name} 已停止`);
    },
  },
};

const dangerConfig: DynamicButtonConfig = {
  label: '危险操作',
  icon: WarningOutlined,
  buttonProps: { danger: true },
  action: {
    type: 'confirm',
    confirmProps: {
      title: '⚠️ 这是一个危险操作',
      description: '此操作不可逆，请谨慎确认',
      okText: '我已知晓风险',
      cancelText: '放弃操作',
      okButtonProps: { danger: true },
    },
    submit: async () => {
      await delay(1000);
      message.warning('危险操作已执行');
    },
  },
};

const warningConfig: DynamicButtonConfig = {
  label: '警告操作',
  buttonProps: { type: 'dashed' },
  action: {
    type: 'confirm',
    confirmProps: {
      title: '继续操作？',
      description: '此操作会影响多个关联数据',
      okText: '继续',
      cancelText: '取消',
    },
    submit: async () => {
      await delay(600);
      message.info('操作已完成');
    },
  },
};

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
