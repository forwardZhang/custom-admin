# DynamicSearch

`DynamicSearch` 基于 `DynamicForm` 封装查询表单，复用相同的 schema、校验和表单 API。

### 组件模式

```vue
<template>
  <DynamicSearch
    v-model="query"
    :schema="schema"
    :columns="4"
    :responsive="true"
    :collapsed-count="3"
    @search="loadData"
  />
</template>
```

### Hook 模式

```vue
<template>
  <Search />
</template>

<script setup lang="ts">
import { useDynamicSearch } from '@package/common-ui';

interface SearchValues {
  keyword?: string;
  status?: string;
}

const [Search, searchApi] = useDynamicSearch<SearchValues>({
  schema,
  initialValues: { status: 'enabled' },
  columns: 4,
  async handleSearch(values) {
    await loadData(values);
  },
});

searchApi.setOptions({ collapsedCount: 2 });
</script>
```

Hook 返回的 `searchApi` 复用 `DynamicFormApi` 的字段、校验、提交和 schema 方法，并增加
`expanded`、`toggleExpand()` 及搜索配置 `setOptions()`。

## 布局

- `responsive` 默认为 `true`，字段会随视口宽度从单列逐步增加到 `columns` 列。
- `responsive=false` 时始终使用 `columns` 指定的固定列数。
- 操作按钮始终位于字段布局流的末尾；当前行有空间时贴紧最右侧，无空间时换行并右对齐。

## 折叠

- `collapsible` 默认为 `true`。
- `collapsedCount` 控制折叠时显示的字段数量；未配置时默认为 `columns - 1`，给操作区预留一列。
- 折叠只移除字段节点，字段值、默认值和 schema 仍然保留，隐藏字段不会参与校验。
- `defaultExpanded` 可设置初始展开状态，`expandChange` 会返回后续展开状态。

## 状态归属

`DynamicSearchState` 内聚一个 `DynamicFormState`，是搜索区唯一的状态持有者：

- **Hook 模式**：State 由 `useDynamicSearch` 创建并通过 `searchState` prop 交给组件，
  因此 `searchApi` 的表单方法（`getStates` / `setStates` / `setSchema` …）在挂载前即可调用。
- **组件模式**：State 由组件自建，props 是唯一配置来源；`modelValue` 与 props 变化会同步进 State。

展开状态、字段值、运行时配置都只有一份，不再由 Hook 与组件各持一半。

## 挂载前可用性

| 类别                     | 行为     | 方法                                                                                                                                |
| ------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 纯状态读写               | 立即可用 | `getStates` / `setStates` / `setState` / `getSchema` / `setSchema` / `updateSchema` / `setOptions` / `resetFields` / `toggleExpand` |
| 依赖底层实例、可安全跳过 | 静默跳过 | `clearValidate` / `scrollToField` / `getFormInstance`                                                                               |
| 依赖底层实例、无法降级   | 抛错     | `validate` / `submit`                                                                                                               |

## 单挂载不变量

同一份 State 只应被一个组件挂载；同时挂载两个时命令式 API 只作用于最后挂载的那个，
开发环境下会 `console.warn` 一次。
