<template>
  <div class="example-container">
    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">Card 布局</h3>
          <p class="section-description">
            component: 'list' 的默认布局，每行一张卡片，适合字段较多的子表单
          </p>
        </div>
        <Tag>layout = card</Tag>
      </div>

      <div class="demo-block">
        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <CardForm :schema="cardSchema" :initial-values="cardInitial" />
          <div class="rounded-lg border border-border-secondary p-4">
            <h4 class="m-0 mb-3 text-sm font-semibold text-text">表单数据</h4>
            <pre class="m-0 max-h-100 overflow-auto text-xs text-text-secondary">{{
              JSON.stringify(cardApi.values, null, 2)
            }}</pre>
          </div>
        </div>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">Table 布局</h3>
          <p class="section-description">行内表格排列，配合子字段的 listColumnProps 控制列宽</p>
        </div>
        <Tag>layout = table</Tag>
      </div>

      <div class="demo-block">
        <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
          <TableForm :schema="tableSchema" :initial-values="tableInitial" />
          <div class="rounded-lg border border-border-secondary p-4">
            <h4 class="m-0 mb-3 text-sm font-semibold text-text">表单数据</h4>
            <pre class="m-0 max-h-100 overflow-auto text-xs text-text-secondary">{{
              JSON.stringify(tableApi.values, null, 2)
            }}</pre>
          </div>
        </div>
      </div>
    </section>
    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">增删限制与默认行</h3>
          <p class="section-description">min / max 限制行数，createItem 决定新增行的初始值</p>
        </div>
      </div>

      <div class="demo-block">
        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <LimitForm :schema="limitSchema" :initial-values="limitInitial" />
          <div class="rounded-lg border border-border-secondary p-4">
            <h4 class="m-0 mb-3 text-sm font-semibold text-text">表单数据</h4>
            <pre class="m-0 max-h-100 overflow-auto text-xs text-text-secondary">{{
              JSON.stringify(limitApi.values, null, 2)
            }}</pre>
            <h4 class="m-0 mt-4 mb-3 text-sm font-semibold text-text">规则</h4>
            <div class="space-y-2 text-xs text-text-secondary">
              <div>• 至少 1 行，最多 3 行</div>
              <div>• 新增行自动带上序号</div>
              <div>• 关闭了复制按钮</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">自定义布局组件</h3>
          <p class="section-description">
            layout 传组件，接住标准 props 后用 field 插槽渲染每个子字段
          </p>
        </div>
        <Tag>layout = 组件</Tag>
      </div>

      <div class="demo-block">
        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <CustomLayoutForm :schema="customLayoutSchema" :initial-values="customLayoutInitial" />
          <div class="rounded-lg border border-border-secondary p-4">
            <h4 class="m-0 mb-3 text-sm font-semibold text-text">表单数据</h4>
            <pre class="m-0 max-h-100 overflow-auto text-xs text-text-secondary">{{
              JSON.stringify(customLayoutApi.values, null, 2)
            }}</pre>
          </div>
        </div>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">子字段联动与校验</h3>
          <p class="section-description">
            子字段照常支持 rules 与 if；api.item / listIndex 用于读当前行
          </p>
        </div>
      </div>

      <div class="demo-block">
        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <NestedForm
            :schema="nestedSchema"
            :initial-values="nestedInitial"
            show-default-actions
            @finish="handleFinish"
          />
          <div class="rounded-lg border border-border-secondary p-4">
            <h4 class="m-0 mb-3 text-sm font-semibold text-text">表单数据</h4>
            <pre class="m-0 max-h-100 overflow-auto text-xs text-text-secondary">{{
              JSON.stringify(nestedApi.values, null, 2)
            }}</pre>
            <h4 class="m-0 mt-4 mb-3 text-sm font-semibold text-text">联动说明</h4>
            <div class="space-y-2 text-xs text-text-secondary">
              <div>• 打开「计费」该行才出现工时</div>
              <div>• 工时必填，单条不超过 8 小时</div>
              <div>• 关闭计费会清掉该行工时</div>
              <div>• 点击提交校验全部行</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Rule } from 'antdv-next';
import { Tag, message } from 'antdv-next';
import type { DynamicFormFieldApi, DynamicFormSchema } from '@package/common-ui';
import { useDynamicForm } from '@package/common-ui';

