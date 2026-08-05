<template>
  <div class="example-container">
    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">异步加载选项</h3>
          <p class="section-description">通过 request.api 异步加载 Select/Checkbox 等组件的选项</p>
        </div>
      </div>

      <div class="demo-block">
        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <AsyncOptionsForm :schema="asyncOptionsSchema" :initial-values="asyncOptionsInitial" />
          <div class="rounded-lg border border-border-secondary p-4">
            <h4 class="m-0 mb-3 text-sm font-semibold text-text">表单数据</h4>
            <pre class="m-0 max-h-100 overflow-auto text-xs text-text-secondary">{{
              JSON.stringify(asyncOptionsApi.values, null, 2)
            }}</pre>
          </div>
        </div>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">不同的加载时机</h3>
          <p class="section-description">通过 request.loadOn 控制何时加载数据</p>
        </div>
      </div>

      <div class="demo-block">
        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <LoadOnForm :schema="loadOnSchema" :initial-values="loadOnInitial" />
          <div class="rounded-lg border border-border-secondary p-4">
            <h4 class="m-0 mb-3 text-sm font-semibold text-text">说明</h4>
            <div class="space-y-2 text-xs text-text-secondary">
              <div><strong>mount</strong> - 组件挂载时加载，不写 loadOn 时的默认值</div>
              <div><strong>open</strong> - 选择控件首次打开时加载</div>
              <div>不配 request 时直接用 fieldProps.options</div>
              <div class="text-text-tertiary">checkbox / radio 只支持 mount</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">字段联动请求</h3>
          <p class="section-description">根据其他字段值动态请求数据</p>
        </div>
      </div>

      <div class="demo-block">
        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <DependentForm :schema="dependentSchema" :initial-values="dependentInitial" />
          <div class="rounded-lg border border-border-secondary p-4">
            <h4 class="m-0 mb-3 text-sm font-semibold text-text">表单数据</h4>
            <pre class="m-0 max-h-100 overflow-auto text-xs text-text-secondary">{{
              JSON.stringify(dependentApi.values, null, 2)
            }}</pre>
          </div>
        </div>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">自定义字段映射</h3>
          <p class="section-description">通过 labelField 和 valueField 自定义选项的字段名</p>
        </div>
      </div>

      <div class="demo-block">
        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <CustomFieldForm :schema="customFieldSchema" :initial-values="customFieldInitial" />
          <div class="rounded-lg border border-border-secondary p-4">
            <h4 class="m-0 mb-3 text-sm font-semibold text-text">表单数据</h4>
            <pre class="m-0 max-h-100 overflow-auto text-xs text-text-secondary">{{
              JSON.stringify(customFieldApi.values, null, 2)
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

defineOptions({ name: 'AsyncExample' });

interface AsyncOptionsValues {
  province?: string;
  city?: string;
  tags?: string[];
}

interface LoadOnValues {
  category1?: string;
  category2?: string;
  category3?: string;
}

interface DependentValues {
  province?: string;
  city?: string;
  district?: string;
}

interface CustomFieldValues {
  department?: string;
  role?: string;
}

// 异步加载选项
const asyncOptionsInitial: AsyncOptionsValues = {};

const asyncOptionsSchema: DynamicFormSchema<AsyncOptionsValues> = [
  {
    fieldName: 'province',
    label: '省份',
    component: 'select',
    required: true,
    request: {
      api: async () => {
        await delay(800);
        return [
          { label: '浙江省', value: 'zhejiang' },
          { label: '江苏省', value: 'jiangsu' },
          { label: '广东省', value: 'guangdong' },
        ];
      },
      loadOn: 'mount',
    },
  },
  {
    fieldName: 'city',
    label: '城市',
    component: 'select',
    required: true,
    request: {
      api: async () => {
        await delay(600);
        return [
          { label: '杭州市', value: 'hangzhou' },
          { label: '宁波市', value: 'ningbo' },
          { label: '温州市', value: 'wenzhou' },
        ];
      },
      loadOn: 'open',
    },
  },
  {
    fieldName: 'tags',
    label: '标签',
    component: 'checkbox',
    itemClass: 'md:col-span-2',
    request: {
      api: async () => {
        await delay(500);
        return [
          { label: '技术', value: 'tech' },
          { label: '产品', value: 'product' },
          { label: '设计', value: 'design' },
          { label: '运营', value: 'operation' },
        ];
      },
      loadOn: 'mount',
    },
  },
];

const [AsyncOptionsForm, asyncOptionsApi] = useDynamicForm<AsyncOptionsValues>();

// 不同的加载时机
const loadOnInitial: LoadOnValues = {};

const loadOnSchema: DynamicFormSchema<LoadOnValues> = [
  {
    fieldName: 'category1',
    label: '分类1 (mount)',
    component: 'select',
    fieldProps: { placeholder: '组件挂载时加载' },
    request: {
      api: async () => {
        await delay(800);
        return [
          { label: '选项 A', value: 'a' },
          { label: '选项 B', value: 'b' },
        ];
      },
      loadOn: 'mount',
    },
  },
  {
    fieldName: 'category2',
    label: '分类2 (open)',
    component: 'select',
    fieldProps: { placeholder: '打开下拉框时加载' },
    request: {
      api: async () => {
        await delay(800);
        return [
          { label: '选项 C', value: 'c' },
          { label: '选项 D', value: 'd' },
        ];
      },
      loadOn: 'open',
    },
  },
  {
    fieldName: 'category3',
    label: '分类3 (静态 options)',
    component: 'select',
    // 不配 request 就是普通静态选项，作为对照。
    fieldProps: {
      placeholder: '选项写在 fieldProps 上',
      options: [
        { label: '选项 E', value: 'e' },
        { label: '选项 F', value: 'f' },
      ],
    },
  },
];

const [LoadOnForm] = useDynamicForm<LoadOnValues>();

// 字段联动请求
const dependentInitial: DependentValues = {};

const dependentSchema: DynamicFormSchema<DependentValues> = [
  {
    fieldName: 'province',
    label: '省份',
    component: 'select',
    required: true,
    fieldProps: { placeholder: '请选择省份' },
    request: {
      api: async () => {
        await delay(500);
        return [
          { label: '浙江省', value: 'zhejiang' },
          { label: '江苏省', value: 'jiangsu' },
        ];
      },
      loadOn: 'mount',
    },
    // onChange 直接收到字段 API 本身，不需要再从参数里取 api。
    onChange: (api) => {
      // 省份变化时清空城市和区县
      api.setFieldValue('city', undefined);
      api.setFieldValue('district', undefined);
    },
  },
  {
    fieldName: 'city',
    label: '城市',
    component: 'select',
    required: true,
    disabled: ({ values }) => !values.province,
    fieldProps: { placeholder: '请先选择省份' },
    request: {
      api: async ({ values }) => {
        if (!values.province) return [];
        await delay(600);
        // 根据省份返回不同的城市
        if (values.province === 'zhejiang') {
          return [
            { label: '杭州市', value: 'hangzhou' },
            { label: '宁波市', value: 'ningbo' },
          ];
        }
        return [
          { label: '南京市', value: 'nanjing' },
          { label: '苏州市', value: 'suzhou' },
        ];
      },
      loadOn: 'open',
    },
    onChange: (api) => {
      // 城市变化时清空区县
      api.setFieldValue('district', undefined);
    },
  },
  {
    fieldName: 'district',
    label: '区县',
    component: 'select',
    disabled: ({ values }) => !values.city,
    fieldProps: { placeholder: '请先选择城市' },
    request: {
      api: async ({ values }) => {
        if (!values.city) return [];
        await delay(500);
        // 根据城市返回不同的区县
        return [
          { label: '西湖区', value: 'xihu' },
          { label: '余杭区', value: 'yuhang' },
          { label: '滨江区', value: 'binjiang' },
        ];
      },
      loadOn: 'open',
    },
  },
];

const [DependentForm, dependentApi] = useDynamicForm<DependentValues>();

// 自定义字段映射
const customFieldInitial: CustomFieldValues = {};

const customFieldSchema: DynamicFormSchema<CustomFieldValues> = [
  {
    fieldName: 'department',
    label: '部门',
    component: 'select',
    fieldProps: { placeholder: '请选择部门' },
    request: {
      api: async () => {
        await delay(600);
        // 后端返回的数据格式
        return [
          { deptName: '技术部', deptId: 'tech' },
          { deptName: '产品部', deptId: 'product' },
          { deptName: '设计部', deptId: 'design' },
        ];
      },
      loadOn: 'mount',
      labelField: 'deptName',
      valueField: 'deptId',
    },
  },
  {
    fieldName: 'role',
    label: '角色',
    component: 'select',
    fieldProps: { placeholder: '请选择角色' },
    request: {
      api: async () => {
        await delay(500);
        return [
          { roleName: '管理员', roleCode: 'admin' },
          { roleName: '编辑者', roleCode: 'editor' },
          { roleName: '查看者', roleCode: 'viewer' },
        ];
      },
      loadOn: 'open',
      labelField: 'roleName',
      valueField: 'roleCode',
    },
  },
];

const [CustomFieldForm, customFieldApi] = useDynamicForm<CustomFieldValues>();

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
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
