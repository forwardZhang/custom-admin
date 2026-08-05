<template>
  <div class="example-container">
    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">基础验证</h3>
          <p class="section-description">通过 required 和 requiredMessage 设置必填项</p>
        </div>
      </div>

      <div class="demo-block">
        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <BasicForm
            :schema="basicSchema"
            :initial-values="{}"
            show-default-actions
            @finish="handleFinish"
          />
          <div class="rounded-lg border border-border-secondary p-4">
            <h4 class="m-0 mb-3 text-sm font-semibold text-text">提示</h4>
            <div class="space-y-2 text-xs text-text-secondary">
              <div>• 点击提交按钮触发验证</div>
              <div>• 必填项为空时显示错误提示</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">内置验证规则</h3>
          <p class="section-description">使用 rules 数组配置 Ant Design 的验证规则</p>
        </div>
      </div>

      <div class="demo-block">
        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <RulesForm
            :schema="rulesSchema"
            :initial-values="{}"
            show-default-actions
            @finish="handleFinish"
          />
          <div class="rounded-lg border border-border-secondary p-4">
            <h4 class="m-0 mb-3 text-sm font-semibold text-text">规则说明</h4>
            <div class="space-y-2 text-xs text-text-secondary">
              <div>• <code>type: 'email'</code> - 邮箱格式</div>
              <div>• <code>min / max</code> - 长度限制</div>
              <div>• <code>pattern</code> - 正则表达式</div>
              <div>• <code>validator</code> - 自定义验证函数</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">自定义验证</h3>
          <p class="section-description">使用 validator 函数实现复杂的验证逻辑</p>
        </div>
      </div>

      <div class="demo-block">
        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <CustomForm
            :schema="customSchema"
            :initial-values="customInitial"
            show-default-actions
            @finish="handleFinish"
          />
          <div class="rounded-lg border border-border-secondary p-4">
            <h4 class="m-0 mb-3 text-sm font-semibold text-text">验证逻辑</h4>
            <div class="space-y-2 text-xs text-text-secondary">
              <div>• 密码长度 6-20 位</div>
              <div>• 确认密码必须与密码一致</div>
              <div>• 年龄必须在 18-65 之间</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">异步验证</h3>
          <p class="section-description">
            validator 返回 Promise 实现异步验证（如检查用户名是否已存在）
          </p>
        </div>
      </div>

      <div class="demo-block">
        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <AsyncForm
            :schema="asyncSchema"
            :initial-values="{}"
            show-default-actions
            @finish="handleFinish"
          />
          <div class="rounded-lg border border-border-secondary p-4">
            <h4 class="m-0 mb-3 text-sm font-semibold text-text">提示</h4>
            <div class="space-y-2 text-xs text-text-secondary">
              <div>• 输入 "admin" 会提示用户名已存在</div>
              <div>• 其他用户名验证通过</div>
              <div>• 验证过程会有 loading 状态</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">表单级联验证</h3>
          <p class="section-description">一个字段的验证依赖其他字段的值</p>
        </div>
      </div>

      <div class="demo-block">
        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <CascadeForm
            :schema="cascadeSchema"
            :initial-values="{}"
            show-default-actions
            @finish="handleFinish"
          />
          <div class="rounded-lg border border-border-secondary p-4">
            <h4 class="m-0 mb-3 text-sm font-semibold text-text">验证逻辑</h4>
            <div class="space-y-2 text-xs text-text-secondary">
              <div>• 结束日期不能早于开始日期</div>
              <div>• 任一日期变化时重新验证另一侧</div>
              <div>• 持续天数由两个日期自动计算</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Dayjs } from 'dayjs';
import type { Rule } from 'antdv-next';
import { message } from 'antdv-next';
import type { DynamicFormFieldApi, DynamicFormSchema } from '@package/common-ui';
import { useDynamicForm } from '@package/common-ui';

defineOptions({ name: 'ValidationExample' });

interface BasicValues {
  username?: string;
  email?: string;
  phone?: string;
}

