<template>
  <div class="example-container">
    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">最简单的表格</h3>
          <p class="section-description">提供 columns 和 request 即可渲染表格</p>
        </div>
      </div>

      <div class="demo-block">
        <DynamicTable :columns="simpleColumns" :request="loadSimpleData" />
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">带标题和工具栏</h3>
          <p class="section-description">使用 title 和 toolbar 插槽自定义表格头部</p>
        </div>
      </div>

      <div class="demo-block">
        <DynamicTable :columns="columns" :request="loadUsers">
          <template #title>
            <div>
              <h4 class="m-0 text-base font-semibold text-text">用户列表</h4>
              <p class="mt-1 mb-0 text-xs text-text-secondary">管理系统用户账号</p>
            </div>
          </template>

          <template #toolbar-right>
            <Button type="primary" @click="handleAdd">
              <template #icon><PlusOutlined /></template>
              新增用户
            </Button>
          </template>

          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <Tag :color="record.status === 'active' ? 'green' : 'default'">
                {{ record.status === 'active' ? '启用' : '停用' }}
              </Tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <Button size="small" type="link" @click="handleEdit(record)">编辑</Button>
            </template>
          </template>
        </DynamicTable>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">加载状态与空状态</h3>
          <p class="section-description">自动处理加载中、空数据、加载失败等状态</p>
        </div>
      </div>

      <div class="demo-block">
        <div class="mb-4 flex gap-2">
          <Button @click="dataMode = 'normal'">正常数据</Button>
          <Button @click="dataMode = 'empty'">空数据</Button>
          <Button @click="dataMode = 'slow'">慢速加载</Button>
          <Button @click="dataMode = 'error'">加载失败</Button>
        </div>

        <DynamicTable
          :columns="simpleColumns"
          :request="loadDynamicData"
          @request-error="handleError"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { TableProps } from 'antdv-next';
import { Button, Tag, message } from 'antdv-next';
import { PlusOutlined } from '@antdv-next/icons';
import type { DynamicTableRequest } from '@package/common-ui';
import { useDynamicTable } from '@package/common-ui';

defineOptions({ name: 'BasicExample' });

interface User {
  id: number;
  name: string;
  email: string;
  department: string;
  status: 'active' | 'disabled';
}

type DataMode = 'normal' | 'empty' | 'slow' | 'error';

const dataMode = ref<DataMode>('normal');

const [DynamicTable] = useDynamicTable<User>();

const simpleColumns: TableProps<User>['columns'] = [
  { title: '姓名', dataIndex: 'name', key: 'name' },
  { title: '邮箱', dataIndex: 'email', key: 'email' },
  { title: '部门', dataIndex: 'department', key: 'department' },
];

const columns: TableProps<User>['columns'] = [
  { title: '姓名', dataIndex: 'name', key: 'name', width: 120 },
  { title: '邮箱', dataIndex: 'email', key: 'email', width: 200 },
  { title: '部门', dataIndex: 'department', key: 'department', width: 150 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '操作', key: 'action', width: 100, fixed: 'right' },
];

const mockUsers: User[] = [
  { id: 1, name: '张三', email: 'zhang.san@example.com', department: '技术部', status: 'active' },
  { id: 2, name: '李四', email: 'li.si@example.com', department: '产品部', status: 'active' },
  { id: 3, name: '王五', email: 'wang.wu@example.com', department: '设计部', status: 'disabled' },
  { id: 4, name: '赵六', email: 'zhao.liu@example.com', department: '运营部', status: 'active' },
  { id: 5, name: '钱七', email: 'qian.qi@example.com', department: '技术部', status: 'active' },
];

const loadSimpleData: DynamicTableRequest<User> = async () => {
  await delay(300);
  return { list: mockUsers };
};

const loadUsers: DynamicTableRequest<User> = async (context) => {
  await delay(500);
  const start = (context.current - 1) * context.pageSize;
  const end = start + context.pageSize;
  return {
    list: mockUsers.slice(start, end),
    total: mockUsers.length,
  };
};

const loadDynamicData: DynamicTableRequest<User> = async () => {
  const mode = dataMode.value;

  if (mode === 'slow') {
    await delay(3000);
  } else if (mode === 'error') {
    await delay(500);
    throw new Error('网络请求失败');
  } else {
    await delay(500);
  }

  if (mode === 'empty') {
    return { list: [] };
  }

  return { list: mockUsers };
};

function handleAdd(): void {
  message.info('点击了新增按钮');
}

function handleEdit(record: User): void {
  message.info(`编辑用户：${record.name}`);
}

function handleError(error: unknown): void {
  const text = error instanceof Error ? error.message : '加载失败';
  message.error(text);
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
