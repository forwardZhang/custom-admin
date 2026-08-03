# DynamicForm 阅读地图

目标：先知道该看哪个文件，再深入实现。

## 一条数据流

```
配置：调用方 props ──▶ 组件 props（withDefaults 落默认值）──▶ 内部 composables
命令：调用方 api  ──▶ 组件实例 expose ──▶ 内部 composables
事件：内部 composables ──▶ emits ──▶ 调用方 @event
```

组件是唯一的状态与默认值持有者。**api 上没有任何写配置的方法**：改 schema 就是改 `:schema`
prop（调用方自己持有 `computed` / `reactive`）。

`useDynamicForm()` 返回 `[Form, formApi]`：一个绑定了泛型的组件别名（让 `:schema` 推断 `T`），
和一个引用稳定的 api 代理。也可以直接用 `DynamicForm` + `ref`，拿到的是同一份
`DynamicFormApi<T>`。

```vue
<Form :schema="schema" :initial-values="initialValues" @finish="onFinish" />
```

## 渲染链路

```
schema + values
    ↓
DynamicForm.vue           // Antdv Form 壳 + 渲染字段列表 + 持有 api
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
| api 的成员清单（含挂载前行为）       | `core/api-definition.ts`                      |
| 值读写、reset 基线、深合并           | `composables/use-form-values.ts`              |
| 校验与提交                           | `composables/use-form-validate.ts`            |
| 字段作用域 API                       | `core/field-api.ts`                           |
| 字段 if/show/disabled/rules/onChange | `composables/use-form-field.ts`               |
| 远程 options                         | `composables/use-form-field-request.ts`       |
| 动态列表增删                         | `composables/use-form-list.ts` + `field/list` |
| 路径工具                             | `utils/path.ts`                               |
| 默认值 / schema 合并                 | `utils/schema.ts`                             |

## API

| 成员                           | 说明                                     |
| ------------------------------ | ---------------------------------------- |
| `values`                       | 只读值快照（getter）                     |
| `getValues()` / `setValues(v)` | 整体读写，`setValues` 接受 `DeepPartial` |
| `getFieldValue(path)`          | 读单个字段                               |
| `setFieldValue(path, v)`       | 写单个字段                               |
| `resetFields(paths?)`          | 回到 `initialValues` 基线                |
| `validate(paths?)`             | 校验，成功返回当前值                     |
| `clearValidate(paths?)`        | 清空校验状态                             |
| `submit()`                     | 校验 + 触发 `finish` / `finish-failed`   |
| `scrollToField(path)`          | 滚动到字段                               |
| `getSchema()`                  | 当前 schema 的只读快照                   |
| `getNativeInstance()`          | 逃生舱：底层 Antdv Form 实例             |

## 设计约定

- **只有一套 API**：字段回调拿到的是 `createFieldApi(api, scope)`——在 `DynamicFormApi` 上加了
  `value` / `field`，不是第二套 context API。
- **函数式配置统一签名**：`(api) => value`，依赖读到的 `api.values` / `api.value` 自动追踪。
- **List 是特殊字段**：`FormField` 识别 `component: 'list'` 后走 `DynamicFormList`，子字段递归
  `FormField`；列表自身的配置写在 `listOptions`（`*Options` = 我方配置，`*Props` = 透传底层）。

## 挂载前可用性

api 的生命周期跟随挂载：

| 类别                | 行为                 | 方法                                                                              |
| ------------------- | -------------------- | --------------------------------------------------------------------------------- |
| 返回 Promise 的命令 | 排队，挂载后补发     | `validate` / `submit`                                                             |
| 同步命令            | 空转，dev 下警告一次 | `setValues` / `setFieldValue` / `resetFields` / `clearValidate` / `scrollToField` |
| getter              | 返回空值兜底         | `values` / `getValues` / `getFieldValue` / `getSchema`                            |
| 依赖底层实例        | 返回 `undefined`     | `getNativeInstance`                                                               |
