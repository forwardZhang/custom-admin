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
