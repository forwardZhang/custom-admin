<template>
  <DynamicPage :search="searchProps" :table="tableProps" fill>
    <template #title>
      <h2>用户列表</h2>
    </template>

    <template #toolbar-right>
      <DynamicButton :config="createButtonConfig" />
    </template>

    <template #toolbar-batch="{ selectedRows }">
      <DynamicButton
        :config="batchDeleteButtonConfig"
        :record="{ ids: selectedRows.map((user: SystemUser) => user.id) }"
      />
    </template>

    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'user'">
        <div class="user-cell">
          <Avatar :size="34" class="user-cell__avatar">
            {{ getUserInitial(record) }}
          </Avatar>
          <div class="user-cell__meta">
            <strong>{{ record.nickname }}</strong>
            <span>{{ record.username }}</span>
          </div>
        </div>
      </template>

      <template v-else-if="column.key === 'contact'">
        <div class="contact-cell">
          <span>{{ record.phone }}</span>
          <span>{{ record.email }}</span>
        </div>
      </template>

      <template v-else-if="column.key === 'role'">
        <Tag :color="getRoleColor(record.role)">{{ record.role }}</Tag>
      </template>

      <template v-else-if="column.key === 'action'">
        <div class="row-actions">
          <DynamicButton :config="editButtonConfig" :record="record" />
          <DynamicButton :config="deleteButtonConfig" :record="record" />
        </div>
      </template>
    </template>
  </DynamicPage>
</template>

<script setup lang="tsx">
import type { TableProps } from 'antdv-next';

import { Avatar, Tag, message } from 'antdv-next';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@antdv-next/icons';

import type {
  DynamicButtonConfig,
  DynamicButtonHandlers,
  DynamicFormSchema,
  DynamicPageRequest,
  DynamicPageSearchProps,
  DynamicPageTableProps,
} from '@package/common-ui';
import { DynamicButton, useDynamicPage } from '@package/common-ui';
import type { SystemUser, SystemUserFormValue, SystemUserQuery } from '@/api/system-user';
import {
  createSystemUserApi,
  deleteSystemUsersApi,
  getSystemUserPageApi,
  updateSystemUserApi,
} from '@/api/system-user';

import UserEditor from './components/user-editor.vue';

defineOptions({ name: 'SystemUser' });

const columns: TableProps<SystemUser>['columns'] = [
  {
    title: '用户',
    key: 'user',
    dataIndex: 'nickname',
    width: 180,
    sorter: true,
  },
  {
    title: '联系方式',
    key: 'contact',
    width: 220,
  },
  {
    title: '所属部门',
    key: 'department',
    dataIndex: 'department',
    width: 140,
  },
  {
    title: '角色',
    key: 'role',
    dataIndex: 'role',
    width: 130,
  },
  {
    title: '状态',
    key: 'status',
    dataIndex: 'status',
    width: 90,
    render: (value, record) => {
      return (
        <span class={`status status-${value}`}>
          <span class="status__dot" />
          {value === 'enabled' ? '启用' : '停用'}
        </span>
      );
    },
  },
  {
    title: '创建时间',
    key: 'createdAt',
    dataIndex: 'createdAt',
    width: 160,
    sorter: true,
  },
  {
    title: '操作',
    key: 'action',
    width: 140,
    fixed: 'end',
  },
];

const requestUsers: DynamicPageRequest<SystemUserQuery, SystemUser> = async (context) => {
  const activeSorter = Array.isArray(context.sorter) ? context.sorter[0] : context.sorter;
  const sorterField = Array.isArray(activeSorter?.field)
    ? activeSorter.field.join('.')
    : activeSorter?.field?.toString();

  return getSystemUserPageApi(
    {
      ...normalizeQuery(context.searchValues),
      current: context.current,
      pageSize: context.pageSize,
      sorterField,
      sorterOrder: activeSorter?.order ?? undefined,
    },
    context.signal,
  );
};

