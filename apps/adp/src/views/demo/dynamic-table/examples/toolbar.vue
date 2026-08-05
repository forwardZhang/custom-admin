<template>
  <div class="example-container">
    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">基础工具栏</h3>
          <p class="section-description">使用 title 和 toolbar-right 插槽自定义标题和右侧按钮</p>
        </div>
      </div>

      <div class="demo-block">
        <BasicToolbarTable :columns="columns" :request="loadUsers">
          <template #title>
            <div>
              <h4 class="m-0 text-base font-semibold text-text">用户管理</h4>
              <p class="mt-1 mb-0 text-xs text-text-secondary">管理系统用户和权限</p>
            </div>
          </template>

          <template #toolbar-right>
            <Space>
              <Button @click="handleRefresh">
                <template #icon><ReloadOutlined /></template>
                刷新
              </Button>
              <Button type="primary" @click="handleAdd">
                <template #icon><PlusOutlined /></template>
                新增用户
              </Button>
            </Space>
          </template>
        </BasicToolbarTable>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">带搜索的工具栏</h3>
          <p class="section-description">在工具栏中添加搜索框和筛选器</p>
        </div>
      </div>

      <div class="demo-block">
        <SearchToolbarTable :columns="columns" :request="loadUsersWithSearch">
          <template #toolbar-left>
            <Space>
              <Input
                v-model:value="keyword"
                allow-clear
                placeholder="搜索姓名或邮箱"
                style="width: 240px"
                @press-enter="handleSearch"
              >
                <template #prefix><SearchOutlined /></template>
              </Input>
              <Button @click="handleSearch">搜索</Button>
              <Button @click="handleReset">重置</Button>
            </Space>
          </template>

          <template #toolbar-right>
            <Space>
              <Select
                v-model:value="department"
                allow-clear
                placeholder="筛选部门"
                style="width: 150px"
                @change="handleDepartmentChange"
              >
                <SelectOption value="tech">技术部</SelectOption>
                <SelectOption value="product">产品部</SelectOption>
                <SelectOption value="design">设计部</SelectOption>
              </Select>
              <Button type="primary" @click="handleAdd">
                <template #icon><PlusOutlined /></template>
                新增
              </Button>
            </Space>
          </template>
        </SearchToolbarTable>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">带统计信息的工具栏</h3>
          <p class="section-description">在标题区域展示统计数据</p>
        </div>
      </div>

      <div class="demo-block">
        <StatsToolbarTable :columns="columns" :request="loadUsers">
          <template #title>
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 class="m-0 text-base font-semibold text-text">用户列表</h4>
                <p class="mt-1 mb-0 text-xs text-text-secondary">共 {{ stats.total }} 人</p>
              </div>
              <div class="flex gap-4">
                <div class="text-center">
                  <div class="text-lg font-semibold text-success">{{ stats.active }}</div>
                  <div class="text-xs text-text-tertiary">启用</div>
                </div>
                <div class="text-center">
                  <div class="text-lg font-semibold text-text-quaternary">{{ stats.disabled }}</div>
                  <div class="text-xs text-text-tertiary">停用</div>
                </div>
              </div>
            </div>
          </template>

          <template #toolbar-right>
            <Button type="primary" @click="handleAdd">
              <template #icon><PlusOutlined /></template>
              新增用户
            </Button>
          </template>
        </StatsToolbarTable>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">完整的工具栏示例</h3>
          <p class="section-description">组合搜索、筛选、批量操作等功能</p>
        </div>
      </div>

      <div class="demo-block">
        <FullToolbarTable
          v-model:selected-row-keys="selectedKeys"
          :columns="columns"
          :request="loadUsers"
          selection="multiple"
        >
          <template #title>
            <div>
              <h4 class="m-0 text-base font-semibold text-text">用户管理</h4>
              <p class="mt-1 mb-0 text-xs text-text-secondary">维护系统用户账号</p>
            </div>
          </template>

          <template #toolbar-left>
            <Space>
              <Input
                v-model:value="fullKeyword"
                allow-clear
                placeholder="搜索用户"
                style="width: 200px"
                @press-enter="handleFullSearch"
              >
                <template #prefix><SearchOutlined /></template>
              </Input>
              <Select
                v-model:value="fullDepartment"
                allow-clear
                placeholder="部门"
                style="width: 120px"
                @change="handleFullSearch"
              >
                <SelectOption value="tech">技术部</SelectOption>
                <SelectOption value="product">产品部</SelectOption>
                <SelectOption value="design">设计部</SelectOption>
              </Select>
              <Select
                v-model:value="fullStatus"
                allow-clear
                placeholder="状态"
                style="width: 100px"
                @change="handleFullSearch"
              >
                <SelectOption value="active">启用</SelectOption>
                <SelectOption value="disabled">停用</SelectOption>
              </Select>
            </Space>
          </template>

          <template #toolbar-right>
            <Space>
              <Button @click="handleFullReset">
                <template #icon><ReloadOutlined /></template>
                重置
              </Button>
              <Button @click="handleExport">
                <template #icon><ExportOutlined /></template>
                导出
              </Button>
              <Button type="primary" @click="handleAdd">
                <template #icon><PlusOutlined /></template>
                新增
              </Button>
            </Space>
          </template>

          <template #toolbar-batch="{ selectedRows, clearSelection }">
            <Space>
              <Button color="primary" variant="outlined" @click="handleBatchEdit(selectedRows)">
                批量编辑
              </Button>
              <Button danger @click="handleBatchDelete(selectedRows, clearSelection)">
                批量删除
              </Button>
            </Space>
          </template>
        </FullToolbarTable>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { TableProps } from 'antdv-next';
