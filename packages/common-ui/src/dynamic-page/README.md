# DynamicPage

`DynamicPage` 在组件内部组合 `DynamicSearch` 与 `DynamicTable`，统一管理已提交搜索条件、
首屏请求和查询刷新，并把两个子 API 以命名空间形式 expose 出来。

## 一条数据流

配置走 props（`search` / `table` 两个配置块），命令走 `api.search` / `api.table`，事件走 emits。
api 上没有写配置的方法——改配置就是改 props。

```vue
<template>
  <Page :search="searchConfig" :table="tableConfig" fill>
    <template #toolbar-right>
      <Button type="primary">新增用户</Button>
    </template>

    <template #bodyCell="{ column, record }">
      <span v-if="column.key === 'name'">{{ record.name }}</span>
    </template>
  </Page>
</template>

<script setup lang="ts">
import type {
  DynamicPageRequest,
  DynamicPageSearchProps,
  DynamicPageTableProps,
} from '@package/common-ui';
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

const requestUsers: DynamicPageRequest<UserQuery, User> = ({
  searchValues,
  current,
  pageSize,
  signal,
}) => getUserPageApi({ ...searchValues, current, pageSize }, signal);

const searchConfig: DynamicPageSearchProps<UserQuery> = {
  schema: searchSchema,
  columns: 4,
  initialValues: { status: 'enabled' },
};

const tableConfig: DynamicPageTableProps<UserQuery, User> = {
  columns,
  request: requestUsers,
};

const [Page, page] = useDynamicPage<UserQuery, User>();

async function searchAdmin(): Promise<void> {
  page.search.setFieldValue('keyword', 'admin');
  await page.search.submit();
}

async function reloadAfterSave(): Promise<void> {
  await page.table.reload();
}
</script>
```

不用 hook 时直接 `<DynamicPage ref="pageRef" …>`，`pageRef` 的类型就是
`DynamicPageApi<TSearch, TRecord>`——与 hook 返回的 api 是同一份。

## API

| 成员           | 说明                                   |
| -------------- | -------------------------------------- |
| `search`       | `DynamicSearchApi<TSearch>`            |
| `table`        | `DynamicTableApi<TRecord>`             |
| `searchValues` | 最近一次查询或重置后的条件快照（只读） |

两个子 api 本身就是引用稳定的代理，挂载前的排队 / 兜底语义与各自模块一致。

## 请求条件

- `table.request` 用页面级签名 `DynamicPageRequest`，上下文里多一份 `searchValues`；页面用
  `computed` 包一层后作为普通 `request` 传给表格，不需要自己拼条件。
- `searchValues` 是最近一次查询校验成功或重置后的深拷贝。输入字段但尚未查询时，分页、排序
  和刷新仍使用上一次已提交条件；折叠隐藏的字段其值仍然参与请求。
- 首屏请求由页面显式编排：表格拿到的是 `:immediate="false"`，页面在 `onMounted` 里读到搜索区
  的完整初始值后调一次 `table.reload()`（子组件先于父组件挂载，可靠），因此首屏只发一次请求。
- `table.immediate = false` 会关闭首屏请求。
- `table.request` 换了函数引用会重新取数。
- 请求取消、结果去重、分页 total 和错误事件继续由 `DynamicTable` 处理。

查询和重置默认会清空选中行，并执行 `table.reload({ resetPage: true })`，可分别用
`autoReload` / `clearSelectionOnSearch` 关闭。查询校验失败时不会更新条件快照、清选择或刷新。

## 页面内滚动

`fill` 让页面吃满父容器高度：整页不出现滚动条，搜索区、`between` 与工具栏、分页都固定，
只有表体内部滚动。

```vue
<DynamicPage fill :search="searchConfig" :table="tableConfig" />
```

- 前提是父容器有确定高度（框架布局里的内容区已满足），否则表体拿不到可分配的高度。
- 搜索区展开/收起后剩余高度会自动重新分配，页面依然不滚动。
- `fill` 只有页面级一个来源，页面直接把它传给表格；`table.fill` 不存在。
- 表格侧只用官方 `scroll` API 实现（量出剩余高度填进 `scroll.y`），细节见 DynamicTable 的
  「撑满高度」。窄屏（≤640px）同样是撑满布局，若页面以移动端为主，不要开启。

## 插槽

`between` 位于搜索区和表格区之间，不附加面板样式，插槽参数就是页面 api：

```vue
<Page :search="searchConfig" :table="tableConfig">
  <template #between="{ searchValues, search, table }">
    <CustomSummary :query="searchValues" @reset="search.resetFields()" @refresh="table.reload()" />
  </template>
</Page>
```

除 `between` 外，`default`、`title`、`toolbar-left`、`toolbar-right`、`toolbar-batch`、
`bodyCell` 等插槽都会原样转发给 `DynamicTable`。