const searchSchema: DynamicFormSchema<SystemUserQuery> = [
  {
    fieldName: 'keyword',
    label: '关键词',
    component: 'text',
    fieldProps: {
      allowClear: true,
      placeholder: '用户名 / 姓名 / 手机号 / 邮箱',
    },
  },
  {
    fieldName: 'department',
    label: '所属部门',
    component: 'select',
    fieldProps: {
      allowClear: true,
      options: [
        { label: '产品研发部', value: '产品研发部' },
        { label: '数据平台部', value: '数据平台部' },
        { label: '市场运营部', value: '市场运营部' },
        { label: '客户成功部', value: '客户成功部' },
      ],
      placeholder: '全部部门',
    },
  },
  {
    fieldName: 'role',
    label: '角色',
    component: 'select',
    fieldProps: {
      allowClear: true,
      options: [
        { label: '超级管理员', value: '超级管理员' },
        { label: '系统管理员', value: '系统管理员' },
        { label: '业务运营', value: '业务运营' },
        { label: '普通用户', value: '普通用户' },
      ],
      placeholder: '全部角色',
    },
  },
  {
    fieldName: 'status',
    label: '账号状态',
    component: 'select',
    fieldProps: {
      allowClear: true,
      options: [
        { label: '启用', value: 'enabled' },
        { label: '停用', value: 'disabled' },
      ],
      placeholder: '全部状态',
    },
  },
];

const searchProps: DynamicPageSearchProps<SystemUserQuery> = {
  schema: searchSchema,
  columns: 4,
  labelWidth: 76,
  initialValues: {},
};

const tableProps: DynamicPageTableProps<SystemUserQuery, SystemUser> = {
  columns,
  request: requestUsers,
  pagination: {
    current: 1,
    pageSize: 10,
    pageSizeOptions: ['10', '20', '50'],
    showSizeChanger: true,
    showTotal: (count) => `共 ${count} 条`,
  },
  rowSelection: {
    getCheckboxProps: (record) => ({
      disabled: record.id === 1,
      name: record.nickname,
    }),
  },
  scroll: { x: 1080 },
  size: 'middle',
  onRequestError(error) {
    showError(error, '加载用户列表失败');
  },
};

const [DynamicPage, api] = useDynamicPage<SystemUserQuery, SystemUser>();

/** 五个按钮共用同一套错误提示；回调只读取 error，与各自的 record/value 泛型无关。 */
const buttonHandlers: DynamicButtonHandlers<unknown, unknown> = {
  onError({ error }) {
    showError(error, '操作失败');
  },
};

const createButtonConfig: DynamicButtonConfig<void, SystemUserFormValue> = {
  label: '新增用户',
  icon: PlusOutlined,
  buttonProps: { type: 'primary' },
  ...buttonHandlers,
  action: {
    type: 'drawer',
    component: UserEditor,
    componentProps: { mode: 'create' },
    drawerProps: {
      title: '新增用户',
      placement: 'right',
      size: 'large',
      okText: '创建用户',
      cancelText: '取消',
    },
    getDefaultValue: () => createEmptyFormValue(),
    async submit({ value }) {
      if (!value) throw new Error('用户表单数据无效');
      await createSystemUserApi(value);
      message.success('用户创建成功');
      await api.table.reload({ resetPage: true });
    },
  },
};

const editButtonConfig: DynamicButtonConfig<SystemUser, SystemUserFormValue> = {
  label: '编辑',
  icon: EditOutlined,
  buttonProps: { type: 'link' },
  ...buttonHandlers,
  action: {
    type: 'modal',
    component: UserEditor,
    componentProps: { mode: 'edit' },
    modalProps: {
      title: '编辑用户',
      width: 720,
    },
    getDefaultValue: ({ record }) => toFormValue(record),
    async submit({ record, value }) {
      if (!record || !value) throw new Error('用户表单数据无效');
      await updateSystemUserApi({ id: record.id, data: value });
      message.success('用户信息已更新');
      await api.table.reload();
    },
  },
};

