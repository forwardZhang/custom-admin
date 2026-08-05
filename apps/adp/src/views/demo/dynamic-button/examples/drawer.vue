<template>
  <div class="example-container">
    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">基础 Drawer 表单</h3>
          <p class="section-description">从右侧滑出 Drawer，适合内容较多的表单</p>
        </div>
        <Tag color="cyan">action.type = drawer</Tag>
      </div>

      <div class="demo-block">
        <div class="rounded-lg bg-fill-quaternary p-4">
          <p class="mt-0 mb-4 text-sm text-text-secondary">
            Drawer 适合信息较多、需要保留页面上下文的新增或编辑任务
          </p>
          <DynamicButton :config="createUserConfig" />
        </div>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">不同方向与尺寸</h3>
          <p class="section-description">通过 drawerProps 控制 Drawer 的展示方式</p>
        </div>
      </div>

      <div class="demo-block">
        <div class="flex flex-wrap gap-3">
          <DynamicButton :config="rightDrawerConfig" />
          <DynamicButton :config="leftDrawerConfig" />
          <DynamicButton :config="largeDrawerConfig" />
        </div>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">列表批量编辑</h3>
          <p class="section-description">基于 record 传递上下文数据到 Drawer</p>
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
            <DynamicButton :config="editItemConfig" :record="item" />
          </div>
        </div>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">复杂表单示例</h3>
          <p class="section-description">Drawer 中可以放置更复杂的多步骤表单</p>
        </div>
      </div>

      <div class="demo-block">
        <DynamicButton :config="complexFormConfig" />
        <div class="mt-3 text-xs text-text-tertiary">支持多标签页、步骤条等复杂布局</div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { Tag, message } from 'antdv-next';
import { UserAddOutlined, EditOutlined, FormOutlined } from '@antdv-next/icons';
import type { DynamicButtonConfig } from '@package/common-ui';
import { DynamicButton } from '@package/common-ui';

import UserForm from '../components/user-form.vue';

defineOptions({ name: 'DrawerExample' });

interface Item {
  id: number;
  name: string;
  description: string;
}

interface UserFormData {
  name: string;
  email: string;
  department: string;
  role: string;
}

const items = reactive<Item[]>([
  { id: 1, name: '配置项 A', description: '系统基础配置' },
  { id: 2, name: '配置项 B', description: '高级功能设置' },
  { id: 3, name: '配置项 C', description: '权限管理配置' },
]);

const createUserConfig: DynamicButtonConfig<void, UserFormData> = {
  label: '新建用户',
  icon: UserAddOutlined,
  buttonProps: { type: 'primary', block: true },
  action: {
    type: 'drawer',
    component: UserForm,
    drawerProps: {
      title: '新建用户',
      placement: 'right',
      size: 'large',
      okText: '创建',
      cancelText: '取消',
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

const rightDrawerConfig: DynamicButtonConfig<void, UserFormData> = {
  label: '右侧 Drawer',
  action: {
    type: 'drawer',
    component: UserForm,
    drawerProps: {
      title: '从右侧滑出',
      placement: 'right',
      width: 480,
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

const leftDrawerConfig: DynamicButtonConfig<void, UserFormData> = {
  label: '左侧 Drawer',
  action: {
    type: 'drawer',
    component: UserForm,
    drawerProps: {
      title: '从左侧滑出',
      placement: 'left',
      width: 480,
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

const largeDrawerConfig: DynamicButtonConfig<void, UserFormData> = {
  label: '大尺寸 Drawer',
  action: {
    type: 'drawer',
    component: UserForm,
    drawerProps: {
      title: '大尺寸表单',
      placement: 'right',
      size: 'large',
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

const editItemConfig: DynamicButtonConfig<Item, UserFormData> = {
  label: '编辑',
  icon: EditOutlined,
  buttonProps: { size: 'small', type: 'link' },
  action: {
    type: 'drawer',
    component: UserForm,
    componentProps: ({ record }) => ({
      itemName: record?.name,
    }),
    drawerProps: ({ record }) => ({
      title: `编辑 ${record?.name ?? '配置'}`,
      placement: 'right',
      width: 520,
    }),
    getDefaultValue: async ({ record }) => {
      await delay(500);
      return {
        name: record?.name ?? '',
        email: `${record?.id}@example.com`,
        department: '默认部门',
        role: '编辑者',
      };
    },
    submit: async ({ record, value }) => {
      await delay(800);
      const item = items.find((i) => i.id === record?.id);
      if (item && value) {
        item.name = value.name;
        message.success('保存成功');
      }
    },
  },
};

const complexFormConfig: DynamicButtonConfig<void, UserFormData> = {
  label: '复杂表单',
  icon: FormOutlined,
  buttonProps: { type: 'primary' },
  action: {
    type: 'drawer',
    component: UserForm,
    componentProps: {
      showComplex: true,
    },
    drawerProps: {
      title: '复杂多步骤表单',
      placement: 'right',
      size: 'large',
      okText: '完成',
    },
    getDefaultValue: () => ({
      name: '',
      email: '',
      department: '',
      role: '',
    }),
    submit: async () => {
      await delay(1000);
      message.success('表单提交成功');
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
