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
