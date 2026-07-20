<template>
  <div class="h-full overflow-auto bg-[var(--ant-color-fill-quaternary)]">
    <header
      class="border-b border-[var(--ant-color-border-secondary)] bg-[var(--ant-color-bg-container)] px-4 py-4 sm:px-6"
    >
      <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="m-0 text-xl font-semibold text-[var(--ant-color-text)]">动态表单</h1>
          <p class="mt-1 mb-0 text-sm text-[var(--ant-color-text-secondary)]">
            Schema 驱动的客户资料表单，展示字段联动、原生校验和命令式 API。
          </p>
        </div>

        <a-space wrap>
          <a-button @click="fillForm">填充样例</a-button>
          <a-button @click="validateForm">校验</a-button>
          <a-button @click="resetForm">重置</a-button>
          <a-button type="primary" @click="submitForm">提交</a-button>
        </a-space>
      </div>
    </header>

    <main class="mx-auto grid max-w-7xl gap-4 p-4 sm:p-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section class="min-w-0 rounded-lg bg-[var(--ant-color-bg-container)] p-4 sm:p-6">
        <Form />
      </section>

      <aside class="min-w-0 xl:sticky xl:top-4 xl:self-start">
        <section class="mb-4 rounded-lg bg-[var(--ant-color-bg-container)] p-4">
          <h2 class="m-0 text-base font-medium text-[var(--ant-color-text)]">事件状态</h2>
          <dl class="mt-3 grid gap-2 text-sm">
            <div class="flex justify-between gap-4">
              <dt class="text-[var(--ant-color-text-secondary)]">最近变化字段</dt>
              <dd class="m-0 text-right text-[var(--ant-color-text)]">
                {{ lastChangedField || '-' }}
              </dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-[var(--ant-color-text-secondary)]">最近新值</dt>
              <dd class="m-0 text-right text-[var(--ant-color-text)]">{{ lastChangedValue }}</dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-[var(--ant-color-text-secondary)]">最近旧值</dt>
              <dd class="m-0 text-right text-[var(--ant-color-text)]">{{ lastPreviousValue }}</dd>
            </div>
          </dl>
        </section>

        <section class="rounded-lg bg-[var(--ant-color-bg-container)] p-4">
          <h2 class="m-0 text-base font-medium text-[var(--ant-color-text)]">实时数据</h2>
          <pre
            class="mt-3 max-h-[520px] overflow-auto whitespace-pre-wrap break-words text-xs text-[var(--ant-color-text-secondary)]"
            >{{ formattedFormData }}</pre
          >
        </section>
      </aside>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { SelectProps, TreeSelectProps } from 'antdv-next';

import { computed, h, ref } from 'vue';
import { message } from 'antdv-next';

import type { DynamicFormSchema } from '@package/common-ui';
import { useDynamicForm } from '@package/common-ui';
import { getIndustryOptionsApi, getNotificationOptionsApi } from '@/api/dynamic-form';

import ServiceLevelPicker from './components/service-level-picker.vue';

defineOptions({ name: 'DemoDynamicForm' });

type CustomerType = 'individual' | 'company';
type ServiceLevel = 'standard' | 'priority' | 'dedicated';

interface SelectOption {
  label: string;
  value: string;
}

interface RegionOption extends SelectOption {
  children: SelectOption[];
}

interface DemoFormData {
  accountName?: string;
  loginPassword?: string;
  customerType?: CustomerType;
  employeeCount?: number;
  industry?: string;
  active?: boolean;
  serviceLevel?: ServiceLevel;
  servicePeriod?: unknown;
  notificationChannels?: string[];
  region?: string[];
  treeRegion?: string;
  foundedDate?: unknown;
  contactTime?: unknown;
  remark?: string;
}

const regionOptions: RegionOption[] = [
  {
    label: '浙江省',
    value: 'zhejiang',
    children: [
      { label: '杭州市', value: 'hangzhou' },
      { label: '宁波市', value: 'ningbo' },
    ],
  },
  {
    label: '江苏省',
    value: 'jiangsu',
    children: [
      { label: '南京市', value: 'nanjing' },
      { label: '苏州市', value: 'suzhou' },
    ],
  },
];

const industryOptions: SelectOption[] = [
  { label: '软件与信息服务', value: 'software' },
  { label: '智能制造', value: 'manufacturing' },
  { label: '零售与消费', value: 'retail' },
];

const treeData: TreeSelectProps['treeData'] = [
  {
    title: '华东区域',
    value: 'east',
    children: [
      { title: '上海', value: 'shanghai' },
      { title: '杭州', value: 'hangzhou' },
    ],
  },
];

const selectOptions: SelectProps['options'] = industryOptions;

const initialValues: DemoFormData = {
  customerType: 'individual',
  active: true,
  serviceLevel: 'standard',
  notificationChannels: ['email'],
};

const lastChangedField = ref('');
const lastChangedValue = ref('-');
const lastPreviousValue = ref('-');