interface RulesValues {
  email?: string;
  password?: string;
  website?: string;
  code?: string;
}

interface CustomValues {
  password?: string;
  confirmPassword?: string;
  age?: number;
}

interface AsyncValues {
  username?: string;
  email?: string;
}

interface CascadeValues {
  /** datePicker 的值就是 Dayjs 对象，比较日期直接用它的实例方法。 */
  startDate?: Dayjs;
  endDate?: Dayjs;
  duration?: number;
}

/**
 * 每个 useDynamicForm() 只持有一个实例引用，
 * 因此一个别名只能渲染一个表单——五个示例各自调用一次。
 */
const [BasicForm] = useDynamicForm<BasicValues>();
const [RulesForm] = useDynamicForm<RulesValues>();
const [CustomForm] = useDynamicForm<CustomValues>();
const [AsyncForm] = useDynamicForm<AsyncValues>();
const [CascadeForm] = useDynamicForm<CascadeValues>();

// 基础验证
const basicSchema: DynamicFormSchema<BasicValues> = [
  {
    fieldName: 'username',
    label: '用户名',
    component: 'text',
    required: true,
    requiredMessage: '请输入用户名',
    fieldProps: { placeholder: '请输入用户名' },
  },
  {
    fieldName: 'email',
    label: '邮箱',
    component: 'text',
    required: true,
    requiredMessage: '请输入邮箱',
    fieldProps: { placeholder: '请输入邮箱' },
  },
  {
    fieldName: 'phone',
    label: '手机号',
    component: 'text',
    required: true,
    requiredMessage: '请输入手机号',
    fieldProps: { placeholder: '请输入手机号' },
  },
];

// 内置验证规则
const rulesSchema: DynamicFormSchema<RulesValues> = [
  {
    fieldName: 'email',
    label: '邮箱',
    component: 'text',
    required: true,
    fieldProps: { placeholder: '请输入邮箱' },
    rules: [{ type: 'email', message: '请输入正确的邮箱格式' }],
  },
  {
    fieldName: 'password',
    label: '密码',
    component: 'text',
    required: true,
    fieldProps: { type: 'password', placeholder: '请输入密码' },
    rules: [
      { min: 6, message: '密码长度至少 6 位' },
      { max: 20, message: '密码长度最多 20 位' },
    ],
  },
  {
    fieldName: 'website',
    label: '网站',
    component: 'text',
    fieldProps: { placeholder: '请输入网站地址' },
    rules: [{ type: 'url', message: '请输入正确的网址格式' }],
  },
  {
    fieldName: 'code',
    label: '邀请码',
    component: 'text',
    fieldProps: { placeholder: '请输入 6 位邀请码' },
    rules: [
      {
        pattern: /^[A-Z0-9]{6}$/,
        message: '邀请码必须是 6 位大写字母或数字',
      },
    ],
  },
];

// 自定义验证
const customInitial: CustomValues = {};

const customSchema: DynamicFormSchema<CustomValues> = [
  {
    fieldName: 'password',
    label: '密码',
    component: 'text',
    required: true,
    fieldProps: { type: 'password', placeholder: '请输入密码' },
    rules: [
      {
        validator: async (_rule: Rule, value: string) => {
          if (!value) {
            throw new Error('请输入密码');
          }
          if (value.length < 6 || value.length > 20) {
            throw new Error('密码长度必须在 6-20 位之间');
          }
        },
      },
    ],
  },
  {
    fieldName: 'confirmPassword',
    label: '确认密码',
    component: 'text',
    required: true,
    fieldProps: { type: 'password', placeholder: '请再次输入密码' },
    // 跨字段校验：rules 写成 (api) => Rule[]，从 api 上读兄弟字段的值。
    rules: (api) => [
      {
        validator: async (_rule: Rule, value: string) => {
          if (!value) {
            throw new Error('请确认密码');
          }
          // api.values 是实时视图，校验执行时读到的就是当前密码。
          if (value !== api.values.password) {
            throw new Error('两次输入的密码不一致');
          }
        },
      },
    ],
  },
  {
    fieldName: 'age',
    label: '年龄',
    component: 'number',
    required: true,
    fieldProps: { placeholder: '请输入年龄' },
    rules: [
      {
        validator: async (_rule: Rule, value: number) => {
          if (!value) {
            throw new Error('请输入年龄');
          }
          if (value < 18 || value > 65) {
            throw new Error('年龄必须在 18-65 之间');
          }
        },
      },
    ],
  },
];

