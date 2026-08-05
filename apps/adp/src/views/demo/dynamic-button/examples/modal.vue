<template>
  <div class="example-container">
    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">基础 Modal 表单</h3>
          <p class="section-description">点击按钮打开 Modal，编辑表单后提交</p>
        </div>
        <Tag color="purple">action.type = modal</Tag>
      </div>

      <div class="demo-block">
        <div class="rounded-lg bg-fill-quaternary p-4">
          <div class="mb-4 flex items-center gap-3">
            <Avatar :style="{ backgroundColor: currentUser.color }" :size="48">
              {{ currentUser.name.slice(0, 1) }}
            </Avatar>
            <div>
              <div class="font-medium text-text">{{ currentUser.name }}</div>
              <div class="text-xs text-text-secondary">{{ currentUser.email }}</div>
            </div>
          </div>
          <DynamicButton :config="editUserConfig" :record="currentUser" />
        </div>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">异步加载默认值</h3>
          <p class="section-description">通过 getDefaultValue 在打开 Modal 前加载数据</p>
        </div>
      </div>

      <div class="demo-block">
        <DynamicButton :config="editWithLoadingConfig" :record="currentUser" />
        <div class="mt-3 text-xs text-text-tertiary">打开时会显示加载状态</div>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">自定义 Modal 属性</h3>
          <p class="section-description">通过 modalProps 自定义标题、尺寸、按钮等</p>
        </div>
      </div>

      <div class="demo-block">
        <div class="flex flex-wrap gap-3">
          <DynamicButton :config="largeModalConfig" />
          <DynamicButton :config="centeredModalConfig" />
          <DynamicButton :config="customFooterConfig" />
        </div>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">表单验证</h3>
          <p class="section-description">内容组件通过 validate() 返回验证后的数据</p>
        </div>
      </div>

      <div class="demo-block">
        <DynamicButton :config="validatedFormConfig" />
        <div class="mt-3 text-xs text-text-tertiary">提交前会先调用表单的 validate 方法</div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { h, reactive } from 'vue';
import { Avatar, Button, Tag, message } from 'antdv-next';
import { EditOutlined } from '@antdv-next/icons';
import type { DynamicButtonConfig } from '@package/common-ui';
import { DynamicButton } from '@package/common-ui';

import UserForm from '../components/user-form.vue';

defineOptions({ name: 'ModalExample' });

interface User {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  color: string;
}

interface UserFormData {
  name: string;
  email: string;
  department: string;
  role: string;
}

const currentUser = reactive<User>({
  id: 1,
  name: '林默',
  email: 'lin.mo@example.com',
  department: '前端研发',
  role: '管理员',
  color: '#1677ff',
});

const editUserConfig: DynamicButtonConfig<User, UserFormData> = {
  label: '编辑信息',
  icon: EditOutlined,
  buttonProps: { type: 'primary', block: true },
  action: {
    type: 'modal',
    component: UserForm,
    modalProps: {
      title: '编辑用户信息',
      width: 560,
      okText: '保存',
    },
    getDefaultValue: ({ record }) => ({
      name: record?.name ?? '',
      email: record?.email ?? '',
      department: record?.department ?? '',
      role: record?.role ?? '',
    }),
    submit: async ({ value }) => {
      await delay(800);
      if (value) {
        Object.assign(currentUser, value);
        message.success('保存成功');
      }
    },
  },
};

const editWithLoadingConfig: DynamicButtonConfig<User, UserFormData> = {
  label: '编辑（异步加载）',
  icon: EditOutlined,
  buttonProps: { type: 'primary' },
  action: {
    type: 'modal',
    component: UserForm,
    modalProps: {
      title: '编辑用户信息',
      width: 560,
    },
    getDefaultValue: async ({ record }) => {
      await delay(1500); // 模拟从服务器加载
      return {
        name: record?.name ?? '',
        email: record?.email ?? '',
        department: record?.department ?? '',
        role: record?.role ?? '',
      };
    },
    submit: async ({ value }) => {
      await delay(800);
      if (value) {
        Object.assign(currentUser, value);
        message.success('保存成功');
      }
    },
  },
};

const largeModalConfig: DynamicButtonConfig<void, UserFormData> = {
  label: '大尺寸 Modal',
  action: {
    type: 'modal',
    component: UserForm,
    modalProps: {
      title: '大尺寸表单',
      width: 800,
      okText: '提交',
    },
    getDefaultValue: () => ({
      name: '',
      email: '',
      department: '',
      role: '',
    }),
    submit: async () => {
      await delay(600);
      message.success('提交成功');
    },
  },
};

const centeredModalConfig: DynamicButtonConfig<void, UserFormData> = {
  label: '居中 Modal',
  action: {
    type: 'modal',
    component: UserForm,
    modalProps: {
      title: '居中显示',
      width: 560,
      centered: true,
    },
    getDefaultValue: () => ({
      name: '',
      email: '',
      department: '',
      role: '',
    }),
    submit: async () => {
      await delay(600);
      message.success('提交成功');
    },
  },
};

const customFooterConfig: DynamicButtonConfig<void, UserFormData> = {
  label: '自定义底部',
  action: {
    type: 'modal',
    component: UserForm,
    modalProps: {
      title: '自定义底部按钮',
      width: 560,
      okText: '立即保存',
      cancelText: '放弃修改',
      okButtonProps: { danger: true },
    },
    footerExtra: ({ phase, value }) =>
      h(
        Button,
        {
          disabled: phase !== null,
          onClick: () => {
            message.info(`当前编辑：${value?.name || '未填写'}`);
          },
        },
        { default: () => '预览' },
      ),
    getDefaultValue: () => ({
      name: '',
      email: '',
      department: '',
      role: '',
    }),
    submit: async () => {
      await delay(600);
      message.success('保存成功');
    },
  },
};

const validatedFormConfig: DynamicButtonConfig<void, UserFormData> = {
  label: '带验证的表单',
  buttonProps: { type: 'primary' },
  action: {
    type: 'modal',
    component: UserForm,
    componentProps: {
      showValidation: true,
    },
    modalProps: {
      title: '填写用户信息',
      width: 560,
    },
    getDefaultValue: () => ({
      name: '',
      email: '',
      department: '',
      role: '',
    }),
    submit: async ({ value }) => {
      await delay(800);
      message.success(`已创建用户：${value?.name}`);
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
