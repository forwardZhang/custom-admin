<template>
  <div class="user-editor">
    <Alert
      class="user-editor__alert"
      :message="mode === 'create' ? '创建用户账号' : `编辑 ${modelValue.nickname}`"
      :description="
        mode === 'create'
          ? '账号创建后即可按照所选角色和状态使用系统。'
          : '修改用户资料、所属部门和角色权限。'
      "
      show-icon
      type="info"
    />
    <Form
      v-model="modelValue"
      :initial-values="initialValues"
      :schema="schema"
      layout="vertical"
      wrapper-class="grid grid-cols-1 gap-x-5 sm:grid-cols-2"
    />
  </div>
</template>

<script setup lang="ts">
import { Alert } from 'antdv-next';

import type { DynamicButtonContentExpose, DynamicFormSchema } from '@package/common-ui';
import { useDynamicForm } from '@package/common-ui';
import type { SystemUserFormValue } from '@/api/system-user';

defineOptions({ name: 'SystemUserEditor' });

const props = withDefaults(
  defineProps<{
    mode?: 'create' | 'edit';
  }>(),
  { mode: 'create' },
);

const modelValue = defineModel<SystemUserFormValue>({ required: true });

/** 重置基线取挂载时的一份快照，之后的输入不会移动基线。 */
const initialValues: SystemUserFormValue = { ...modelValue.value };

const departmentOptions = [
  { label: '产品研发部', value: '产品研发部' },
  { label: '数据平台部', value: '数据平台部' },
  { label: '市场运营部', value: '市场运营部' },
  { label: '客户成功部', value: '客户成功部' },
];

const roleOptions = [
  { label: '超级管理员', value: '超级管理员' },
  { label: '系统管理员', value: '系统管理员' },
  { label: '业务运营', value: '业务运营' },
  { label: '普通用户', value: '普通用户' },
];

const schema: DynamicFormSchema<SystemUserFormValue> = [
  {
    fieldName: 'username',
    label: '用户名',
    component: 'text',
    required: true,
    requiredMessage: '请输入用户名',
    disabled: props.mode === 'edit',
    rules: [
      { min: 4, max: 24, message: '用户名长度为 4-24 个字符', trigger: 'blur' },
      {
        pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
        message: '用户名需以字母开头，仅支持字母、数字和下划线',
        trigger: 'blur',
      },
    ],
    fieldProps: { allowClear: true, autocomplete: 'off', placeholder: '请输入登录用户名' },
  },
  {
    fieldName: 'nickname',
    label: '用户姓名',
    component: 'text',
    required: true,
    requiredMessage: '请输入用户姓名',
    fieldProps: { allowClear: true, maxlength: 20, placeholder: '请输入用户姓名' },
  },
  {
    fieldName: 'password',
    label: '初始密码',
    component: 'text',
    if: () => props.mode === 'create',
    required: () => props.mode === 'create',
    requiredMessage: '请输入初始密码',
    rules: [{ min: 6, message: '密码至少 6 个字符', trigger: 'blur' }],
    fieldProps: {
      autocomplete: 'new-password',
      placeholder: '请输入初始密码',
      type: 'password',
    },
  },
  {
    fieldName: 'phone',
    label: '手机号',
    component: 'text',
    required: true,
    requiredMessage: '请输入手机号',
    rules: [{ pattern: /^1\d{10}$/, message: '请输入有效的 11 位手机号', trigger: 'blur' }],
    fieldProps: { allowClear: true, maxlength: 11, placeholder: '请输入手机号' },
  },
  {
    fieldName: 'email',
    label: '邮箱',
    component: 'text',
    required: true,
    requiredMessage: '请输入邮箱',
    rules: [{ type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }],
    fieldProps: { allowClear: true, placeholder: 'name@example.com' },
  },
  {
    fieldName: 'department',
    label: '所属部门',
    component: 'select',
    required: true,
    requiredMessage: '请选择所属部门',
    fieldProps: { allowClear: true, options: departmentOptions, placeholder: '请选择部门' },
  },
  {
    fieldName: 'role',
    label: '角色',
    component: 'select',
    required: true,
    requiredMessage: '请选择角色',
    fieldProps: { allowClear: true, options: roleOptions, placeholder: '请选择角色' },
  },
  {
    fieldName: 'status',
    label: '账号状态',
    component: 'radio',
    required: true,
    fieldProps: {
      optionType: 'button',
      options: [
        { label: '启用', value: 'enabled' },
        { label: '停用', value: 'disabled' },
      ],
    },
  },
  {
    fieldName: 'remark',
    label: '备注',
    component: 'textarea',
    itemClass: 'sm:col-span-2',
    fieldProps: {
      allowClear: true,
      autoSize: { minRows: 3, maxRows: 5 },
      maxlength: 120,
      placeholder: '补充用户职责或账号说明',
      showCount: true,
    },
  },
];

const [Form, formApi] = useDynamicForm<SystemUserFormValue>();

async function validate(): Promise<SystemUserFormValue> {
  return formApi.validate();
}

defineExpose<DynamicButtonContentExpose<SystemUserFormValue>>({ validate });
</script>

<style scoped>
.user-editor__alert {
  margin-bottom: 20px;
}
</style>
