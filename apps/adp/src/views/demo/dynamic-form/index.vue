<template>
  <div class="h-full p-4">
    <div class="mx-auto max-w-6xl">
      <h1 class="mb-1 text-2xl font-semibold">DynamicForm Demo</h1>
      <p class="mb-6 text-sm text-text-secondary">
        Schema 驱动的 Vue 3.5 动态表单，组件、校验与 dependencies 均直接声明在字段中。
      </p>

      <a-card title="useForm 预绑定组件" class="mb-6">
        <template #extra>
          <a-space wrap>
            <a-button size="small" @click="fillForm">填充数据</a-button>
            <a-button size="small" @click="toggleCompanyRequired">切换企业名称必填</a-button>
            <a-button size="small" @click="validateForm">校验</a-button>
            <a-button size="small" @click="formApi.resetFields()">重置</a-button>
          </a-space>
        </template>

        <Form>
          <template #customCode="{ value, updateValue, disabled }">
            <a-input
              :value="value"
              :disabled="disabled"
              placeholder="字段插槽优先于 component"
              @update:value="updateValue"
            >
              <template #prefix>
                <span class="text-xs text-text-tertiary">CUSTOM</span>
              </template>
            </a-input>
          </template>
        </Form>

        <a-divider>实时数据</a-divider>
        <pre class="overflow-auto rounded-lg bg-fill-quaternary p-4 text-xs">{{
          JSON.stringify(formApi.formData.value, null, 2)
        }}</pre>
      </a-card>

      <a-card title="直接使用 DynamicForm + v-model">
        <DynamicForm
          v-model="simpleFormData"
          :schema="simpleSchema"
          layout="vertical"
          :column="2"
          :show-default-actions="false"
        />
        <pre class="mt-4 overflow-auto rounded-lg bg-fill-quaternary p-4 text-xs">{{
          JSON.stringify(simpleFormData, null, 2)
        }}</pre>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, h, ref } from 'vue';
import { Input, message } from 'antdv-next';
import { DynamicForm, useForm } from '@package/common-ui';

import type { DynamicFormSchema } from '@package/common-ui';

defineOptions({ name: 'DemoDynamicForm' });

interface DemoFormData {
  name?: string;
  age?: number;
  gender?: string;
  userType?: 'personal' | 'company';
  companyName?: string;
  enabled?: boolean;
  birthday?: string;
  activeRange?: string[];
  customCode?: string;
  profile?: {
    city?: string;
    address?: string;
  };
  settings?: {
    remark?: string;
  };
  contacts?: Array<{
    name?: string;
    phone?: string;
  }>;
}

const InlineCodeInput = defineComponent({
  name: 'InlineCodeInput',
  props: {
    value: { type: String, default: '' },
    disabled: Boolean,
  },
  emits: {
    'update:value': (_value: string) => true,
  },
  setup(props, { emit }) {
    return () =>
      h(Input, {
        value: props.value,
        disabled: props.disabled,
        placeholder: '直接传入 Vue Component',
        'onUpdate:value': (value: string) => emit('update:value', value),
      });
  },
});

const schema: DynamicFormSchema<DemoFormData> = [
  {
    fieldName: 'name',
    label: '姓名',
    required: true,
    component: 'text',
    componentProps: { allowClear: true, placeholder: '请输入姓名' },
    rules: [{ min: 2, message: '姓名至少两个字符' }],
    renderComponentContent: () => ({
      suffix: () => h('span', { class: 'text-xs text-text-tertiary' }, '必填'),
    }),
  },
  {
    fieldName: 'age',
    label: '年龄',
    component: 'number',
    componentProps: { min: 0, max: 120 },
  },
  {
    fieldName: 'gender',
    label: '性别',
    component: 'radio',
    componentProps: {
      options: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' },
      ],
    },
  },
  {
    fieldName: 'userType',
    label: '用户类型',
    component: 'select',
    componentProps: {
      options: [
        { label: '个人', value: 'personal' },
        { label: '企业', value: 'company' },
      ],
    },
  },
  {
    fieldName: 'enabled',
    label: '启用',
    component: 'switch',
    defaultValue: true,
  },
  {
    fieldName: 'companyName',
    label: '企业名称',
    component: 'text',
    dependencies: {
      triggerFields: ['userType', 'enabled'],
      if: (values) => values.userType === 'company',
      disabled: (values) => !values.enabled,
      required: (values) => values.userType === 'company',
      componentProps: (values) => ({
        placeholder: values.enabled ? '请输入企业名称' : '当前已禁用',
      }),
    },
  },
  {
    fieldName: 'birthday',
    label: '成立日期',
    component: 'datePicker',
  },
  {
    fieldName: 'activeRange',
    label: '有效期',
    component: 'rangePicker',
  },
  {
    fieldName: 'customCode',
    label: () => h('span', { class: 'font-medium' }, '自定义编码'),
    component: InlineCodeInput,
  },
  {
    fieldName: 'profile',
    label: '扩展信息',
    component: 'card',
    children: [
      {
        fieldName: 'city',
        label: '城市',
        component: 'text',
      },
      {
        fieldName: 'address',
        label: '地址',
        component: 'textarea',
      },
    ],
  },
  {
    fieldName: 'contacts',
    label: '联系人',
    component: 'arrayField',
    minItems: 1,
    maxItems: 4,
    defaultValue: [{ name: '', phone: '' }],
    children: [
      {
        fieldName: 'name',
        label: '姓名',
        required: true,
        component: 'text',
        componentProps: {
          onChange: (e: any) => {
            console.log('onChange', e);
          },
        },
      },
      {
        fieldName: 'phone',
        label: '手机号',
        component: 'text',
      },
    ],
  },
  {
    fieldName: 'settings',
    label: '折叠配置',
    component: 'collapse',
    children: [
      {
        fieldName: 'remark',
        label: '备注',
        component: 'textarea',
        componentProps: { placeholder: 'Collapse 容器内的相对路径字段' },
      },
    ],
  },
];

const [Form, formApi] = useForm<DemoFormData>({
  schema,
  initialValues: {
    userType: 'personal',
    enabled: true,
  },
  layout: 'horizontal',
  column: 2,
  labelWidth: 100,
  handleSubmit(values) {
    message.success(`提交成功：${JSON.stringify(values)}`);
  },
  handleFinishFailed() {
    message.error('请检查表单校验项');
  },
});

const fillForm = () => {
  formApi.setValues({
    name: 'DynamicForm',
    age: 18,
    gender: 'male',
    userType: 'company',
    companyName: '示例科技有限公司',
  });
};

const toggleCompanyRequired = () => {
  const companySchema = formApi.getSchema().find((item) => item.fieldName === 'companyName');
  const required = companySchema && 'required' in companySchema ? companySchema.required : false;

  formApi.updateSchema([
    {
      fieldName: 'companyName',
      required: required !== true,
    },
  ]);
};

const validateForm = async () => {
  try {
    await formApi.validate();
    message.success('校验通过');
  } catch {
    message.error('校验未通过');
  }
};

const simpleFormData = ref({ keyword: '', count: 1 });
const simpleSchema: DynamicFormSchema = [
  {
    fieldName: 'keyword',
    label: '关键词',
    component: 'text',
    componentProps: { placeholder: '直接组件模式' },
  },
  {
    fieldName: 'count',
    label: '数量',
    component: 'number',
    componentProps: { min: 1 },
  },
];
</script>
