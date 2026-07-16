<template>
  <div class="dynamic-form-demo h-full overflow-auto bg-fill-quaternary">
    <header class="border-b border-border-secondary bg-bg-container px-4 py-4 sm:px-6">
      <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="m-0 text-xl font-semibold text-text">客户开户注册</h1>
          <p class="mt-1 mb-0 text-sm text-text-secondary">
            创建客户档案并配置服务周期、通知方式与业务联系人。
          </p>
        </div>

        <a-space wrap>
          <a-button @click="fillForm">
            <template #icon><EditOutlined /></template>
            填充样例
          </a-button>
          <a-button @click="validateForm">
            <template #icon><CheckOutlined /></template>
            校验
          </a-button>
          <a-button @click="resetForm">
            <template #icon><ReloadOutlined /></template>
            重置
          </a-button>
          <a-button type="primary" @click="formApi.submit()">
            <template #icon><SendOutlined /></template>
            提交开户
          </a-button>
        </a-space>
      </div>
    </header>

    <main class="mx-auto grid max-w-7xl gap-4 p-4 sm:p-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section class="min-w-0" aria-label="客户开户注册表单">
        <Form />
      </section>

      <aside class="min-w-0 xl:sticky xl:top-4 xl:self-start">
        <a-card title="档案摘要" size="small" class="mb-4">
          <a-descriptions :column="1" size="small">
            <a-descriptions-item label="客户类型">
              {{ customerTypeText }}
            </a-descriptions-item>
            <a-descriptions-item label="账户状态">
              <a-badge
                :status="formApi.formData.value.active ? 'success' : 'default'"
                :text="formApi.formData.value.active ? '启用' : '停用'"
              />
            </a-descriptions-item>
            <a-descriptions-item label="联系人"> {{ contactCount }} 人 </a-descriptions-item>
            <a-descriptions-item label="通知渠道">
              {{ notificationText }}
            </a-descriptions-item>
          </a-descriptions>
        </a-card>

        <a-card title="实时数据" size="small">
          <pre class="data-preview">{{ formattedFormData }}</pre>
        </a-card>
      </aside>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, h } from 'vue';
import { CheckOutlined, EditOutlined, ReloadOutlined, SendOutlined } from '@antdv-next/icons';
import { find, map, size } from 'lodash-es';
import { message } from 'antdv-next';
import { useForm } from '@package/common-ui';

import type { DynamicFormSchema } from '@package/common-ui';
import ServiceLevelPicker from './components/service-level-picker.vue';

defineOptions({ name: 'DemoDynamicForm' });

type CustomerType = 'individual' | 'company';
type NotificationChannel = 'email' | 'sms' | 'wechat';
type ServiceLevel = 'standard' | 'priority' | 'dedicated';

interface SelectOption {
  label: string;
  value: string;
}

interface RegionOption extends SelectOption {
  cities: SelectOption[];
}

interface DemoFormData {
  accountName?: string;
  customerType?: CustomerType;
  employeeCount?: number;
  industry?: string;
  active?: boolean;
  serviceLevel?: ServiceLevel;
  servicePeriod?: string[];
  notificationChannels?: NotificationChannel[];
  acceptTerms?: boolean;
  profile?: {
    registrationCode?: string;
    foundedDate?: string;
    province?: string;
    city?: string;
    address?: string;
  };
  contacts?: Array<{
    name?: string;
    role?: string;
    phone?: string;
    primary?: boolean;
  }>;
  remark?: string;
}

const regionOptions: RegionOption[] = [
  {
    label: '浙江省',
    value: 'zhejiang',
    cities: [
      { label: '杭州市', value: 'hangzhou' },
      { label: '宁波市', value: 'ningbo' },
      { label: '温州市', value: 'wenzhou' },
    ],
  },
  {
    label: '江苏省',
    value: 'jiangsu',
    cities: [
      { label: '南京市', value: 'nanjing' },
      { label: '苏州市', value: 'suzhou' },
      { label: '无锡市', value: 'wuxi' },
    ],
  },
  {
    label: '上海市',
    value: 'shanghai',
    cities: [{ label: '上海市', value: 'shanghai' }],
  },
];