const schema: DynamicFormSchema<DemoFormData> = [
  {
    fieldName: 'accountName',
    label: ({ values }) =>
      values.customerType === 'company'
        ? h('span', { class: 'text-red' }, '企业名称')
        : h('span', '客户姓名'),
    component: 'text',
    required: true,
    requiredMessage: '请输入客户名称',
    fieldProps: ({ values }) => {
      return {
        allowClear: true,
        autocomplete: 'off',
        placeholder: values.customerType === 'company' ? '请输入企业名称' : '请输入客户姓名',
      };
    },
    onChange: ({ value, oldValue, fieldName }) => {
      lastChangedField.value = String(fieldName);
      lastChangedValue.value = String(value ?? '-');
      lastPreviousValue.value = String(oldValue ?? '-');
    },
  },
  {
    fieldName: 'customerType',
    label: '客户类型',
    component: 'radio',
    required: true,
    fieldProps: {
      optionType: 'button',
      options: [
        { label: '个人客户', value: 'individual' },
        { label: '企业客户', value: 'company' },
      ],
    },
  },
  {
    fieldName: 'loginPassword',
    label: '登录密码',
    component: 'text',
    required: true,
    fieldProps: {
      type: 'password',
      autocomplete: 'new-password',
    },
    rules: [{ min: 6, message: '登录密码至少 6 个字符' }],
  },
  {
    fieldName: 'employeeCount',
    label: '员工人数',
    component: 'number',
    if: ({ values }) => values.customerType === 'company',
    required: ({ values }) => values.customerType === 'company',
    fieldProps: {
      min: 1,
      max: 100000,
      precision: 0,
    },
  },
  {
    fieldName: 'industry',
    label: '所属行业',
    component: 'select',
    if: ({ values }) => values.customerType === 'company',
    required: ({ values }) => values.customerType === 'company',
    fieldProps: {
      options: selectOptions,
    },
    request: {
      api: ({ values, signal }) => getIndustryOptionsApi(values.customerType, signal),
      loadOn: 'open',
      labelField: 'name',
      valueField: 'code',
    },
  },
  {
    fieldName: 'active',
    label: '启用账户',
    component: 'switch',
    fieldProps: {
      checkedChildren: '启用',
      unCheckedChildren: '停用',
    },
  },
  {
    fieldName: 'serviceLevel',
    label: '服务等级',
    component: ServiceLevelPicker,
    componentModel: {
      prop: 'selected',
      event: 'update:selected',
    },
    required: true,
    disabled: ({ values }) => !values.active,
  },
  {
    fieldName: 'servicePeriod',
    label: '服务周期',
    component: 'rangePicker',
    disabled: ({ values }) => !values.active,
    fieldProps: {
      allowClear: true,
      placeholder: ['开始日期', '结束日期'],
    },
  },
  {
    fieldName: 'region',
    label: '服务区域',
    component: 'cascader',
    fieldProps: {
      options: regionOptions,
    },
  },
  {
    fieldName: 'treeRegion',
    label: '组织区域',
    component: 'treeSelect',
    fieldProps: {
      treeData,
      allowClear: true,
    },
  },
  {
    fieldName: 'notificationChannels',
    label: '通知渠道',
    component: 'checkbox',
    required: true,
    itemClass: 'md:col-span-2',
    fieldProps: {
      options: [{ label: '邮件', value: 'email' }],
    },
    request: {
      api: ({ signal, values }) => {
        return getNotificationOptionsApi(signal);
      },
    },
  },
  {
    fieldName: 'foundedDate',
    label: '成立日期',
    component: 'datePicker',
    if: ({ values }) => values.customerType === 'company',
    fieldProps: {},
  },
  {
    fieldName: 'contactTime',
    label: '联系时间',
    component: 'timePicker',
    fieldProps: {},
  },
  {
    fieldName: 'remark',
    label: '备注',
    component: 'textarea',
    itemClass: 'md:col-span-2',
    fieldProps: {
      maxlength: 300,
      showCount: true,
      autoSize: { minRows: 3, maxRows: 6 },
    },
  },
];

const [Form, formApi] = useDynamicForm<DemoFormData>({
  schema,
  initialValues,
  wrapperClass: 'grid grid-cols-1 gap-x-6 md:grid-cols-2',
  showDefaultActions: true,
  handleSubmit(values) {
    message.success(`已提交：${values.accountName ?? '未命名客户'}`);
  },
  handleFinishFailed() {
    message.error('请先修正表单中的错误');
  },
});

const formattedFormData = computed(() => JSON.stringify(formApi.formData.value, null, 2));

function fillForm() {
  formApi.setValues({
    accountName: '示例客户',
    loginPassword: 'demo1234',
    customerType: 'company',
    employeeCount: 120,
    industry: 'software',
    active: true,
    serviceLevel: 'priority',
    notificationChannels: ['email', 'wechat'],
    region: ['zhejiang', 'hangzhou'],
    treeRegion: 'hangzhou',
  });
  message.success('已填充样例数据');
}

async function validateForm() {
  try {
    await formApi.validate();
    message.success('校验通过');
  } catch {
    message.error('校验未通过');
  }
}

function resetForm() {
  formApi.resetFields();
}

function submitForm() {
  void formApi.submit().catch(() => undefined);
}
</script>
