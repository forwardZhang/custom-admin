<template>
  <div class="example-container">
    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">基础字段类型</h3>
          <p class="section-description">内置的常用表单字段组件</p>
        </div>
      </div>

      <div class="demo-block">
        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <Form :schema="schema" :initial-values="initialValues" />
          <div class="rounded-lg border border-border-secondary p-4">
            <h4 class="m-0 mb-3 text-sm font-semibold text-text">表单数据</h4>
            <pre class="m-0 max-h-100 overflow-auto text-xs text-text-secondary">{{
              JSON.stringify(formApi.values, null, 2)
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

defineOptions({ name: 'BasicExample' });

interface FormData {
  name?: string;
  email?: string;
  age?: number;
  gender?: string;
  interests?: string[];
  active?: boolean;
  birthday?: unknown;
  workTime?: unknown;
  description?: string;
}

const initialValues: FormData = {
  name: '张三',
  active: true,
  interests: ['reading'],
};

const schema: DynamicFormSchema<FormData> = [
  {
    fieldName: 'name',
    label: '姓名',
    component: 'text',
    required: true,
    fieldProps: {
      placeholder: '请输入姓名',
    },
  },
  {
    fieldName: 'email',
    label: '邮箱',
    component: 'text',
    required: true,
    fieldProps: {
      placeholder: '请输入邮箱',
      type: 'email',
    },
  },
  {
    fieldName: 'age',
    label: '年龄',
    component: 'number',
    fieldProps: {
      min: 1,
      max: 150,
    },
  },
  {
    fieldName: 'gender',
    label: '性别',
    component: 'radio',
    fieldProps: {
      options: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' },
      ],
    },
  },
  {
    fieldName: 'interests',
    label: '兴趣爱好',
    component: 'checkbox',
    itemClass: 'md:col-span-2',
    fieldProps: {
      options: [
        { label: '阅读', value: 'reading' },
        { label: '运动', value: 'sports' },
        { label: '音乐', value: 'music' },
        { label: '旅游', value: 'travel' },
      ],
    },
  },
  {
    fieldName: 'active',
    label: '激活状态',
    component: 'switch',
  },
  {
    fieldName: 'birthday',
    label: '生日',
    component: 'datePicker',
    fieldProps: {
      placeholder: '请选择日期',
    },
  },
  {
    fieldName: 'workTime',
    label: '工作时间',
    component: 'timePicker',
    fieldProps: {
      placeholder: '请选择时间',
    },
  },
  {
    fieldName: 'description',
    label: '个人简介',
    component: 'textarea',
    itemClass: 'md:col-span-2',
    fieldProps: {
      placeholder: '请输入个人简介',
      maxlength: 200,
      showCount: true,
      autoSize: { minRows: 3, maxRows: 6 },
    },
  },
];

const [Form, formApi] = useDynamicForm<FormData>();
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
