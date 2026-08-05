<template>
  <div class="example-container">
    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">多选模式</h3>
          <p class="section-description">通过 v-model:selected-row-keys 绑定选中的行</p>
        </div>
      </div>

      <div class="demo-block">
        <div class="mb-4 space-y-2 text-sm">
          <div>
            已选择: <strong class="text-primary">{{ selectedKeys1.length }}</strong> 项
          </div>
          <div class="text-xs text-text-tertiary">
            选中的 ID: {{ selectedKeys1.join(', ') || '无' }}
          </div>
        </div>
        <DynamicTable
          v-model:selected-row-keys="selectedKeys1"
          :columns="columns"
          :request="loadData"
          selection="multiple"
        />
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">单选模式</h3>
          <p class="section-description">设置 selection="single" 只能选择一行</p>
        </div>
      </div>

      <div class="demo-block">
        <div class="mb-4 space-y-2 text-sm">
          <div>
            已选择: <strong class="text-primary">{{ selectedKeys2[0] || '无' }}</strong>
          </div>
        </div>
        <DynamicTable
          v-model:selected-row-keys="selectedKeys2"
          :columns="columns"
          :request="loadData"
          selection="single"
        />
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">自定义选择行为</h3>
          <p class="section-description">通过 rowSelection 自定义某些行禁止选择</p>
        </div>
      </div>

      <div class="demo-block">
        <div class="mb-4 space-y-2 text-sm">
          <div>
            已选择: <strong class="text-primary">{{ selectedKeys3.length }}</strong> 项
          </div>
          <div class="text-xs text-text-tertiary">ID 为 1 的行被禁用，无法选择</div>
        </div>
        <DynamicTable
          v-model:selected-row-keys="selectedKeys3"
          :columns="columns"
          :request="loadData"
          :row-selection="customRowSelection"
          selection="multiple"
        />
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">批量操作</h3>
          <p class="section-description">使用 toolbar-batch 插槽显示批量操作按钮</p>
        </div>
      </div>

      <div class="demo-block">
        <DynamicTable
          v-model:selected-row-keys="selectedKeys4"
          :columns="columns"
          :request="loadData"
          selection="multiple"
        >
          <template #toolbar-batch="{ selectedRows, clearSelection, reload }">
            <Button
              :loading="batchLoading"
              color="primary"
              variant="outlined"
              @click="handleBatchDelete(selectedRows, clearSelection, reload)"
            >
              批量删除
            </Button>
            <Button @click="handleBatchExport(selectedRows)"> 批量导出 </Button>
          </template>
        </DynamicTable>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { TableProps } from 'antdv-next';
import { Button, message } from 'antdv-next';
import type { DynamicTableRequest, DynamicTableRowSelection } from '@package/common-ui';
import { useDynamicTable } from '@package/common-ui';

defineOptions({ name: 'SelectionExample' });

interface User {
  id: number;
  name: string;
  email: string;
  department: string;
}

const [DynamicTable] = useDynamicTable<User>();

const selectedKeys1 = ref<number[]>([]);
const selectedKeys2 = ref<number[]>([]);
const selectedKeys3 = ref<number[]>([]);
const selectedKeys4 = ref<number[]>([]);
const batchLoading = ref(false);

const columns: TableProps<User>['columns'] = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '姓名', dataIndex: 'name', key: 'name', width: 120 },
  { title: '邮箱', dataIndex: 'email', key: 'email', width: 200 },
  { title: '部门', dataIndex: 'department', key: 'department', width: 150 },
];

const mockUsers: User[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `用户 ${i + 1}`,
  email: `user${i + 1}@example.com`,
  department: ['技术部', '产品部', '设计部'][i % 3]!,
}));

const customRowSelection: DynamicTableRowSelection<User> = {
  getCheckboxProps: (record) => ({
    disabled: record.id === 1,
    name: record.name,
  }),
};

const loadData: DynamicTableRequest<User> = async (context) => {
  await delay(500);
  const start = (context.current - 1) * context.pageSize;
  const end = start + context.pageSize;
  return {
    list: mockUsers.slice(start, end),
    total: mockUsers.length,
  };
};

async function handleBatchDelete(
  rows: User[],
  clearSelection: () => void,
  reload: () => Promise<void>,
): Promise<void> {
  if (!rows.length) {
    message.warning('请先选择要删除的数据');
    return;
  }

  batchLoading.value = true;
  try {
    await delay(1000);
    message.success(`已删除 ${rows.length} 条数据`);
    clearSelection();
    await reload();
  } finally {
    batchLoading.value = false;
  }
}

function handleBatchExport(rows: User[]): void {
  if (!rows.length) {
    message.warning('请先选择要导出的数据');
    return;
  }
  message.success(`已导出 ${rows.length} 条数据`);
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
