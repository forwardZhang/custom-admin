<template>
  <div class="example-container">
    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">条件显示字段</h3>
          <p class="section-description">通过 if 属性根据其他字段值动态显示/隐藏字段</p>
        </div>
      </div>

      <div class="demo-block">
        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <ConditionalForm :schema="conditionalSchema" :initial-values="conditionalInitial" />
          <div class="rounded-lg border border-border-secondary p-4">
            <h4 class="m-0 mb-3 text-sm font-semibold text-text">表单数据</h4>
            <pre class="m-0 max-h-100 overflow-auto text-xs text-text-secondary">{{
              JSON.stringify(conditionalApi.values, null, 2)
            }}</pre>
          </div>
        </div>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">动态必填</h3>
          <p class="section-description">required 可以是函数，根据条件动态设置是否必填</p>
        </div>
      </div>

      <div class="demo-block">
        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <DynamicRequiredForm
            :schema="dynamicRequiredSchema"
            :initial-values="dynamicRequiredInitial"
            show-default-actions
          />
          <div class="rounded-lg border border-border-secondary p-4">
            <h4 class="m-0 mb-3 text-sm font-semibold text-text">表单数据</h4>
            <pre class="m-0 max-h-100 overflow-auto text-xs text-text-secondary">{{
              JSON.stringify(dynamicRequiredApi.values, null, 2)
            }}</pre>
          </div>
        </div>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">动态禁用</h3>
          <p class="section-description">disabled 可以是函数，根据条件动态禁用字段</p>
        </div>
      </div>

      <div class="demo-block">
        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <DynamicDisabledForm
            :schema="dynamicDisabledSchema"
            :initial-values="dynamicDisabledInitial"
          />
          <div class="rounded-lg border border-border-secondary p-4">
            <h4 class="m-0 mb-3 text-sm font-semibold text-text">表单数据</h4>
            <pre class="m-0 max-h-100 overflow-auto text-xs text-text-secondary">{{
              JSON.stringify(dynamicDisabledApi.values, null, 2)
            }}</pre>
          </div>
        </div>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">动态标签和属性</h3>
          <p class="section-description">label 和 fieldProps 都支持函数形式，实现复杂的动态逻辑</p>
        </div>
      </div>

      <div class="demo-block">
        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <DynamicLabelForm :schema="dynamicLabelSchema" :initial-values="dynamicLabelInitial" />
          <div class="rounded-lg border border-border-secondary p-4">
            <h4 class="m-0 mb-3 text-sm font-semibold text-text">表单数据</h4>
            <pre class="m-0 max-h-100 overflow-auto text-xs text-text-secondary">{{
              JSON.stringify(dynamicLabelApi.values, null, 2)
            }}</pre>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { DynamicFormSchema } from '@package/common-ui';
import { useDynamicForm } from '@package/common-ui';

defineOptions({ name: 'DynamicExample' });

interface ConditionalValues {
  userType?: 'individual' | 'company';
  name?: string;
  companyName?: string;
  employeeCount?: number;
  taxId?: string;
}

interface DynamicRequiredValues {
  needInvoice?: boolean;
  invoiceType?: string;
  invoiceTitle?: string;
  taxNumber?: string;
}

interface DynamicDisabledValues {
  active?: boolean;
  startDate?: unknown;
  endDate?: unknown;
  description?: string;
}

interface DynamicLabelValues {
  language?: 'zh' | 'en';
  name?: string;
  description?: string;
}

// 条件显示
const conditionalInitial: ConditionalValues = {
  userType: 'individual',
};

const conditionalSchema: DynamicFormSchema<ConditionalValues> = [
  {
    fieldName: 'userType',
    label: '用户类型',
    component: 'radio',
    required: true,
    fieldProps: {
      optionType: 'button',
      options: [
        { label: '个人用户', value: 'individual' },
        { label: '企业用户', value: 'company' },
      ],
    },
  },
  {
    fieldName: 'name',
    label: '姓名',
    component: 'text',
    if: ({ values }) => values.userType === 'individual',
    required: true,
    fieldProps: { placeholder: '请输入姓名' },
  },
  {
    fieldName: 'companyName',
    label: '企业名称',
    component: 'text',
    if: ({ values }) => values.userType === 'company',
    required: true,
    fieldProps: { placeholder: '请输入企业名称' },
  },
  {
    fieldName: 'employeeCount',
    label: '员工人数',
    component: 'number',
    if: ({ values }) => values.userType === 'company',
    required: true,
    fieldProps: { min: 1, max: 100000 },
  },
  {
    fieldName: 'taxId',
    label: '纳税人识别号',
    component: 'text',
    if: ({ values }) => values.userType === 'company',
    fieldProps: { placeholder: '请输入纳税人识别号' },
  },
];

