<template>
  <div>
    <Alert
      class="mb-5"
      :description="description"
      :message="mode === 'create' ? '创建新成员' : '正在编辑成员资料'"
      show-icon
      type="info"
    />

    <Form />
  </div>
</template>

<script setup lang="ts">
import { Alert } from 'antdv-next';

import type { DynamicButtonContentExpose, DynamicFormSchema } from '@package/common-ui';
import { useDynamicForm } from '@package/common-ui';

import type { MemberEditorValue } from '../types';

defineOptions({ name: 'DynamicButtonMemberEditor' });

withDefaults(
  defineProps<{
    description?: string;
    mode?: 'create' | 'edit';
    record?: Record<string, unknown>;
  }>(),
  {
    description: '表单值通过标准 v-model 与 DynamicButton 同步。',
    mode: 'edit',
    record: undefined,
  },
);

const modelValue = defineModel<MemberEditorValue>({ required: true });

const departmentOptions = [
  { label: '产品设计', value: '产品设计' },
  { label: '前端研发', value: '前端研发' },
  { label: '数据平台', value: '数据平台' },
  { label: '客户成功', value: '客户成功' },
];

const roleOptions = [
  { label: '管理员', value: '管理员' },
  { label: '编辑者', value: '编辑者' },
  { label: '只读成员', value: '只读成员' },
];

const schema: DynamicFormSchema<MemberEditorValue> = [
  {
    fieldName: 'name',
    label: '姓名',
    component: 'text',
    required: true,
    requiredMessage: '请输入姓名',
    rules: [{ min: 2, message: '姓名至少需要 2 个字符', trigger: 'blur' }],
    fieldProps: {
      placeholder: '请输入姓名',
    },
  },
  {
    fieldName: 'email',
    label: '邮箱',
    component: 'text',
    required: true,
    requiredMessage: '请输入邮箱',
    rules: [{ type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }],
    fieldProps: {
      placeholder: 'name@example.com',
    },
  },
  {
    fieldName: 'department',
    label: '部门',
    component: 'select',
    required: true,
    requiredMessage: '请选择部门',
    fieldProps: {
      options: departmentOptions,
      placeholder: '请选择部门',
    },
  },
  {
    fieldName: 'role',
    label: '角色',
    component: 'select',
    required: true,
    requiredMessage: '请选择角色',
    fieldProps: {
      options: roleOptions,
      placeholder: '请选择角色',
    },
  },
  {
    fieldName: 'remark',
    label: '备注',
    component: 'textarea',
    itemClass: 'sm:col-span-2',
    fieldProps: {
      allowClear: true,
      autoSize: { minRows: 2, maxRows: 4 },
      maxlength: 60,
      placeholder: '补充成员职责或协作信息',
      showCount: true,
    },
  },
  {
    fieldName: 'enabled',
    label: '启用账号',
    component: 'switch',
    description: '关闭后，该成员将无法登录管理后台。',
    itemClass: 'sm:col-span-2',
    fieldProps: {
      checkedChildren: '启用',
      unCheckedChildren: '停用',
    },
  },
];

const [Form, formApi] = useDynamicForm<MemberEditorValue>({
  schema,
  initialValues: modelValue.value,
  layout: 'vertical',
  wrapperClass: 'grid grid-cols-1 gap-x-4 sm:grid-cols-2',
  showDefaultActions: false,
  handleValuesChange(values) {
    modelValue.value = values;
  },
});

async function validate(): Promise<MemberEditorValue> {
  return formApi.validate();
}

defineExpose<DynamicButtonContentExpose>({ validate });
</script>
