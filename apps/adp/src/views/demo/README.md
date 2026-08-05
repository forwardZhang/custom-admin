# Demo 组件示例

## 📁 目录结构

```
demo/
├── dynamic-button/          # 动态按钮组件
│   ├── index.vue           # 主入口（Tab 导航）
│   ├── examples/
│   │   ├── basic.vue       # 基础用法
│   │   ├── confirm.vue     # 二次确认
│   │   ├── modal.vue       # Modal 表单
│   │   ├── drawer.vue      # Drawer 表单
│   │   └── lifecycle.vue   # 生命周期事件
│   └── components/
│       └── user-form.vue   # 表单组件
│
├── dynamic-table/           # 动态表格组件
│   ├── index.vue           # 主入口（Tab 导航）
│   └── examples/
│       ├── basic.vue       # 基础用法
│       ├── pagination.vue  # 分页模式
│       ├── selection.vue   # 行选择
│       ├── custom.vue      # 自定义列
│       └── toolbar.vue     # 工具栏
│
├── dynamic-form/            # 动态表单组件
│   ├── index.vue           # 主入口（Tab 导航）
│   ├── examples/
│   │   ├── basic.vue       # 基础表单
│   │   ├── dynamic.vue     # 动态字段
│   │   ├── custom.vue      # 自定义组件
│   │   ├── list.vue        # List 子表单
│   │   ├── async.vue       # 异步请求
│   │   └── validation.vue  # 表单验证
│   └── components/         # 供示例引用的自定义组件
│       ├── service-level-picker.vue  # 自定义字段组件
│       └── contact-list-layout.vue   # 自定义 List 布局组件
│
└── scrollbar/               # 滚动条组件
    ├── index.vue           # 主入口（Tab 导航）
    └── examples/
        ├── basic.vue       # 基础用法
        ├── options.vue     # 配置选项
        ├── events.vue      # 事件与方法
        └── custom.vue      # 自定义样式
```

## ✨ 特性

### 1. DynamicButton - 动态按钮

- **基础用法**
  - Click 操作
  - 异步操作与 Loading
  - 禁用与错误处理
  - 动态配置

- **二次确认**
  - 基础 Popconfirm
  - 列表行操作
  - 异步加载确认信息
  - 自定义确认框

- **Modal 表单**
  - 基础 Modal
  - 异步加载默认值
  - 自定义属性
  - 表单验证

- **Drawer 表单**
  - 基础 Drawer
  - 不同方向与尺寸
  - 列表编辑
  - 复杂表单

- **生命周期**
  - 事件监听（onSuccess, onError, onCancel, onLoadingChange, onOpenChange）
  - 实时日志面板
  - 事件顺序示例

### 2. DynamicTable - 动态表格

- **基础用法**
  - 最简表格
  - 带标题和工具栏
  - 加载状态与空状态

- **分页模式**
  - 本地分页（前端处理）
  - 远程分页（后端处理）

- **行选择**
  - 多选模式
  - 单选模式
  - 自定义选择行为
  - 批量操作

- **自定义列**
  - 自定义单元格渲染
  - 带进度条的列
  - 可展开的行
  - 固定列

- **工具栏**
  - 基础工具栏
  - 带搜索的工具栏
  - 带统计信息的工具栏
  - 完整的工具栏示例

### 3. DynamicForm - 动态表单

- **基础表单**
  - 所有内置字段类型
  - 实时数据预览

- **动态字段**
  - 条件显示字段（if）
  - 动态必填（required 函数）
  - 动态禁用（disabled 函数）
  - 动态标签和属性

- **异步请求**
  - 异步加载选项
  - 不同的加载时机（mount/open）
  - 字段联动请求
  - 自定义字段映射

- **表单验证**
  - 基础验证
  - 内置验证规则
  - 自定义验证
  - 异步验证
  - 表单级联验证

- **自定义组件**
  - 自定义组件接入（component 传组件本身）
  - componentModel 对齐非标准 v-model
  - 自定义组件参与联动与校验
  - renderComponentContent 具名插槽

- **List 子表单**
  - Card 布局（默认）
  - Table 布局 + listColumnProps 列宽
  - min / max 增删限制与 createItem 默认行
  - 自定义布局组件（listOptions.layout 传组件）
  - 子字段联动与行内取值校验

### 4. Scrollbar - 滚动条组件

- **基础用法**
  - 固定高度滚动
  - 最大高度模式
  - 水平与垂直滚动

- **配置选项**
  - always - 始终显示
  - native - 原生滚动条
  - minSize - 最小尺寸

- **事件与方法**
  - scroll 事件
  - end-reached 事件
  - scrollTo/setScrollTop/update 方法

- **自定义样式**
  - CSS 变量自定义
  - 主题色、尺寸、圆角

## 🎯 设计原则

1. **按功能分组** - 每个组件的功能点独立成示例
2. **Tab 导航** - 使用 Tabs 组件切换不同功能示例
3. **结构统一** - 所有 demo 使用相同的布局和样式
4. **示例完整** - 每个功能点都有独立的 section，带标题和描述
5. **代码简洁** - 每个示例文件只关注一个功能点，易于理解

## 🚀 使用方式

访问路由：

- `/demo/dynamic-button` - 动态按钮
- `/demo/dynamic-table` - 动态表格
- `/demo/dynamic-form` - 动态表单
- `/demo/scrollbar` - 滚动条

每个页面都有清晰的 Tab 导航，可以快速切换查看不同功能示例。
