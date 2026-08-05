<template>
  <div class="example-container">
    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">自定义 v-model 约定</h3>
          <p class="section-description">
            component 直接传 Vue 组件；组件用的不是 modelValue 时，用 componentModel 声明
          </p>
        </div>
        <Tag>componentModel</Tag>
      </div>

      <div class="demo-block">
        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <ModelForm :schema="modelSchema" :initial-values="modelInitial" />
          <div class="rounded-lg border border-border-secondary p-4">
            <h4 class="m-0 mb-3 text-sm font-semibold text-text">表单数据</h4>
            <pre class="m-0 max-h-100 overflow-auto text-xs text-text-secondary">{{
              JSON.stringify(modelApi.values, null, 2)
            }}</pre>
          </div>
        </div>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">自定义组件参与联动</h3>
          <p class="section-description">
            自定义字段与内置字段一视同仁：onChange、disabled、if 都照常生效
          </p>
        </div>
      </div>

      <div class="demo-block">
        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <LinkageForm :schema="linkageSchema" :initial-values="linkageInitial" />
          <div class="rounded-lg border border-border-secondary p-4">
            <h4 class="m-0 mb-3 text-sm font-semibold text-text">表单数据</h4>
            <pre class="m-0 max-h-100 overflow-auto text-xs text-text-secondary">{{
              JSON.stringify(linkageApi.values, null, 2)
            }}</pre>
            <h4 class="m-0 mt-4 mb-3 text-sm font-semibold text-text">联动说明</h4>
            <div class="space-y-2 text-xs text-text-secondary">
              <div>• 选专属服务才会出现「专属经理」</div>
              <div>• 切换等级会清空已填的经理</div>
              <div>• 关闭开关后整个选择器禁用</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">renderComponentContent 插槽</h3>
          <p class="section-description">给字段组件传具名插槽，例如给输入框加前后缀</p>
        </div>
      </div>

      <div class="demo-block">
        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <SlotForm :schema="slotSchema" :initial-values="{}" />
          <div class="rounded-lg border border-border-secondary p-4">
            <h4 class="m-0 mb-3 text-sm font-semibold text-text">表单数据</h4>
            <pre class="m-0 max-h-100 overflow-auto text-xs text-text-secondary">{{
              JSON.stringify(slotApi.values, null, 2)
            }}</pre>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue';
import { Tag } from 'antdv-next';
import { UserOutlined } from '@antdv-next/icons';
import type { DynamicFormSchema } from '@package/common-ui';
import { useDynamicForm } from '@package/common-ui';

import ServiceLevelPicker from '../components/service-level-picker.vue';

defineOptions({ name: 'CustomExample' });

type ServiceLevel = 'standard' | 'priority' | 'dedicated';

interface ModelValues {
  level?: ServiceLevel;
  remark?: string;
}

interface LinkageValues {
  enabled?: boolean;
  level?: ServiceLevel;
  manager?: string;
}

interface SlotValues {
  account?: string;
  price?: number;
}

/** 每个 useDynamicForm() 只持有一个实例引用，三个示例各自调用一次。 */
const [ModelForm, modelApi] = useDynamicForm<ModelValues>();
const [LinkageForm, linkageApi] = useDynamicForm<LinkageValues>();
const [SlotForm, slotApi] = useDynamicForm<SlotValues>();

const modelInitial: ModelValues = { level: 'standard' };

const modelSchema: DynamicFormSchema<ModelValues> = [
  {
    fieldName: 'level',
    label: '服务等级',
    // component 传组件本身即可，不需要注册到内置字段表。
    component: ServiceLevelPicker,
    required: true,
    requiredMessage: '请选择服务等级',
    // ServiceLevelPicker 用的是 selected / update:selected，这里显式声明。
    componentModel: { prop: 'selected', event: 'update:selected' },
    description: '组件内部用 selected 收值，靠 componentModel 对齐',
  },
  {
    fieldName: 'remark',
    label: '备注',
    component: 'textarea',
    fieldProps: { placeholder: '请输入备注', autoSize: { minRows: 2, maxRows: 4 } },
  },
];

const linkageInitial: LinkageValues = { enabled: true, level: 'standard' };

const linkageSchema: DynamicFormSchema<LinkageValues> = [
  {
    fieldName: 'enabled',
    label: '启用服务',
    component: 'switch',
  },
  {
    fieldName: 'level',
    label: '服务等级',
    component: ServiceLevelPicker,
    componentModel: { prop: 'selected', event: 'update:selected' },
    // disabled 由表单里另一个字段决定，自定义组件自己接住 disabled prop。
    disabled: (api) => !api.values.enabled,
    onChange: (api) => {
      // 等级变了，已填的专属经理不再适用。
      api.setFieldValue('manager', undefined);
    },
  },
  {
    fieldName: 'manager',
    label: '专属经理',
    component: 'text',
    required: true,
    // if 为 false 时字段整体移除，值也不会参与提交。
    if: (api) => api.values.level === 'dedicated',
    fieldProps: { placeholder: '请输入专属经理姓名' },
  },
];

const slotSchema: DynamicFormSchema<SlotValues> = [
  {
    fieldName: 'account',
    label: '账号',
    component: 'text',
    fieldProps: { placeholder: '请输入账号' },
    // 返回的对象就是传给字段组件的具名插槽。
    renderComponentContent: () => ({
      prefix: () => h(UserOutlined),
      suffix: () => h('span', { class: 'text-xs text-text-tertiary' }, '@example.com'),
    }),
  },
  {
    fieldName: 'price',
    label: '报价',
    component: 'number',
    fieldProps: { min: 0, precision: 2, placeholder: '请输入报价' },
    // InputNumber 的 addonBefore/addonAfter 只认 props，插槽走 prefix/suffix。
    renderComponentContent: () => ({
      prefix: () => h('span', { class: 'text-text-tertiary' }, '¥'),
      suffix: () => h('span', { class: 'text-xs text-text-tertiary' }, '元'),
    }),
  },
];
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
