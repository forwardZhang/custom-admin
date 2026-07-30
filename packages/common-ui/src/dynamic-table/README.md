# DynamicTable

`DynamicTable` 在 Antdv Table 之上补齐了异步数据源、服务端分页、选择模式、工具栏与全屏。
可以直接用组件，也可以用 `useDynamicTable` 拿到命令式 API；两种模式共用同一个实现。

## 状态归属

`DynamicTableState`（`core/table-state.ts`）是唯一的状态持有者：选中项、请求状态、分页、
筛选排序、全屏开关和运行时配置都在它身上，API 在构造期就已完整可用。

- **Hook 模式**：`useDynamicTable` 创建 State，并通过 `tableState` prop 交给 `DynamicTable`。
- **组件模式**：State 由组件自建（`propsDriven`），props 是唯一配置来源。此时调用
  `api.setState()` 仍会生效，但会被下一次 props 更新覆盖，开发环境下会 `console.warn` 一次。

State 只持有状态与纯派生，不触碰 DOM。全屏的 `body` 滚动锁定与 Escape 监听由宿主组件的
`useDynamicTableFullscreenEffect` 负责；首次请求、`request` 变化重载、卸载中止请求也都在
宿主组件的生命周期里调用 State 的方法。

## 挂载前可用性

| 类别                     | 行为                 | 方法                                                                                          |
| ------------------------ | -------------------- | --------------------------------------------------------------------------------------------- |
| 纯状态读写               | 立即可用             | `setState` / `clearSelection` / `getSelectedRows` / `getSelectedRowKeys` / `toggleFullscreen` |
| 依赖底层实例、可安全跳过 | 静默跳过             | `getTableInstance`                                                                            |
| 依赖请求生命周期         | 记录意图，挂载后补发 | `reload`                                                                                      |

`reload()` 在挂载前调用不会立即发请求，而是记录下来由挂载后的首次流程补发一次，因此不会
和 `immediate` 的首屏请求重复。

## 请求

- `request` 返回数组时按本地数据处理；返回 `{ data: { list, total } }` 时按服务端分页处理。
- 新请求会中止旧请求，并用版本号过滤无法取消的过期响应。
- 相同的分页/筛选/排序查询会被去重；工具栏刷新与 `reload()` 强制绕过去重。
- `immediate` 默认为 `true`，`request` 引用变化后会重新请求。

## 单挂载不变量

同一份 State 只应被一个组件挂载；同时挂载两个时命令式 API 只作用于最后挂载的那个，
开发环境下会 `console.warn` 一次。
