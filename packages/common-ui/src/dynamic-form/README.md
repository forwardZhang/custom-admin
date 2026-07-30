# DynamicForm 阅读地图

目标：先知道该看哪个文件，再深入实现。

## 两条入口

1. **组件模式**：直接用 `DynamicForm`，靠 props / events。
2. **命令式模式**：`useDynamicForm()` 返回 `[Form, formApi]`。

两条入口共享同一个 `DynamicFormState`（`core/form-api.ts`）。

## 数据流（最短路径）

```
schema + values
    ↓
DynamicFormState          // 唯一状态 / 命令式 API
    ↓
DynamicForm.vue           // Antdv Form 壳 + 渲染字段列表
    ↓
FormField.vue             // 一个 FormItem
    ↓
useFormField()            // 字段唯一入口：解析 schema + 渲染控件
    ↓
内置 field/* 或自定义组件
```

## 按需求找文件

| 你想看什么                           | 去哪                                          |
| ------------------------------------ | --------------------------------------------- |
| 对外 API / schema 类型               | `types/index.ts`                              |
| 表单状态、submit/reset/setState      | `core/form-api.ts`                            |
| 字段 if/show/disabled/rules/onChange | `composables/use-form-field.ts`               |
| 远程 options                         | `composables/use-form-field-request.ts`       |
| 动态列表增删                         | `composables/use-form-list.ts` + `field/list` |
| 路径工具                             | `utils/path.ts`                               |
| 默认值 / schema 合并                 | `utils/schema.ts`                             |

## 设计约定

- **只有一套 API**：字段回调拿到的是 `createFieldApi(formApi, scope)`，不是第二套 context API。
- **函数式配置统一签名**：`(api) => value`，依赖读到的 `api.states/state` 自动追踪。
- **List 是特殊字段**：`FormField` 识别 `component: 'list'` 后走 `DynamicFormList`，子字段递归 `FormField`。

## 状态归属

`DynamicFormState` 是唯一的状态持有者，API 在构造期就已完整可用，组件挂载只是「补上底层
Antdv Form 实例」：

- **Hook 模式**：`useDynamicForm` 创建 State，并通过 `formState` prop 交给 `DynamicForm`。
  用 prop 而不是 `provide`，避免插槽里嵌套的 `DynamicForm` 静默复用外层状态。
- **组件模式**：State 由组件自建，`modelValue` 与 `schema` props 是唯一配置来源。

组件在 `setup` 里 `attach({ formRef, callbacks })`、在 `onBeforeUnmount` 里 `detach()`。

## 挂载前可用性

| 类别                     | 行为     | 方法                                                                                                                            |
| ------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 纯状态读写               | 立即可用 | `getStates` / `setStates` / `getState` / `setState` / `getSchema` / `setSchema` / `updateSchema` / `setOptions` / `resetFields` |
| 依赖底层实例、可安全跳过 | 静默跳过 | `clearValidate` / `scrollToField` / `getFormInstance`                                                                           |
| 依赖底层实例、无法降级   | 抛错     | `validate` / `submit`                                                                                                           |

`setOptions({ initialValues })` 会同时更新 `resetFields()` 的基线；未挂载时还会立即同步到当前值。

## 单挂载不变量

同一份 State 只应被一个组件挂载；同时挂载两个时命令式 API 只作用于最后挂载的那个，
开发环境下会 `console.warn` 一次。
