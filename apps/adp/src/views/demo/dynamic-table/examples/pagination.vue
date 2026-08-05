<template>
  <div class="example-container">
    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">本地分页模式</h3>
          <p class="section-description">paginationMode="local"，前端处理分页、排序、筛选</p>
        </div>
        <Tag color="blue">Local</Tag>
      </div>

      <div class="demo-block">
        <DynamicTable :columns="columns" pagination-mode="local" :request="loadAllData" />
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">远程分页模式</h3>
          <p class="section-description">paginationMode="server"，后端处理分页、排序、筛选</p>
        </div>
        <Tag color="purple">Server</Tag>
      </div>

      <div class="demo-block">
        <DynamicTable :columns="columns" pagination-mode="server" :request="loadPagedData" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { TableProps } from 'antdv-next';
import { Tag } from 'antdv-next';
import type { DynamicTableRequest } from '@package/common-ui';
import { useDynamicTable } from '@package/common-ui';

defineOptions({ name: 'PaginationExample' });

interface User {
  id: number;
  name: string;
  email: string;
  department: string;
}

const [DynamicTable] = useDynamicTable<User>();

const columns: TableProps<User>['columns'] = [
  { title: '姓名', dataIndex: 'name', key: 'name', sorter: true },
  { title: '邮箱', dataIndex: 'email', key: 'email' },
  { title: '部门', dataIndex: 'department', key: 'department' },
];

const mockUsers: User[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `用户 ${i + 1}`,
  email: `user${i + 1}@example.com`,
  department: ['技术部', '产品部', '设计部'][i % 3]!,
}));

const loadAllData: DynamicTableRequest<User> = async () => {
  await delay(500);
  return { list: mockUsers };
};

const loadPagedData: DynamicTableRequest<User> = async (context) => {
  await delay(500);
  const start = (context.current - 1) * context.pageSize;
  const end = start + context.pageSize;
  return {
    list: mockUsers.slice(start, end),
    total: mockUsers.length,
  };
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