import ContactListLayout from '../components/contact-list-layout.vue';

defineOptions({ name: 'ListExample' });

interface Contact {
  name?: string;
  phone?: string;
  relation?: string;
}

interface Sku {
  code?: string;
  price?: number;
  stock?: number;
}

interface Member {
  name?: string;
  role?: string;
}

interface Task {
  title?: string;
  billable?: boolean;
  hours?: number;
}

interface CardValues {
  contacts?: Contact[];
}

interface TableValues {
  skus?: Sku[];
}

interface LimitValues {
  members?: Member[];
}

interface CustomLayoutValues {
  contacts?: Contact[];
}

interface NestedValues {
  tasks?: Task[];
}

/** 每个 useDynamicForm() 只持有一个实例引用，五个示例各自调用一次。 */
const [CardForm, cardApi] = useDynamicForm<CardValues>();
const [TableForm, tableApi] = useDynamicForm<TableValues>();
const [LimitForm, limitApi] = useDynamicForm<LimitValues>();
const [CustomLayoutForm, customLayoutApi] = useDynamicForm<CustomLayoutValues>();
const [NestedForm, nestedApi] = useDynamicForm<NestedValues>();

const cardInitial: CardValues = {
  contacts: [{ name: '张三', phone: '13800000000', relation: 'colleague' }],
};

const cardSchema: DynamicFormSchema<CardValues> = [
  {
    fieldName: 'contacts',
    label: '紧急联系人',
    component: 'list',
    // 不写 layout 时默认就是 card。
    listOptions: { addButtonText: '新增联系人', emptyText: '还没有联系人' },
    // 子字段的 fieldName 相对每一行，最终路径是 contacts.0.name。
    schema: [
      {
        fieldName: 'name',
        label: '姓名',
        component: 'text',
        required: true,
        fieldProps: { placeholder: '请输入姓名' },
      },
      {
        fieldName: 'phone',
        label: '手机号',
        component: 'text',
        fieldProps: { placeholder: '请输入手机号' },
        rules: [{ pattern: /^1\d{10}$/, message: '请输入正确的手机号' }],
      },
      {
        fieldName: 'relation',
        label: '关系',
        component: 'select',
        fieldProps: {
          placeholder: '请选择关系',
          options: [
            { label: '家人', value: 'family' },
            { label: '同事', value: 'colleague' },
            { label: '朋友', value: 'friend' },
          ],
        },
      },
    ],
  },
];

const tableInitial: TableValues = {
  skus: [
    { code: 'SKU-001', price: 99, stock: 20 },
    { code: 'SKU-002', price: 199, stock: 5 },
  ],
};

const tableSchema: DynamicFormSchema<TableValues> = [
  {
    fieldName: 'skus',
    label: '商品规格',
    component: 'list',
    listOptions: { layout: 'table', addButtonText: '新增规格' },
    schema: [
      {
        fieldName: 'code',
        label: '编码',
        component: 'text',
        required: true,
        // table 布局下用 listColumnProps 控制列宽。
        listColumnProps: { minWidth: 160 },
        fieldProps: { placeholder: 'SKU 编码' },
      },
      {
        fieldName: 'price',
        label: '单价',
        component: 'number',
        required: true,
        listColumnProps: { width: 140, align: 'right' },
        fieldProps: { min: 0, precision: 2, placeholder: '0.00' },
      },
      {
        fieldName: 'stock',
        label: '库存',
        component: 'number',
        listColumnProps: { width: 120, align: 'right' },
        fieldProps: { min: 0, placeholder: '0' },
      },
    ],
  },
];

const limitInitial: LimitValues = {
  members: [{ name: '张三', role: 'owner' }],
};

