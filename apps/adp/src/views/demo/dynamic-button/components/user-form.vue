<template>
  <div class="user-form">
    <div v-if="contextLabel" class="mb-4 text-sm text-text-secondary">
      正在编辑：{{ contextLabel }}
    </div>

    <Form
      :schema="schema"
      :initial-values="initialValues"
      layout="vertical"
      @values-change="syncValue"
    />

    <Alert
      v-if="showComplex"
      class="mt-4"
      message="复杂表单可以继续往 schema 里追加字段，弹层高度会自适应"
      type="info"
      show-icon
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Alert } from 'antdv-next';
import type { DynamicButtonContentExpose, DynamicFormSchema } from '@package/common-ui';
import { useDynamicForm } from '@package/common-ui';

defineOptions({ name: 'UserForm' });

/** 弹层内容组件的编辑值，与 DynamicButton 的 TValue 保持一致。 */
export interface UserFormData {
  name: string;
  email: string;
  department: string;
  role: string;
  phone?: string;
  remark?: string;
}

interface Props {
  /** DynamicButton 始终透传当前 record，用于渲染上下文信息。 */
  record?: { name?: string };
  /** 由 componentProps 传入的额外上下文文案。 */
  itemName?: string;
  /** 是否对邮箱追加必填校验。 */
  showValidation?: boolean;
  /** 是否展示复杂表单的附加字段。 */
  showComplex?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  record: undefined,
  itemName: undefined,
  showValidation: false,
  showComplex: false,
});

const modelValue = defineModel<UserFormData>({
  default: () => ({ name: '', email: '', department: '', role: '' }),
});

const [Form, formApi] = useDynamicForm<UserFormData>();

/**
 * 只读取一次当前值作为初始基线。
 * 弹层配置了 destroyOnHidden，每次打开都是新实例，
 * 因此这里不需要（也不应该）跟随 modelValue 反复重置表单。
 */
const initialValues: UserFormData = { ...modelValue.value };

const contextLabel = computed(() => props.itemName ?? props.record?.name);

const schema = computed<DynamicFormSchema<UserFormData>>(() => [
  {
    fieldName: 'name',
    label: '姓名',
    component: 'text',
    required: true,
    requiredMessage: '请输入姓名',
    fieldProps: { placeholder: '请输入姓名' },
  },
  {
    fieldName: 'email',
    label: '邮箱',
    component: 'text',
    required: props.showValidation,
    requiredMessage: '请输入邮箱',
    rules: [{ type: 'email', message: '邮箱格式不正确' }],
    fieldProps: { placeholder: '请输入邮箱' },
  },
  {
    fieldName: 'department',
    label: '部门',
    component: 'text',
    fieldProps: { placeholder: '请输入部门' },
  },
  {
    fieldName: 'role',
    label: '角色',
    component: 'select',
    fieldProps: {
      placeholder: '请选择角色',
      options: [
        { label: '管理员', value: '管理员' },
        { label: '编辑者', value: '编辑者' },
        { label: '只读成员', value: '只读成员' },
      ],
    },
  },
  // 复杂表单示例：同一份内容组件按 componentProps 决定字段数量。
  ...(props.showComplex
    ? ([
        {
          fieldName: 'phone',
          label: '联系电话',
          component: 'text',
          rules: [{ pattern: /^1\d{10}$/, message: '请输入 11 位手机号' }],
          fieldProps: { placeholder: '请输入手机号' },
        },
        {
          fieldName: 'remark',
          label: '备注',
          component: 'textarea',
          fieldProps: {
            placeholder: '请输入备注',
            maxlength: 200,
            showCount: true,
            autoSize: { minRows: 3, maxRows: 5 },
          },
        },
      ] satisfies DynamicFormSchema<UserFormData>)
    : []),
]);

/** DynamicForm 是只读值视图，编辑结果通过事件回传给 DynamicButton 的 v-model。 */
function syncValue(values: Readonly<UserFormData>): void {
  modelValue.value = { ...values };
}

/** 校验通过后返回的值会替换 v-model，再交给 action.submit。 */
defineExpose<DynamicButtonContentExpose<UserFormData>>({
  validate: async () => ({ ...(await formApi.validate()) }),
});
</script>

<style scoped>
.user-form {
  padding: 4px 0;
}
</style>
