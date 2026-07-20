<template>
  <div class="dynamic-table-demo">
    <header class="page-header">
      <div class="page-header__inner">
        <div>
          <h1>动态表格</h1>
          <p>用户数据管理</p>
        </div>
      </div>
    </header>

    <main class="page-content">
      <section class="table-panel">
        <div class="query-bar">
          <div class="query-bar__search">
            <Input
              v-model:value="keyword"
              allow-clear
              placeholder="搜索姓名、邮箱或部门"
              @press-enter="searchUsers"
            >
              <template #prefix><SearchOutlined class="query-bar__search-icon" /></template>
            </Input>
            <Button type="primary" @click="searchUsers">查询</Button>
            <Button @click="resetSearch">重置</Button>
          </div>

          <div class="query-bar__modes">
            <div class="mode-field">
              <span class="mode-field__label">数据源</span>
              <Segmented v-model:value="dataMode" :options="dataModeOptions" size="small" />
            </div>
            <div class="mode-field">
              <span class="mode-field__label">选择方式</span>
              <Segmented
                v-model:value="selectionMode"
                :options="selectionModeOptions"
                size="small"
              />
            </div>
          </div>
        </div>

        <div class="table-panel__body">
          <DynamicTable
            ref="tableRef"
            v-model:selected-row-keys="selectedRowKeys"
            :columns="columns"
            :multiple="selectionMode === 'multiple'"
            :request="loadUsers"
            :row-selection="rowSelection"
            :scroll="{ x: 920 }"
            :single="selectionMode === 'single'"
            @request-error="handleRequestError"
          >
            <template #title>
              <div class="table-title">
                <div class="table-title__line">
                  <h2>用户列表</h2>
                  <span class="source-badge">
                    <span class="source-badge__dot" />
                    {{ dataMode === 'paged' ? '远程分页' : '本地数组' }}
                  </span>
                </div>
                <p>维护组织成员及账户状态</p>
              </div>
            </template>

            <template #toolbar-right>
              <Button type="primary" @click="showAddMessage">
                <template #icon><PlusOutlined /></template>
                新增用户
              </Button>
            </template>

            <template #toolbar-batch="{ selectedRows, clearSelection, reload }">
              <Button
                :loading="batchLoading"
                color="primary"
                variant="outlined"
                @click="disableUsers(selectedRows, clearSelection, reload)"
              >
                批量停用
              </Button>
            </template>

            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'user'">
                <div class="user-cell">
                  <Avatar shape="square" :size="34" class="user-cell__avatar">
                    {{ getUserInitial(record) }}
                  </Avatar>
                  <div class="user-cell__content">
                    <div class="user-cell__name">{{ record.name }}</div>
                    <div class="user-cell__email">{{ record.email }}</div>
                  </div>
                </div>
              </template>
              <template v-else-if="column.key === 'status'">
                <span class="status" :class="`status--${record.status}`">
                  <span class="status__dot" />
                  {{ record.status === 'active' ? '启用' : '停用' }}
                </span>
              </template>
              <template v-else-if="column.key === 'action'">
                <Tooltip title="查看用户">
                  <Button
                    type="text"
                    shape="circle"
                    aria-label="查看用户"
                    @click="showUser(record)"
                  >
                    <EyeOutlined />
                  </Button>
                </Tooltip>
              </template>
            </template>
          </DynamicTable>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { TableProps } from 'antdv-next';

import { computed, ref, watch } from 'vue';
import { Avatar, Button, Input, Segmented, Tooltip, message } from 'antdv-next';
import { EyeOutlined, PlusOutlined, SearchOutlined } from '@antdv-next/icons';

import type {
  DynamicTableInstance,
  DynamicTableKey,
  DynamicTableRequest,
  DynamicTableRowSelection,
} from '@package/common-ui';
import { DynamicTable } from '@package/common-ui';
import type { DynamicTableUser, DynamicTableUserStatus } from '@/api/dynamic-table';
import {
  disableDynamicTableUsersApi,
  getDynamicTableUserListApi,
  getDynamicTableUsersApi,
} from '@/api/dynamic-table';

defineOptions({ name: 'DemoDynamicTable' });

type DataMode = 'paged' | 'array';
type SelectionMode = 'multiple' | 'single' | 'none';