const deleteButtonConfig: DynamicButtonConfig<SystemUser> = {
  label: '删除',
  icon: DeleteOutlined,
  disabled: ({ record }) => record?.id === 1,
  buttonProps: { danger: true, type: 'link' },
  ...buttonHandlers,
  action: {
    type: 'confirm',
    confirmProps: {
      title: '确认删除该用户？',
      description: '删除后将无法恢复，请谨慎操作。',
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
    },
    async submit({ record }) {
      if (!record) throw new Error('用户标识无效');
      await deleteSystemUsersApi([record.id]);
      message.success(`已删除用户 ${record.nickname}`);
      await api.table.reload();
    },
  },
};

const batchDeleteButtonConfig: DynamicButtonConfig<{ ids: number[] }> = {
  label: '批量删除',
  icon: DeleteOutlined,
  buttonProps: { danger: true, size: 'small' },
  ...buttonHandlers,
  action: {
    type: 'confirm',
    confirmProps: {
      title: '确认删除选中的用户？',
      description: '删除后将无法恢复，请谨慎操作。',
      okText: '批量删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
    },
    async submit({ record }) {
      const ids = record?.ids ?? [];
      if (!ids.length) throw new Error('请先选择需要删除的用户');
      await deleteSystemUsersApi(ids);
      message.success(`已删除 ${ids.length} 个用户`);
      api.table.clearSelection();
      await api.table.reload({ resetPage: true });
    },
  },
};

function createEmptyFormValue(): SystemUserFormValue {
  return {
    username: '',
    nickname: '',
    password: '',
    email: '',
    phone: '',
    department: '',
    role: '普通用户',
    status: 'enabled',
    remark: '',
  };
}

/** 编辑弹层的初始值直接取自当前行，字段类型由 SystemUser 保证。 */
function toFormValue(user: SystemUser | undefined): SystemUserFormValue {
  if (!user) return createEmptyFormValue();

  const { username, nickname, email, phone, department, role, status, remark } = user;

  return { username, nickname, email, phone, department, role, status, remark };
}

function normalizeQuery(values: SystemUserQuery): SystemUserQuery {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== '' && value !== undefined),
  ) as SystemUserQuery;
}

function getUserInitial(user: SystemUser): string {
  return user.nickname.trim().slice(0, 1).toUpperCase() || 'U';
}

function getRoleColor(role: string): string {
  if (role === '超级管理员') return 'red';
  if (role === '系统管理员') return 'blue';
  if (role === '业务运营') return 'cyan';
  return 'default';
}

function showError(error: unknown, fallback: string): void {
  if (error && typeof error === 'object' && 'message' in error) {
    const errorMessage = String(error.message || '').trim();
    message.error(errorMessage || fallback);
    return;
  }
  message.error(fallback);
}
</script>

<style scoped>
.user-cell,
.status {
  display: flex;
  align-items: center;
}

.user-cell {
  min-width: 0;
  gap: 10px;
}

.user-cell__avatar.ant-avatar {
  flex-shrink: 0;
  border: 1px solid var(--ant-color-primary-border);
  background: var(--ant-color-primary-bg);
  color: var(--ant-color-primary);
  font-size: 13px;
  font-weight: 600;
}

.user-cell__meta,
.contact-cell {
  display: grid;
  min-width: 0;
}

.user-cell__meta strong,
.user-cell__meta span,
.contact-cell span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-cell__meta strong {
  color: var(--ant-color-text);
  font-size: 13px;
  font-weight: 550;
  line-height: 20px;
}

.user-cell__meta span,
.contact-cell span:last-child {
  color: var(--ant-color-text-tertiary);
  font-size: 12px;
  line-height: 18px;
}

.contact-cell span:first-child {
  color: var(--ant-color-text-secondary);
  font-size: 13px;
  line-height: 20px;
}

.status {
  width: fit-content;
  gap: 6px;
  color: var(--ant-color-text-secondary);
  font-size: 12px;
}

.status__dot {
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--ant-color-success);
}

.status--disabled .status__dot {
  background: var(--ant-color-text-quaternary);
}

.row-actions {
  gap: 2px;
}
</style>
