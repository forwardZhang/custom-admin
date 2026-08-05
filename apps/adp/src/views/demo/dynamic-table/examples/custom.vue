<template>
  <div class="example-container">
    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">自定义单元格渲染</h3>
          <p class="section-description">使用 bodyCell 插槽自定义单元格内容</p>
        </div>
      </div>

      <div class="demo-block">
        <CellRenderTable :columns="columns1" :request="loadUsers">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'user'">
              <div class="flex items-center gap-3">
                <Avatar :style="{ backgroundColor: getAvatarColor(record.id) }">
                  {{ record.name.slice(0, 1) }}
                </Avatar>
                <div>
                  <div class="text-sm font-medium text-text">{{ record.name }}</div>
                  <div class="text-xs text-text-tertiary">{{ record.email }}</div>
                </div>
              </div>
            </template>
            <template v-else-if="column.key === 'status'">
              <Tag :color="record.status === 'active' ? 'green' : 'default'">
                {{ record.status === 'active' ? '启用' : '停用' }}
              </Tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <Space>
                <Button size="small" type="link" @click="handleEdit(record)">编辑</Button>
                <Button size="small" type="link" danger @click="handleDelete(record)">删除</Button>
              </Space>
            </template>
          </template>
        </CellRenderTable>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">带进度条的列</h3>
          <p class="section-description">在单元格中显示进度条、图表等复杂内容</p>
        </div>
      </div>

      <div class="demo-block">
        <ProgressTable :columns="columns2" :request="loadProgress">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'progress'">
              <div class="space-y-1">
                <div class="flex items-center justify-between text-xs">
                  <span>{{ record.progress }}%</span>
                  <span class="text-text-tertiary">{{ record.completed }}/{{ record.total }}</span>
                </div>
                <Progress :percent="record.progress" :show-info="false" size="small" />
              </div>
            </template>
            <template v-else-if="column.key === 'status'">
              <Tag :color="getStatusColor(record.progress)">
                {{ getStatusText(record.progress) }}
              </Tag>
            </template>
          </template>
        </ProgressTable>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">可展开的行</h3>
          <p class="section-description">使用 expandedRowRender 显示额外的详细信息</p>
        </div>
      </div>

      <div class="demo-block">
        <ExpandableTable :columns="columns3" :request="loadUsers">
          <template #expandedRowRender="{ record }">
            <div class="rounded-lg bg-fill-quaternary p-4">
              <div class="grid gap-3 sm:grid-cols-2">
                <div class="text-sm">
                  <span class="text-text-tertiary">邮箱：</span>
                  <span class="text-text">{{ record.email }}</span>
                </div>
                <div class="text-sm">
                  <span class="text-text-tertiary">部门：</span>
                  <span class="text-text">{{ record.department }}</span>
                </div>
                <div class="text-sm">
                  <span class="text-text-tertiary">状态：</span>
                  <Tag :color="record.status === 'active' ? 'green' : 'default'" size="small">
                    {{ record.status === 'active' ? '启用' : '停用' }}
                  </Tag>
                </div>
                <div class="text-sm">
                  <span class="text-text-tertiary">创建时间：</span>
                  <span class="text-text">{{ record.createdAt }}</span>
                </div>
              </div>
            </div>
          </template>
        </ExpandableTable>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">固定列</h3>
          <p class="section-description">通过 fixed 属性固定列在左侧或右侧</p>
        </div>
      </div>

      <div class="demo-block">
        <FixedColumnTable :columns="columns4" :request="loadUsers" :scroll="{ x: 1200 }">
          <template #bodyCell="{ column }">
            <template v-if="column.key === 'action'">
              <Button size="small" type="link">操作</Button>
            </template>
          </template>
        </FixedColumnTable>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { TableProps } from 'antdv-next';
import { Avatar, Button, Progress, Space, Tag, message } from 'antdv-next';
import type { DynamicTableRequest } from '@package/common-ui';
import { useDynamicTable } from '@package/common-ui';

defineOptions({ name: 'CustomExample' });

interface User {
  id: number;
  name: string;
  email: string;
  department: string;
  status: 'active' | 'disabled';
  createdAt: string;
}

interface ProgressItem {
  id: number;
  name: string;
  progress: number;
  completed: number;
  total: number;
}

/**
 * 每个 useDynamicTable() 只持有一个实例引用，四个示例各自调用一次。
 * 各自绑定自己的行类型，插槽里的 record 才能推断出正确的字段。
 */
const [CellRenderTable] = useDynamicTable<User>();
const [ProgressTable] = useDynamicTable<ProgressItem>();
const [ExpandableTable] = useDynamicTable<User>();
const [FixedColumnTable] = useDynamicTable<User>();

const columns1: TableProps<User>['columns'] = [
  { title: '用户', key: 'user', width: 250 },
  { title: '部门', dataIndex: 'department', key: 'department', width: 150 },
  { title: '状态', key: 'status', width: 100 },
  { title: '操作', key: 'action', width: 150, fixed: 'right' },
];

const columns2: TableProps<ProgressItem>['columns'] = [
  { title: '任务名称', dataIndex: 'name', key: 'name', width: 200 },
  { title: '进度', key: 'progress', width: 200 },
  { title: '状态', key: 'status', width: 100 },
];

const columns3: TableProps<User>['columns'] = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '姓名', dataIndex: 'name', key: 'name', width: 150 },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 180 },
];

const columns4: TableProps<User>['columns'] = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80, fixed: 'left' },
  { title: '姓名', dataIndex: 'name', key: 'name', width: 150, fixed: 'left' },
  { title: '邮箱', dataIndex: 'email', key: 'email', width: 250 },
  { title: '部门', dataIndex: 'department', key: 'department', width: 150 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 180 },
  { title: '操作', key: 'action', width: 100, fixed: 'right' },
];

const mockUsers: User[] = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  name: `用户 ${i + 1}`,
  email: `user${i + 1}@example.com`,
  department: ['技术部', '产品部', '设计部', '运营部'][i % 4]!,
  status: i % 3 === 0 ? 'disabled' : 'active',
  createdAt: `2024-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
}));

const mockProgress: ProgressItem[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: `任务 ${i + 1}`,
  progress: Math.floor(Math.random() * 100),
  completed: Math.floor(Math.random() * 50),
  total: 50,
}));

const loadUsers: DynamicTableRequest<User> = async (context) => {
  await delay(500);
  const start = (context.current - 1) * context.pageSize;
  const end = start + context.pageSize;
  return {
    list: mockUsers.slice(start, end),
    total: mockUsers.length,
  };
};

const loadProgress: DynamicTableRequest<ProgressItem> = async (context) => {
  await delay(500);
  const start = (context.current - 1) * context.pageSize;
  const end = start + context.pageSize;
  return {
    list: mockProgress.slice(start, end),
    total: mockProgress.length,
  };
};

function getAvatarColor(id: number): string {
  const colors = ['#1677ff', '#722ed1', '#13c2c2', '#52c41a', '#fa8c16'];
  return colors[id % colors.length]!;
}

function getStatusColor(progress: number): string {
  if (progress === 100) return 'success';
  if (progress >= 50) return 'processing';
  if (progress > 0) return 'warning';
  return 'default';
}

function getStatusText(progress: number): string {
  if (progress === 100) return '已完成';
  if (progress >= 50) return '进行中';
  if (progress > 0) return '待处理';
  return '未开始';
}

function handleEdit(record: User): void {
  message.info(`编辑用户：${record.name}`);
}

function handleDelete(record: User): void {
  message.warning(`删除用户：${record.name}`);
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