const dataMode = ref<DataMode>('paged');
const selectionMode = ref<SelectionMode>('multiple');
const keyword = ref('');
const selectedRowKeys = ref<DynamicTableKey[]>([]);
const batchLoading = ref(false);
const tableRef = ref<DynamicTableInstance<DynamicTableUser>>();

const dataModeOptions = [
  { label: '分页数据', value: 'paged' },
  { label: '数组数据', value: 'array' },
];

const selectionModeOptions = [
  { label: '多选', value: 'multiple' },
  { label: '单选', value: 'single' },
  { label: '关闭选择', value: 'none' },
];

const columns = computed<TableProps<DynamicTableUser>['columns']>(() => {
  const isLocal = dataMode.value === 'array';
  return [
    {
      title: '用户',
      key: 'user',
      dataIndex: 'name',
      width: 230,
      sorter: isLocal
        ? (left: DynamicTableUser, right: DynamicTableUser) =>
            left.name.localeCompare(right.name, 'zh-CN')
        : true,
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      width: 150,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      filters: [
        { text: '启用', value: 'active' },
        { text: '停用', value: 'disabled' },
      ],
      onFilter: isLocal
        ? (value: boolean | DynamicTableKey, record: DynamicTableUser) => record.status === value
        : undefined,
    },
    {
      title: '创建日期',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 130,
      sorter: isLocal
        ? (left: DynamicTableUser, right: DynamicTableUser) =>
            left.createdAt.localeCompare(right.createdAt)
        : true,
    },
    {
      title: '操作',
      key: 'action',
      width: 90,
      fixed: 'end',
    },
  ];
});

const rowSelection: DynamicTableRowSelection<DynamicTableUser> = {
  getCheckboxProps: (record) => ({
    disabled: record.id === 1,
    name: record.name,
  }),
};

const loadUsers: DynamicTableRequest<DynamicTableUser> = async (context) => {
  if (dataMode.value === 'array') {
    const list = await getDynamicTableUserListApi(context.signal);
    const searchText = keyword.value.trim().toLowerCase();
    if (!searchText) return list;

    return list.filter(
      (user) =>
        user.name.toLowerCase().includes(searchText) ||
        user.email.toLowerCase().includes(searchText) ||
        user.department.toLowerCase().includes(searchText),
    );
  }

  const activeSorter = Array.isArray(context.sorter) ? context.sorter[0] : context.sorter;
  const status = context.filters.status?.[0] as DynamicTableUserStatus | undefined;
  const sorterField = Array.isArray(activeSorter?.field)
    ? activeSorter.field.join('.')
    : activeSorter?.field?.toString();

  return getDynamicTableUsersApi(
    {
      current: context.current,
      pageSize: context.pageSize,
      keyword: keyword.value.trim() || undefined,
      status,
      sorterField,
      sorterOrder: activeSorter?.order ?? undefined,
    },
    context.signal,
  );
};

function searchUsers(): void {
  void tableRef.value?.reload({ resetPage: true });
}

function resetSearch(): void {
  keyword.value = '';
  searchUsers();
}

function showAddMessage(): void {
  message.info('新增入口已触发');
}

function showUser(record: DynamicTableUser): void {
  message.info(`${record.name} · ${record.department}`);
}

function getUserInitial(record: DynamicTableUser): string {
  return record.name.replace('用户 ', '');
}

async function disableUsers(
  rows: DynamicTableUser[],
  clearSelection: () => void,
  reload: (options?: { resetPage?: boolean }) => Promise<void>,
): Promise<void> {
  if (!rows.length) return;
  batchLoading.value = true;
  try {
    await disableDynamicTableUsersApi(rows.map((row) => row.id));
    message.success(`已停用 ${rows.length} 个用户`);
    clearSelection();
    await reload();
  } finally {
    batchLoading.value = false;
  }
}

function handleRequestError(error: unknown): void {
  const text = error instanceof Error ? error.message : '加载表格数据失败';
  message.error(text);
}

watch(dataMode, () => {
  selectedRowKeys.value = [];
  void tableRef.value?.reload({ resetPage: true });
});

watch(selectionMode, () => {
  selectedRowKeys.value = [];
});
</script>

<style scoped>
.dynamic-table-demo {
  height: 100%;
  overflow: auto;
  background: var(--ant-color-fill-quaternary);
}

