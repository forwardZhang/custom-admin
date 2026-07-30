<template>
  <DynamicPage fill>
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
  DynamicButtonErrorPayload,
  DynamicFormSchema,
  DynamicPageRequest,
  DynamicPageSearchConfig,
  DynamicPageTableConfig,
} from '@package/common-ui';
import { DynamicButton, useDynamicPage } from '@package/common-ui';
import type {
  SystemUser,
  SystemUserFormValue,
  SystemUserQuery,
  SystemUserStatus,
} from '@/api/system-user';
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

const searchConfig: DynamicPageSearchConfig<SystemUserQuery> = {
  schema: searchSchema,
  columns: 4,
  labelWidth: 76,
  initialValues: {},
};

const tableConfig: DynamicPageTableConfig<SystemUserQuery, SystemUser> = {
  columns,
  request: requestUsers,
  multiple: true,
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
  handleRequestError(error) {
    showError(error, '加载用户列表失败');
  },
};

const [DynamicPage, , tableApi] = useDynamicPage<SystemUserQuery, SystemUser>({
  searchConfig,
  tableConfig,
});

const buttonEvents = {
  error(payload: DynamicButtonErrorPayload) {
    showError(payload.error, '操作失败');
  },
};

const createButtonConfig: DynamicButtonConfig = {
  label: '新增用户',
  icon: PlusOutlined,
  props: { type: 'primary' },
  events: buttonEvents,
  render: {
    type: 'drawer',
    component: UserEditor,
    componentProps: { mode: 'create' },
    props: {
      title: '新增用户',
      placement: 'right',
      size: 'large',
      okText: '创建用户',
      cancelText: '取消',
    },
    getDefaultValue: () => createEmptyFormValue(),
    async submit({ value }) {
      await createSystemUserApi(readFormValue(value));
      message.success('用户创建成功');
      await tableApi.reload({ resetPage: true });
    },
  },
};

const editButtonConfig: DynamicButtonConfig = {
  label: '编辑',
  icon: EditOutlined,
  props: { type: 'link' },
  events: buttonEvents,
  render: {
    type: 'modal',
    component: UserEditor,
    componentProps: { mode: 'edit' },
    props: {
      title: '编辑用户',
      width: 720,
    },
    getDefaultValue: ({ record }) => toFormValue(record),
    async submit({ record, value }) {
      const id = Number(record?.id);
      if (!Number.isInteger(id)) throw new Error('用户标识无效');
      await updateSystemUserApi({ id, data: readFormValue(value) });
      message.success('用户信息已更新');
      await tableApi.reload();
    },
  },
};

const deleteButtonConfig: DynamicButtonConfig = {
  label: '删除',
  icon: DeleteOutlined,
  disabled: ({ record }) => Number(record?.id) === 1,
  props: { danger: true, type: 'link' },
  events: buttonEvents,
  render: {
    type: 'confirm',
    props: {
      title: '确认删除该用户？',
      description: '删除后将无法恢复，请谨慎操作。',
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
    },
    async submit({ record }) {
      const id = Number(record?.id);
      if (!Number.isInteger(id)) throw new Error('用户标识无效');
      await deleteSystemUsersApi([id]);
      message.success(`已删除用户 ${String(record?.nickname ?? '')}`);
      await tableApi.reload();
    },
  },
};

const batchDeleteButtonConfig: DynamicButtonConfig = {
  label: '批量删除',
  icon: DeleteOutlined,
  props: { danger: true, size: 'small' },
  events: buttonEvents,
  render: {
    type: 'confirm',
    props: {
      title: '确认删除选中的用户？',
      description: '删除后将无法恢复，请谨慎操作。',
      okText: '批量删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
    },
    async submit({ record }) {
      const ids = Array.isArray(record?.ids) ? record.ids.map(Number).filter(Number.isInteger) : [];
      if (!ids.length) throw new Error('请先选择需要删除的用户');
      await deleteSystemUsersApi(ids);
      message.success(`已删除 ${ids.length} 个用户`);
      tableApi.clearSelection();
      await tableApi.reload({ resetPage: true });
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

function toFormValue(record: Record<string, unknown> | undefined): SystemUserFormValue {
  return {
    username: String(record?.username ?? ''),
    nickname: String(record?.nickname ?? ''),
    email: String(record?.email ?? ''),
    phone: String(record?.phone ?? ''),
    department: String(record?.department ?? ''),
    role: String(record?.role ?? ''),
    status: isUserStatus(record?.status) ? record.status : 'enabled',
    remark: String(record?.remark ?? ''),
  };
}

function readFormValue(value: unknown): SystemUserFormValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('用户表单数据无效');
  }
  return value as SystemUserFormValue;
}

function normalizeQuery(values: SystemUserQuery): SystemUserQuery {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== '' && value !== undefined),
  ) as SystemUserQuery;
}

function isUserStatus(value: unknown): value is SystemUserStatus {
  return value === 'enabled' || value === 'disabled';
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