const industryOptions: SelectOption[] = [
  { label: '软件与信息服务', value: 'software' },
  { label: '智能制造', value: 'manufacturing' },
  { label: '零售与消费', value: 'retail' },
  { label: '专业服务', value: 'professional-services' },
];

const roleOptions: SelectOption[] = [
  { label: '业务负责人', value: 'business' },
  { label: '技术负责人', value: 'technical' },
  { label: '财务负责人', value: 'finance' },
];

const notificationOptions: Array<SelectOption & { customerTypes: CustomerType[] }> = [
  { label: '邮件', value: 'email', customerTypes: ['individual', 'company'] },
  { label: '短信', value: 'sms', customerTypes: ['individual', 'company'] },
  { label: '企业微信', value: 'wechat', customerTypes: ['company'] },
];

const initialValues: DemoFormData = {
  customerType: 'individual',
  active: true,
  serviceLevel: 'standard',
  servicePeriod: [],
  notificationChannels: ['email'],
  acceptTerms: false,
  profile: {
    province: 'zhejiang',
  },
  contacts: [{ name: '', role: 'business', phone: '', primary: true }],
};

const schema: DynamicFormSchema<DemoFormData> = [
  {
    label: '账户信息',
    component: 'card',
    children: [
      {
        fieldName: 'customerType',
        label: '客户类型',
        component: 'radio',
        required: true,
        componentProps: {
          optionType: 'button',
          buttonStyle: 'solid',
          options: [
            { label: '个人客户', value: 'individual' },
            { label: '企业客户', value: 'company' },
          ],
        },
      },
      {
        fieldName: 'accountName',
        label: ({ values }) => (values.customerType === 'company' ? '企业名称' : '客户姓名'),
        component: 'text',
        required: true,
        requiredMessage: '请填写客户名称',
        rules: ({ values }) => [
          {
            min: values.customerType === 'company' ? 4 : 2,
            message:
              values.customerType === 'company' ? '企业名称至少 4 个字符' : '姓名至少 2 个字符',
          },
        ],
        componentProps: ({ values }) => ({
          allowClear: true,
          placeholder:
            values.customerType === 'company' ? '请输入营业执照上的企业名称' : '请输入姓名',
        }),
        renderComponentContent: () => ({
          suffix: () => h('span', { class: 'text-xs text-text-tertiary' }, '必填'),
        }),
      },
      {
        fieldName: 'employeeCount',
        label: '员工人数',
        component: 'number',
        if: ({ values }) => values.customerType === 'company',
        componentProps: {
          min: 1,
          max: 100000,
          precision: 0,
          placeholder: '请输入员工人数',
        },
      },
      {
        fieldName: 'industry',
        label: '所属行业',
        component: 'select',
        if: ({ values }) => values.customerType === 'company',
        required: ({ values }) => values.customerType === 'company',
        componentProps: {
          allowClear: true,
          options: industryOptions,
          placeholder: '请选择所属行业',
        },
      },
      {
        fieldName: 'active',
        label: '启用账户',
        component: 'switch',
        componentProps: {
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
        span: 24,
      },
      {
        fieldName: 'servicePeriod',
        label: '服务周期',
        component: 'rangePicker',
        required: ({ values }) => Boolean(values.active),
        disabled: ({ values }) => !values.active,
        componentProps: {
          allowClear: true,
          placeholder: ['开始日期', '结束日期'],
        },
      },
    ],
  },
  {
    fieldName: 'profile',
    component: 'object',
    children: [
      {
        label: '主体资料',
        component: 'card',
        children: [
          {
            fieldName: 'registrationCode',
            label: '统一社会信用代码',
            component: 'text',
            if: ({ values }) => values.customerType === 'company',
            required: ({ values }) => values.customerType === 'company',
            rules: [
              {
                len: 18,
                message: '统一社会信用代码应为 18 位',
              },
            ],
            componentProps: {
              allowClear: true,
              maxlength: 18,
              placeholder: '请输入 18 位统一社会信用代码',
            },
          },
          {
            fieldName: 'foundedDate',
            label: '成立日期',
            component: 'datePicker',
            if: ({ values }) => values.customerType === 'company',
            componentProps: {
              allowClear: true,
              placeholder: '请选择成立日期',
            },
          },
          {
            fieldName: 'province',
            label: '省份',
            component: 'select',
            required: true,
            componentProps: {
              options: map(regionOptions, ({ label, value }) => ({ label, value })),
              placeholder: '请选择省份',
            },
          },
          {
            fieldName: 'city',
            label: '城市',
            component: 'select',
            required: true,
            disabled: ({ values }) => !values.profile?.province,
            componentProps: ({ values }) => ({
              options: find(regionOptions, { value: values.profile?.province })?.cities ?? [],
              placeholder: values.profile?.province ? '请选择城市' : '请先选择省份',
            }),
          },
          {
            fieldName: 'address',
            label: '详细地址',
            component: 'textarea',
            span: 24,
            componentProps: ({ values }) => ({
              autoSize: { minRows: 2, maxRows: 4 },
              maxlength: 200,
              showCount: true,
              placeholder: values.profile?.city
                ? '请输入街道、门牌号等详细地址'
                : '选择城市后填写详细地址',
            }),
          },
        ],
      },
    ],
  },
  {
    label: '通知配置',
    component: 'card',
    disabled: ({ values }) => !values.active,
    children: [
      {
        fieldName: 'notificationChannels',
        label: '通知渠道',
        component: 'checkboxGroup',
        required: ({ values }) => Boolean(values.active),
        span: 24,
        componentProps: ({ values }) => ({
          options: notificationOptions.filter((option) =>
            option.customerTypes.includes(values.customerType ?? 'individual'),
          ),
        }),
      },
      {
        fieldName: 'acceptTerms',
        label: '协议确认',
        component: 'checkbox',
        required: true,
        span: 24,
        rules: [
          {
            validator: async (_rule, value) => {
              if (value !== true) throw new Error('请确认客户资料与服务条款');
            },
          },
        ],
        renderComponentContent: () => ({
          default: () => '我已核对客户资料，并同意服务条款',
        }),
      },
    ],
  },
  {
    fieldName: 'contacts',
    label: '业务联系人',
    component: 'list',
    required: true,
    minItems: 1,
    maxItems: 4,
    if: ({ values }) => Boolean(values.active),
    createItem: ({ index }) => ({
      name: '',
      role: 'business',
      phone: '',
      primary: index === 0,
    }),
    componentProps: {
      addText: '新增联系人',
      itemTitle: ({ index, item }) =>
        item.name ? `联系人 ${index + 1} · ${String(item.name)}` : `联系人 ${index + 1}`,
    },
    children: [
      {
        fieldName: 'name',
        label: '姓名',
        component: 'text',
        required: true,
        componentProps: ({ index, item }) => ({
          placeholder: `请输入第 ${(index ?? 0) + 1} 位联系人姓名`,
          title: item?.role ? `当前职责：${String(item.role)}` : undefined,
        }),
      },
      {
        fieldName: 'role',
        label: '职责',
        component: 'select',
        required: true,
        componentProps: {
          options: roleOptions,
          placeholder: '请选择职责',
        },
      },
      {
        fieldName: 'phone',
        label: '手机号',
        component: 'text',
        required: ({ values, getSibling }) =>
          (values.notificationChannels?.includes('sms') ?? false) || getSibling('primary') === true,
        rules: ({ values }) =>
          values.notificationChannels?.includes('sms')
            ? [{ pattern: /^1\d{10}$/, message: '请输入 11 位手机号' }]
            : [],
        componentProps: ({ values, index, getSibling }) => ({
          allowClear: true,
          maxlength: 11,
          placeholder: values.notificationChannels?.includes('sms')
            ? `第 ${(index ?? 0) + 1} 位联系人需接收短信`
            : getSibling('role') === 'technical'
              ? '请输入技术负责人手机号'
              : '请输入手机号',
        }),
      },
      {
        fieldName: 'primary',
        label: '主要联系人',
        component: 'checkbox',
        if: ({ index, getSibling }) => index === 0 || getSibling('role') === 'business',
        renderComponentContent: () => ({
          default: () => '设为主要联系人',
        }),
      },
    ],
  },
  {
    label: '补充信息',
    component: 'collapse',
    componentProps: {
      ghost: false,
    },
    children: [
      {
        fieldName: 'remark',
        label: '开户备注',
        component: 'textarea',
        span: 24,
        componentProps: {
          autoSize: { minRows: 3, maxRows: 6 },
          maxlength: 300,
          showCount: true,
          placeholder: '记录特殊约定或后续跟进事项',
        },
      },
    ],
  },
];

let previousProvince = initialValues.profile?.province;

const [Form, formApi] = useForm<DemoFormData>({
  schema,
  initialValues,
  layout: 'horizontal',
  column: 2,
  labelWidth: 116,
  showDefaultActions: false,
  handleValuesChange(values, fieldsChanged) {
    if (
      fieldsChanged.includes('customerType') &&
      values.customerType !== 'company' &&
      values.notificationChannels?.includes('wechat')
    ) {
      formApi.setValue(
        'notificationChannels',
        values.notificationChannels.filter((channel) => channel !== 'wechat'),
      );
    }

    if (!fieldsChanged.includes('profile.province')) return;

    const nextProvince = values.profile?.province;
    if (nextProvince === previousProvince) return;

    previousProvince = nextProvince;
    formApi.setValue('profile.city', undefined);
  },
  handleSubmit(values) {
    message.success(`客户开户资料已提交：${values.accountName ?? '未命名客户'}`);
  },
  handleFinishFailed() {
    message.error('还有必填项或格式错误，请检查后再提交');
  },
});

const customerTypeText = computed(() =>
  formApi.formData.value.customerType === 'company' ? '企业客户' : '个人客户',
);
const contactCount = computed(() => size(formApi.formData.value.contacts));
const notificationText = computed(() => {
  const channels = formApi.formData.value.notificationChannels ?? [];
  const labels = notificationOptions
    .filter((option) => channels.includes(option.value as NotificationChannel))
    .map((option) => option.label);
  return labels.length ? labels.join('、') : '未配置';
});
const formattedFormData = computed(() => JSON.stringify(formApi.formData.value, null, 2));

const fillForm = () => {
  previousProvince = 'zhejiang';
  formApi.setValues({
    accountName: '星河数字科技有限公司',
    customerType: 'company',
    employeeCount: 86,
    industry: 'software',
    active: true,
    serviceLevel: 'dedicated',
    servicePeriod: ['2026-07-16', '2027-07-15'],
    notificationChannels: ['email', 'sms', 'wechat'],
    acceptTerms: true,
    profile: {
      registrationCode: '91330106MA2B12345X',
      foundedDate: '2021-05-18',
      province: 'zhejiang',
      city: 'hangzhou',
      address: '西湖区文三路 90 号数字产业园 A 座',
    },
    contacts: [
      { name: '林晓', role: 'business', phone: '13800138000', primary: true },
      { name: '周宁', role: 'technical', phone: '13900139000', primary: false },
    ],
    remark: '合同签署后开通生产环境，技术联系人负责接口联调。',
  });
  message.success('已填充企业客户样例');
};

const validateForm = async () => {
  try {
    await formApi.validate();
    message.success('表单校验通过');
  } catch {
    message.error('表单校验未通过');
  }
};

const resetForm = () => {
  previousProvince = initialValues.profile?.province;
  formApi.resetFields();
};
</script>

<style scoped>
.dynamic-form-demo {
  min-height: 100%;
}

.data-preview {
  max-height: 520px;
  min-height: 220px;
  margin: 0;
  overflow: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  line-height: 1.65;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  color: var(--ant-color-text-secondary);
}

@media (max-width: 639px) {
  .dynamic-form-demo :deep(.ant-form-item) {
    flex-direction: column;
  }

  .dynamic-form-demo :deep(.ant-form-item-label) {
    flex: none !important;
    padding-bottom: 6px;
    text-align: start;
  }
}
</style>
