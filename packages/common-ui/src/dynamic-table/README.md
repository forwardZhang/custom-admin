# DynamicTable

`DynamicTable` 在 Antdv Table 之上补齐了异步数据源、服务端分页、选择模式、工具栏与全屏。

## 一条数据流

```
配置：调用方 props ──▶ 组件 props（withDefaults 落默认值）──▶ 内部 composables
命令：调用方 api  ──▶ 组件实例 expose ──▶ 内部 composables
事件：内部 composables ──▶ emits ──▶ 调用方 @event
```

组件是唯一的状态与默认值持有者，状态放在组件内部的 composable 里
（`use-table-request` / `use-table-selection` / `use-table-pagination`）。
**api 上没有任何写配置的方法**：要动态改配置，用 `computed` / `reactive` 驱动 props。

`useDynamicTable` 只做两件事：给出一个绑定了泛型的组件别名（让 `:columns` / `:request` 推断
`TRecord`），以及一个引用稳定的 api 代理（免去 `tableRef.value?.`）。

```ts
const [Table, table] = useDynamicTable<SystemUser>();
```

```vue
<Table :columns="columns" :request="request" selection="multiple" @request-error="onError" />
```

```ts
await table.reload({ resetPage: true });
```

组件也可以独立使用，`ref` 拿到的 expose 与 hook 的 api 是同一份 `DynamicTableApi<TRecord>`。

## API

| 成员                               | 说明                                 |
| ---------------------------------- | ------------------------------------ |
| `selectedRowKeys` / `selectedRows` | 只读快照（getter，返回拷贝）         |
| `loading`                          | 内部请求是否进行中                   |
| `reload(options?)`                 | 重新请求，`resetPage` 可先回到第一页 |
| `clearSelection()`                 | 清空选中并触发对应事件               |
| `toggleFullscreen(force?)`         | 切换全屏                             |
| `getNativeInstance()`              | 逃生舱：底层 Antdv Table 实例        |

## 挂载前可用性

api 的生命周期跟随挂载：

| 类别                | 行为                 | 方法                                           |
| ------------------- | -------------------- | ---------------------------------------------- |
| 返回 Promise 的命令 | 排队，挂载后补发一次 | `reload`                                       |
| 同步命令            | 空转，dev 下警告一次 | `clearSelection` / `toggleFullscreen`          |
| getter              | 返回空值兜底         | `selectedRowKeys` / `selectedRows` / `loading` |
| 依赖底层实例        | 返回 `undefined`     | `getNativeInstance`                            |

`reload()` 在挂载前调用不会立即发请求，而是由挂载后的首次流程补发一次，不会和 `immediate`
的首屏请求重复。

## 请求

- `request` 的返回结构固定为 `{ list, total? }`，不再嗅探返回值形状。
- 分页模式由 `paginationMode` 声明：`'server'`（默认）翻页/筛选/排序都重新请求，总数取
  `total`；`'local'` 只请求一次，切页与排序由底层 Table 在本地完成。
- 新请求会中止旧请求，并用版本号过滤无法取消的过期响应。
- 相同的分页/筛选/排序查询会被去重；工具栏刷新与 `reload()` 强制绕过去重。
- `immediate` 默认为 `true`，`request` 引用变化后会重新请求。

## 行选择

一个 `selection?: false | 'single' | 'multiple'`（默认 `'multiple'`）决定选择模式；
`rowSelection` 用于透传其余 Antdv 配置（`type` 与 `selectedRowKeys` 由组件接管）。
选中 key 支持 `v-model:selected-row-keys`。

## 撑满高度

`fill` 让表格吃满父容器高度：表头与分页固定，只有表体内部滚动。

```vue
<DynamicTable fill :columns="columns" :request="request" />
```

- 前提是父容器有确定高度（例如 flex 布局里的 `flex: 1` 容器），否则表体拿不到可分配的高度。
- 实现只用官方的 `scroll` API：组件量出容器剩余高度（扣掉工具栏、表头、分页、横向滚动条），
  把结果作为像素值填进 `scroll.y`，不覆盖 Table 的内部样式。容器或表格高度变化时自动重算。
- 显式配置的 `scroll.y` 优先，此时按你给的高度处理；`scroll.x` 不受影响。
- `scroll.y` 有值会让底层 Table 切换到固定表头结构（`table-layout: fixed`），建议给列配置 `width`。
- 在 `DynamicPage` 里用页面级的 `fill`，由页面统一控制容器与表格。