// 异步验证
const asyncSchema: DynamicFormSchema<AsyncValues> = [
  {
    fieldName: 'username',
    label: '用户名',
    component: 'text',
    required: true,
    fieldProps: { placeholder: '请输入用户名' },
    rules: [
      {
        validator: async (_rule: Rule, value: string) => {
          if (!value) {
            throw new Error('请输入用户名');
          }
          // 模拟异步检查用户名是否存在
          await delay(800);
          if (value === 'admin') {
            throw new Error('该用户名已被占用');
          }
        },
      },
    ],
  },
  {
    fieldName: 'email',
    label: '邮箱',
    component: 'text',
    required: true,
    fieldProps: { placeholder: '请输入邮箱' },
    rules: [
      { type: 'email', message: '请输入正确的邮箱格式' },
      {
        validator: async (_rule: Rule, value: string) => {
          if (!value) return;
          // 模拟异步检查邮箱是否存在
          await delay(600);
          if (value === 'admin@example.com') {
            throw new Error('该邮箱已被注册');
          }
        },
      },
    ],
  },
];

// 表单级联验证
const cascadeSchema: DynamicFormSchema<CascadeValues> = [
  {
    fieldName: 'startDate',
    label: '开始日期',
    component: 'datePicker',
    required: true,
    fieldProps: { placeholder: '请选择开始日期' },
    rules: (api) => [
      {
        validator: async (_rule: Rule, value: Dayjs | undefined) => {
          if (!value) {
            throw new Error('请选择开始日期');
          }
          // 结束日期已选时，开始日期不能晚于它。
          const { endDate } = api.values;
          if (endDate && value.isAfter(endDate, 'day')) {
            throw new Error('开始日期不能晚于结束日期');
          }
        },
      },
    ],
    onChange: (api) => {
      syncCascade(api, 'endDate');
    },
  },
  {
    fieldName: 'endDate',
    label: '结束日期',
    component: 'datePicker',
    required: true,
    fieldProps: { placeholder: '请选择结束日期' },
    rules: (api) => [
      {
        validator: async (_rule: Rule, value: Dayjs | undefined) => {
          if (!value) {
            throw new Error('请选择结束日期');
          }
          // 开始日期已选时，结束日期不能早于它。
          const { startDate } = api.values;
          if (startDate && value.isBefore(startDate, 'day')) {
            throw new Error('结束日期不能早于开始日期');
          }
        },
      },
    ],
    onChange: (api) => {
      syncCascade(api, 'startDate');
    },
  },
  {
    fieldName: 'duration',
    label: '持续天数',
    component: 'number',
    fieldProps: { placeholder: '自动计算', disabled: true },
  },
];

/**
 * 任一日期变化后：重算持续天数，并让另一侧日期重新校验。
 * onChange 在写值之后触发，因此这里读到的 api.values 已经是新值。
 */
function syncCascade(
  api: DynamicFormFieldApi<CascadeValues>,
  sibling: 'startDate' | 'endDate',
): void {
  const { startDate, endDate } = api.values;
  const valid = startDate && endDate && !endDate.isBefore(startDate, 'day');

  api.setFieldValue('duration', valid ? endDate.diff(startDate, 'day') + 1 : undefined);

  // 另一侧有值才重新校验，否则会提前弹出必填提示。
  // 失败信息由字段自己展示，这里只需要吞掉 reject。
  if (api.values[sibling]) {
    api.validate([sibling]).catch(() => {});
  }
}

function handleFinish(values: unknown): void {
  message.success('验证通过，表单提交成功');
  console.log('表单数据:', values);
}

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