const [ConditionalForm, conditionalApi] = useDynamicForm<ConditionalValues>();

// 动态必填
const dynamicRequiredInitial: DynamicRequiredValues = {
  needInvoice: false,
};

const dynamicRequiredSchema: DynamicFormSchema<DynamicRequiredValues> = [
  {
    fieldName: 'needInvoice',
    label: '是否需要发票',
    component: 'switch',
  },
  {
    fieldName: 'invoiceType',
    label: '发票类型',
    component: 'radio',
    required: ({ values }) => values.needInvoice === true,
    requiredMessage: '请选择发票类型',
    fieldProps: {
      options: [
        { label: '增值税普通发票', value: 'normal' },
        { label: '增值税专用发票', value: 'special' },
      ],
    },
  },
  {
    fieldName: 'invoiceTitle',
    label: '发票抬头',
    component: 'text',
    required: ({ values }) => values.needInvoice === true,
    requiredMessage: '请输入发票抬头',
    fieldProps: { placeholder: '请输入发票抬头' },
  },
  {
    fieldName: 'taxNumber',
    label: '税号',
    component: 'text',
    required: ({ values }) => values.needInvoice === true && values.invoiceType === 'special',
    requiredMessage: '专用发票需要填写税号',
    fieldProps: { placeholder: '请输入税号' },
  },
];

const [DynamicRequiredForm, dynamicRequiredApi] = useDynamicForm<DynamicRequiredValues>();

// 动态禁用
const dynamicDisabledInitial: DynamicDisabledValues = {
  active: false,
};

const dynamicDisabledSchema: DynamicFormSchema<DynamicDisabledValues> = [
  {
    fieldName: 'active',
    label: '激活服务',
    component: 'switch',
  },
  {
    fieldName: 'startDate',
    label: '开始日期',
    component: 'datePicker',
    disabled: ({ values }) => !values.active,
    fieldProps: { placeholder: '请选择开始日期' },
  },
  {
    fieldName: 'endDate',
    label: '结束日期',
    component: 'datePicker',
    disabled: ({ values }) => !values.active,
    fieldProps: { placeholder: '请选择结束日期' },
  },
  {
    fieldName: 'description',
    label: '服务说明',
    component: 'textarea',
    itemClass: 'md:col-span-2',
    disabled: ({ values }) => !values.active,
    fieldProps: {
      placeholder: '请输入服务说明',
      autoSize: { minRows: 3, maxRows: 6 },
    },
  },
];

const [DynamicDisabledForm, dynamicDisabledApi] = useDynamicForm<DynamicDisabledValues>();

// 动态标签和属性
const dynamicLabelInitial: DynamicLabelValues = {
  language: 'zh',
};

const dynamicLabelSchema: DynamicFormSchema<DynamicLabelValues> = [
  {
    fieldName: 'language',
    label: '语言',
    component: 'radio',
    fieldProps: {
      optionType: 'button',
      options: [
        { label: '中文', value: 'zh' },
        { label: 'English', value: 'en' },
      ],
    },
  },
  {
    fieldName: 'name',
    label: ({ values }) => (values.language === 'zh' ? '姓名' : 'Name'),
    component: 'text',
    required: true,
    fieldProps: ({ values }) => ({
      placeholder: values.language === 'zh' ? '请输入姓名' : 'Please enter your name',
    }),
  },
  {
    fieldName: 'description',
    label: ({ values }) => (values.language === 'zh' ? '描述' : 'Description'),
    component: 'textarea',
    itemClass: 'md:col-span-2',
    fieldProps: ({ values }) => ({
      placeholder: values.language === 'zh' ? '请输入描述' : 'Please enter description',
      autoSize: { minRows: 3, maxRows: 6 },
    }),
  },
];

const [DynamicLabelForm, dynamicLabelApi] = useDynamicForm<DynamicLabelValues>();
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