import { Button, Input, Select, SelectOption, Space, message } from 'antdv-next';
import { ExportOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from '@antdv-next/icons';
import type { DynamicTableRequest } from '@package/common-ui';
import { useDynamicTable } from '@package/common-ui';

defineOptions({ name: 'ToolbarExample' });

interface User {
  id: number;
  name: string;
  email: string;
  department: string;
  status: 'active' | 'disabled';
}

/**
 * 每个 useDynamicTable() 只持有一个实例引用，四个示例各自调用一次。
 * 需要程序化 reload 时用 Hook 返回的 api——ref 拿到的是包装组件，上面没有这些方法。
 */
const [BasicToolbarTable] = useDynamicTable<User>();
const [SearchToolbarTable, searchApi] = useDynamicTable<User>();
const [StatsToolbarTable] = useDynamicTable<User>();
const [FullToolbarTable, fullApi] = useDynamicTable<User>();

const keyword = ref('');
const department = ref<string>();
const fullKeyword = ref('');
const fullDepartment = ref<string>();
const fullStatus = ref<string>();
const selectedKeys = ref<number[]>([]);

const stats = ref({
  total: 50,
  active: 42,
  disabled: 8,
});

const columns: TableProps<User>['columns'] = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '姓名', dataIndex: 'name', key: 'name', width: 150 },
  { title: '邮箱', dataIndex: 'email', key: 'email', width: 200 },
  { title: '部门', dataIndex: 'department', key: 'department', width: 150 },
];

const mockUsers: User[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `用户 ${i + 1}`,
  email: `user${i + 1}@example.com`,
  department: ['技术部', '产品部', '设计部'][i % 3]!,
  status: i % 5 === 0 ? 'disabled' : 'active',
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

const loadUsersWithSearch: DynamicTableRequest<User> = async (context) => {
  await delay(500);

  let filtered = mockUsers;

  if (keyword.value) {
    const kw = keyword.value.toLowerCase();
    filtered = filtered.filter(
      (u) => u.name.toLowerCase().includes(kw) || u.email.toLowerCase().includes(kw),
    );
  }

  if (department.value) {
    const deptMap: Record<string, string> = {
      tech: '技术部',
      product: '产品部',
      design: '设计部',
    };
    filtered = filtered.filter((u) => u.department === deptMap[department.value!]);
  }

  const start = (context.current - 1) * context.pageSize;
  const end = start + context.pageSize;
  return {
    list: filtered.slice(start, end),
    total: filtered.length,
  };
};

function handleRefresh(): void {
  message.success('已刷新');
}

function handleAdd(): void {
  message.info('打开新增用户对话框');
}

function handleSearch(): void {
  void searchApi.reload({ resetPage: true });
}

function handleReset(): void {
  keyword.value = '';
  department.value = undefined;
  void searchApi.reload({ resetPage: true });
}

function handleDepartmentChange(): void {
  void searchApi.reload({ resetPage: true });
}

function handleFullSearch(): void {
  void fullApi.reload({ resetPage: true });
}

function handleFullReset(): void {
  fullKeyword.value = '';
  fullDepartment.value = undefined;
  fullStatus.value = undefined;
  void fullApi.reload({ resetPage: true });
}

function handleExport(): void {
  message.success('导出成功');
}

function handleBatchEdit(rows: User[]): void {
  message.info(`批量编辑 ${rows.length} 条数据`);
}

function handleBatchDelete(rows: User[], clearSelection: () => void): void {
  message.success(`已删除 ${rows.length} 条数据`);
  clearSelection();
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