const limitSchema: DynamicFormSchema<LimitValues> = [
  {
    fieldName: 'members',
    label: '项目成员',
    component: 'list',
    listOptions: {
      // min 会让行数到达下限后隐藏删除按钮，max 到达上限后隐藏新增按钮。
      min: 1,
      max: 3,
      showCopy: false,
      addButtonText: '添加成员',
      // createItem 决定新行的初始值，不配置时是空对象。
      createItem: (api) => ({ name: `成员 ${api.listIndex + 1}`, role: 'member' }),
      onAdd: (api) => {
        message.success(`已添加第 ${api.listIndex + 1} 位成员`);
      },
      onDelete: (api) => {
        message.info(`已移除第 ${api.listIndex + 1} 位成员`);
      },
    },
    schema: [
      {
        fieldName: 'name',
        label: '姓名',
        component: 'text',
        required: true,
        fieldProps: { placeholder: '请输入姓名' },
      },
      {
        fieldName: 'role',
        label: '角色',
        component: 'select',
        fieldProps: {
          options: [
            { label: '负责人', value: 'owner' },
            { label: '成员', value: 'member' },
            { label: '观察者', value: 'viewer' },
          ],
        },
      },
    ],
  },
];

const customLayoutInitial: CustomLayoutValues = {
  contacts: [{ name: '李四', phone: '13900000000', relation: 'family' }],
};

const customLayoutSchema: DynamicFormSchema<CustomLayoutValues> = [
  {
    fieldName: 'contacts',
    label: '联系人',
    component: 'list',
    listOptions: {
      // layout 传组件时，内置布局完全交给它，按钮和空态都由组件自己渲染。
      layout: ContactListLayout,
      max: 4,
    },
    schema: [
      {
        fieldName: 'name',
        label: '姓名',
        component: 'text',
        required: true,
        fieldProps: { placeholder: '请输入姓名' },
      },
      {
        fieldName: 'phone',
        label: '手机号',
        component: 'text',
        fieldProps: { placeholder: '请输入手机号' },
      },
      {
        fieldName: 'relation',
        label: '关系',
        component: 'select',
        fieldProps: {
          options: [
            { label: '家人', value: 'family' },
            { label: '同事', value: 'colleague' },
            { label: '朋友', value: 'friend' },
          ],
        },
      },
    ],
  },
];

const nestedInitial: NestedValues = {
  tasks: [{ title: '需求评审', billable: true, hours: 8 }],
};

/**
 * 子字段读同一行的兄弟字段要走 itemPath——
 * api.values 始终是整个表单，直接读 api.values.billable 是拿不到行内值的。
 */
function rowValue<TValue>(
  api: DynamicFormFieldApi<NestedValues>,
  name: string,
): TValue | undefined {
  const { itemPath } = api.field;
  if (!itemPath) {
    return undefined;
  }
  return api.getFieldValue([...itemPath, name]) as TValue | undefined;
}

const nestedSchema: DynamicFormSchema<NestedValues> = [
  {
    fieldName: 'tasks',
    label: '任务清单',
    component: 'list',
    listOptions: {
      min: 1,
      addButtonText: '新增任务',
      createItem: () => ({ billable: true }),
    },
    schema: [
      {
        fieldName: 'title',
        label: '任务名称',
        component: 'text',
        required: true,
        listColumnProps: { minWidth: 180 },
        fieldProps: { placeholder: '请输入任务名称' },
      },
      {
        fieldName: 'billable',
        label: '计费',
        component: 'switch',
        // 关掉计费时清掉工时，避免留下隐藏的脏值。
        onChange: (api) => {
          if (!api.value) {
            const { itemPath } = api.field;
            if (itemPath) {
              api.setFieldValue([...itemPath, 'hours'], undefined);
            }
          }
        },
      },
      {
        fieldName: 'hours',
        label: '工时',
        component: 'number',
        required: true,
        // 只有该行开启计费时才显示并参与校验。
        if: (api) => rowValue<boolean>(api, 'billable') === true,
        fieldProps: { min: 0.5, max: 24, step: 0.5, placeholder: '请输入工时' },
        rules: (api) => [
          {
            validator: async (_rule: Rule, value: number | undefined) => {
              if (value === undefined) {
                throw new Error('请输入工时');
              }
              // 同一行的任务名称参与提示，展示行内取值的写法。
              const title = rowValue<string>(api, 'title') ?? '该任务';
              if (value > 8) {
                throw new Error(`${title}单条工时不能超过 8 小时`);
              }
            },
          },
        ],
      },
    ],
  },
];

function handleFinish(values: NestedValues): void {
  message.success(`提交成功，共 ${values.tasks?.length ?? 0} 条任务`);
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