.page-header {
  border-bottom: 1px solid var(--ant-color-border-secondary);
  background: var(--ant-color-bg-container);
}

.page-header__inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 18px 24px;
}

.page-header h1,
.page-header p,
.table-title h2,
.table-title p {
  margin: 0;
}

.page-header h1 {
  color: var(--ant-color-text);
  font-size: 20px;
  font-weight: 650;
  line-height: 28px;
}

.page-header p {
  margin-top: 2px;
  color: var(--ant-color-text-secondary);
  font-size: 13px;
}

.page-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 20px 24px 28px;
}

.table-panel {
  overflow: hidden;
  border: 1px solid var(--ant-color-border-secondary);
  border-radius: 8px;
  background: var(--ant-color-bg-container);
  box-shadow: 0 1px 2px rgb(0 0 0 / 3%);
}

.query-bar {
  display: flex;
  min-height: 66px;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--ant-color-border-secondary);
  background: var(--ant-color-fill-quaternary);
}

.query-bar__search,
.query-bar__modes,
.mode-field,
.table-title,
.table-title__line,
.user-cell,
.status,
.source-badge {
  display: flex;
  align-items: center;
}

.query-bar__search {
  min-width: 0;
  flex: 1;
  gap: 8px;
}

.query-bar__search :deep(.ant-input-affix-wrapper) {
  width: min(360px, 100%);
}

.query-bar__search-icon {
  color: var(--ant-color-text-quaternary);
}

.query-bar__modes {
  flex-shrink: 0;
  gap: 16px;
}

.mode-field {
  gap: 8px;
}

.mode-field__label {
  color: var(--ant-color-text-tertiary);
  font-size: 12px;
  white-space: nowrap;
}

.table-panel__body {
  padding: 18px;
}

.table-title {
  min-width: 0;
  display: block;
}

.table-title__line {
  gap: 8px;
}

.table-title h2 {
  color: var(--ant-color-text);
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.table-title p {
  margin-top: 1px;
  color: var(--ant-color-text-tertiary);
  font-size: 12px;
}

.source-badge {
  gap: 5px;
  padding: 1px 7px;
  border: 1px solid var(--ant-color-border-secondary);
  border-radius: 4px;
  color: var(--ant-color-text-secondary);
  font-size: 12px;
  line-height: 20px;
}

.source-badge__dot,
.status__dot {
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--ant-color-success);
}

.user-cell {
  min-width: 0;
  gap: 10px;
}

.user-cell__avatar.ant-avatar {
  flex-shrink: 0;
  border: 1px solid var(--ant-color-primary-border);
  border-radius: 6px;
  background: var(--ant-color-primary-bg);
  color: var(--ant-color-primary);
  font-size: 12px;
  font-weight: 600;
}

.user-cell__content {
  min-width: 0;
}

.user-cell__name,
.user-cell__email {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-cell__name {
  color: var(--ant-color-text);
  font-size: 13px;
  font-weight: 550;
  line-height: 20px;
}

.user-cell__email {
  color: var(--ant-color-text-tertiary);
  font-size: 12px;
  line-height: 18px;
}

.status {
  width: fit-content;
  gap: 6px;
  color: var(--ant-color-text-secondary);
  font-size: 12px;
}

.status--disabled .status__dot {
  background: var(--ant-color-text-quaternary);
}

@media (max-width: 900px) {
  .query-bar {
    align-items: flex-start;
    flex-direction: column;
  }

  .query-bar__modes {
    width: 100%;
    flex-wrap: wrap;
  }
}

@media (max-width: 640px) {
  .page-header__inner {
    padding: 14px 16px;
  }

  .page-content {
    padding: 14px;
  }

  .query-bar {
    gap: 12px;
    padding: 12px;
  }

  .query-bar__search {
    width: 100%;
    flex-wrap: wrap;
  }

  .query-bar__search :deep(.ant-input-affix-wrapper) {
    width: 100%;
  }

  .query-bar__modes,
  .mode-field {
    align-items: flex-start;
    flex-direction: column;
  }

  .query-bar__modes {
    gap: 10px;
  }

  .mode-field {
    width: 100%;
    gap: 4px;
  }

  .table-panel__body {
    padding: 12px;
  }

  .table-title {
    gap: 10px;
  }

  .table-title p {
    display: none;
  }

  .batch-actions {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
