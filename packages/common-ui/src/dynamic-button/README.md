# DynamicButton

`DynamicButton` 用一份配置统一「直接操作 / 二次确认 / Modal / Drawer」四种行为，
以及它们共同的异步生命周期（加载默认值 → 校验 → 提交 / 取消）。

## 配置分层

```ts
const config: DynamicButtonConfig<DemoMember, MemberEditorValue> = {
  // 外观
  label: ({ record }) => `编辑 ${record?.name ?? '成员'}`,
  icon: EditOutlined,
  disabled: ({ record }) => record?.role === '管理员',
  buttonProps: { type: 'primary', block: true }, // *Props = 原样透传给 Antdv Button

  // 行为
  action: {
    type: 'modal',
    component: MemberEditor,
    modalProps: { title: '编辑成员', width: 620 },
    getDefaultValue: ({ record }) => fetchMember(record!.id),
    submit: async ({ record, value }) => saveMember(record!.id, value!),
    cancel: async () => undefined,
  },

  // 生命周期
  onSuccess: (payload) => message.success('保存成功'),
  onError: (payload) => message.error(String(payload.error)),
  onCancel: (payload) => log(payload.reason),
  onLoadingChange: (payload) => log(payload.phase),
  onOpenChange: (payload) => log(payload.open),
};
```

```vue
<DynamicButton :config="config" :record="member" />
```

两个泛型参数贯穿所有回调与 payload：

- `TRecord`——`:record` 传进来的业务数据，`label` / `disabled` / `getDefaultValue` / `submit`
  拿到的都是它，不需要在调用方补 `Number(record?.id)` 这类类型转换。
- `TValue`——`getDefaultValue` 产出、内容组件通过 `v-model` 编辑、`submit` 消费的值。

回调随配置传入（`on*` 前缀）而不走 emits：按钮通常渲染在表格单元格里，配置本身就是唯一入口。

## 四种 action

| `action.type` | 容器       | 关键字段                                                         |
| ------------- | ---------- | ---------------------------------------------------------------- |
| `click`       | 无         | `getDefaultValue?` / `submit`                                    |
| `confirm`     | Popconfirm | `confirmProps?` / `getDefaultValue?` / `submit` / `cancel?`      |
| `modal`       | Modal      | `component` / `componentProps?` / `modalProps?` / `footerExtra?` |
| `drawer`      | Drawer     | 同上，容器属性换成 `drawerProps?`                                |

Modal / Drawer 的打开状态、`confirmLoading`、footer、`onOk` / `onCancel` 由组件接管，
类型上已从 `modalProps` / `drawerProps` 里 `Omit` 掉。

## 弹层内容组件协议

内容组件用标准 `v-model` 与按钮同步值，并可选地 expose 一个 `validate()`：

```vue
<script setup lang="ts">
import type { DynamicButtonContentExpose } from '@package/common-ui';

const modelValue = defineModel<MemberEditorValue>({ required: true });
const [Form, formApi] = useDynamicForm<MemberEditorValue>();

defineExpose<DynamicButtonContentExpose<MemberEditorValue>>({
  validate: () => formApi.validate(),
});
</script>
```

- 组件同时会收到 `record`，用于渲染上下文信息。
- `validate()` 返回值会替换当前 `v-model` 值后再交给 `submit`；抛错则进入 `phase: 'validate'`
  的 `onError`，弹层保持打开。

## 生命周期与并发

- `phase` 依次为 `'load-default'` → `'validate'` → `'submit'`（取消路径为 `'cancel'`），
  任何阶段抛错都会带着 `phase` 进 `onError`。
- 执行期间按钮自动 loading 并阻止重复点击；`buttonProps.loading` 可以叠加外部 loading。
- `onCancel` 的 `reason` 区分 `cancel-button` / `close-icon` / `mask` / `keyboard` / `outside`。

## 命令式 API

```ts
const buttonRef = ref<DynamicButtonApi>();
buttonRef.value?.trigger(); // 不传事件时会创建一个程序化点击事件
```
