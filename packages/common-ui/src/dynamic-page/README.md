# DynamicPage

`DynamicPage` 在组件内部组合 `DynamicSearch` 与 `DynamicTable`，统一管理已提交搜索条件、
首次请求和查询刷新，并通过组件实例暴露完整的 `searchApi`、`tableApi`。

可以直接使用组件，也可以用 `useDynamicPage` 减少模板配置；两种模式共用同一个
`DynamicPage` 实现。

## 组件模式

不使用 Hook 时，通过组件 ref 获取 API：

```vue
<template>
  <DynamicPage ref="pageRef" :search-config="searchConfig" :table-config="tableConfig">
    <template #toolbar-right>
      <Button type="primary">新增用户</Button>
    </template>

    <template #bodyCell="{ column, record }">
      <span v-if="column.key === 'name'">{{ record.name }}</span>
    </template>
  </DynamicPage>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { DynamicPageInstance } from '@package/common-ui';
import { DynamicPage } from '@package/common-ui';

const pageRef = ref<DynamicPageInstance<UserQuery, User>>();

async function searchAdmin(): Promise<void> {
  pageRef.value?.searchApi.setState('keyword', 'admin');
  await pageRef.value?.searchApi.submit();
}
</script>
```

组件实例同时暴露：

- `searchApi`：完整的动态搜索 API。
- `tableApi`：完整的动态表格 API，`setState({ request })` 继续收到搜索条件。
- `searchValues`：最近一次成功查询或重置后的只读条件。

## Hook 模式

Hook 只负责把配置传给 `DynamicPage`，并把组件实例上的 API 代理出来：

```vue
<template>
  <DynamicPage>
    <template #toolbar-right>
      <Button type="primary">新增用户</Button>
    </template>
  </DynamicPage>
</template>

<script setup lang="ts">
import type { DynamicFormSchema, DynamicPageRequest } from '@package/common-ui';
import { useDynamicPage } from '@package/common-ui';

interface UserQuery {
  keyword?: string;
  status?: string;
}

interface User {
  id: number;
  name: string;
  status: string;
}

const searchSchema: DynamicFormSchema<UserQuery> = [
  { fieldName: 'keyword', label: '关键词', component: 'text' },
  { fieldName: 'status', label: '状态', component: 'select' },
];

const requestUsers: DynamicPageRequest<UserQuery, User> = async ({
  searchValues,
  current,
  pageSize,
  signal,
}) => getUserPageApi({ ...searchValues, current, pageSize }, signal);

const [DynamicPage, searchApi, tableApi] = useDynamicPage<UserQuery, User>({
  searchConfig: {
    schema: searchSchema,
    columns: 4,
    initialValues: { status: 'enabled' },
  },
  tableConfig: {
    columns,
    request: requestUsers,
  },
});

async function searchAdmin(): Promise<void> {
  searchApi.setState('keyword', 'admin');
  await searchApi.submit();
}

async function reloadAfterSave(): Promise<void> {
  await tableApi.reload();
}
</script>
```

Hook 返回的 `searchApi` / `tableApi` 就是 `DynamicPageState` 上的 API 实例，在 DynamicPage
挂载之前即可调用（例如在 `setup` 里预设查询条件）。依赖底层组件实例的方法见下方
「挂载前可用性」。

## 请求条件

- `searchValues` 是最近一次查询校验成功或重置后的深拷贝。
- 输入字段但尚未查询时，分页、排序和刷新仍使用上一次已提交条件。
- 首次请求不再等待挂载：`initialValues` 与 schema 的 `defaultValue` 在 `DynamicPageState`
  构造期就已合并进搜索状态，因此首屏请求直接带上完整条件，且只发一次。
- 折叠隐藏的字段其值仍然参与请求。
- `tableConfig.immediate=false` 会关闭首次请求。
- 请求取消、结果去重、分页 total 和错误回调继续由 `DynamicTable` 处理。

查询和重置默认会清空选中行，并执行 `tableApi.reload({ resetPage: true })`。可以关闭：

```ts
const pageOptions = {
  searchConfig,
  tableConfig,
  autoReload: false,
  clearSelectionOnSearch: false,
};
```

查询校验失败时不会更新搜索快照、清空选择或刷新表格。

## 页面内滚动

`fill` 让页面吃满父容器高度：整页不出现滚动条，搜索区、`between` 与工具栏、分页都固定，
只有表体内部滚动。

```vue
<DynamicPage fill />
```

Hook 模式也可以写在配置里：

```ts
const [DynamicPage, searchApi, tableApi] = useDynamicPage({
  searchConfig,
  tableConfig,
  fill: true,
});
```

- 前提是父容器有确定高度（框架布局里的内容区已满足），否则表体拿不到可分配的高度。
- 搜索区展开/收起后剩余高度会自动重新分配，页面依然不滚动。
- 页面统一接管表格的撑满模式：优先级为 `fill` prop > 页面配置 `fill` > `tableConfig.fill`；
  只配置 `tableConfig.fill` 时页面容器也会跟着进入撑满模式。
- 表格侧只用官方 `scroll` API 实现（量出剩余高度填进 `scroll.y`），细节见 DynamicTable 的
  「撑满高度」。窄屏（≤640px）同样是撑满布局，若页面以移动端为主，不要开启。

## 中间插槽

`between` 位于搜索区和表格区之间，不附加面板样式：

```vue
<DynamicPage>
  <template #between="{ searchValues, searchApi, tableApi }">
    <CustomSummary
      :query="searchValues"
      @reset="searchApi.resetFields()"
      @refresh="tableApi.reload()"
    />
  </template>
</DynamicPage>
```

除 `between` 外，`default`、`title`、`toolbar-left`、`toolbar-right`、
`toolbar-batch`、`bodyCell` 等插槽都会原样转发给 `DynamicTable`。

## 运行时配置

组件实例和 Hook 返回的 API 行为一致：

```ts
searchApi.setOptions({
  collapsedCount: 2,
  handleSearch(values) {
    console.log(values);
  },
});

tableApi.setState({
  columns: nextColumns,
  request: nextRequest,
});
```

`setState({ request })` 传入的仍是 `DynamicPageRequest`，页面在构造期注入的装饰器会自动把
`searchValues` 补进上下文，不需要自己拼。

## 状态归属

`DynamicPageState` 组合一个 `DynamicSearchState` 和一个 `DynamicTableState`，是唯一的状态持有者：

- **Hook 模式**：State 由 `useDynamicPage` 创建，配置改动走 `searchApi.setOptions` / `tableApi.setState`。
- **组件模式**：State 由组件自建，`searchConfig` / `tableConfig` props 是唯一配置来源，
  组件会在 props 变化时同步进 State。

## 挂载前可用性

| 类别                     | 行为                 | 方法                                                                                                                                                          |
| ------------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 纯状态读写               | 立即可用             | `getStates` / `setStates` / `setState` / `setSchema` / `updateSchema` / `setOptions` / `resetFields` / `toggleExpand` / `toggleFullscreen` / `clearSelection` |
| 依赖底层实例、可安全跳过 | 静默跳过             | `clearValidate` / `scrollToField` / `getFormInstance` / `getTableInstance`                                                                                    |
| 依赖底层实例、无法降级   | 抛错                 | `validate` / `submit`                                                                                                                                         |
| 依赖请求生命周期         | 记录意图，挂载后补发 | `reload`                                                                                                                                                      |

## 单挂载不变量

同一份 State 只应被一个组件挂载。同时挂载两个时，命令式 API 只会作用于最后挂载的那个，
开发环境下会输出一次 `console.warn`。
