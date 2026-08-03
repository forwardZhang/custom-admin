# DynamicSearch

`DynamicSearch` 基于 `DynamicForm` 封装查询表单，复用相同的 schema、校验和表单 API。

## 一条数据流

配置全部走 props，命令走组件 expose，事件走 emits。api 上没有写配置的方法——要动态改
`collapsedCount` 之类的配置，用 `computed` / `reactive` 驱动 props。

### 组件模式

```vue
<template>
  <DynamicSearch
    v-model="query"
    :schema="schema"
    :columns="4"
    :collapsed-count="3"
    @search="loadData"
  />
</template>
```

### Hook 模式

```vue
<template>
  <Search :schema="schema" :columns="4" :collapsed-count="collapsedCount" @search="loadData" />
</template>

<script setup lang="ts">
import { useDynamicSearch } from '@package/common-ui';

interface SearchValues {
  keyword?: string;
  status?: string;
}

const [Search, searchApi] = useDynamicSearch<SearchValues>();

function loadData(values: SearchValues) {
  // ...
}
</script>
```

`searchApi` 是 `DynamicFormApi<T>` 加上 `expanded` 与 `toggleExpand(force?)`，
与组件 `ref` 拿到的 expose 是同一份 `DynamicSearchApi<T>`。

## 布局

- `responsive` 默认为 `true`，字段会随视口宽度从单列逐步增加到 `columns` 列。
- `responsive=false` 时始终使用 `columns` 指定的固定列数。
- 操作按钮始终位于字段布局流的末尾；当前行有空间时贴紧最右侧，无空间时换行并右对齐。
- 布局计算是 `core/layout.ts` 里的纯函数，输入 props、输出栅格描述。

## 折叠

- `collapsible` 默认为 `true`。
- `collapsedCount` 控制折叠时显示的字段数量；未配置时默认为 `columns - 1`，给操作区预留一列。
- 折叠只移除字段节点，字段值、默认值和 schema 仍然保留，隐藏字段不会参与校验。
- `defaultExpanded` 设置初始展开状态，`expand-change` 事件返回后续展开状态。

## 按钮

`searchButtonOptions` / `resetButtonOptions` / `collapseButtonOptions` 是我方配置块
（文案、是否显示、透传属性）；`*Props` 一律表示原样透传给底层 antdv 组件。

## 挂载前可用性

与 `DynamicForm` 完全一致（成员清单直接复用），额外两个成员：

| 类别     | 行为                 | 方法           |
| -------- | -------------------- | -------------- |
| 同步命令 | 空转，dev 下警告一次 | `toggleExpand` |
| getter   | 返回 `false`         | `expanded`     |
