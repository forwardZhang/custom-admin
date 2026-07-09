<script setup lang="ts">
import { ref, onMounted } from 'vue';

defineOptions({ name: 'DashboardWorkbench' });

/** 快捷操作入口 */
const shortcuts = ref([
  { title: '用户管理', icon: '👤', color: '#1677ff', desc: '管理系统用户' },
  { title: '角色管理', icon: '🛡️', color: '#52c41a', desc: '配置角色权限' },
  { title: '菜单管理', icon: '📋', color: '#faad14', desc: '调整菜单结构' },
  { title: '操作日志', icon: '📝', color: '#722ed1', desc: '查看操作记录' },
  { title: '系统监控', icon: '📊', color: '#13c2c2', desc: '服务运行状态' },
  { title: '数据备份', icon: '💾', color: '#eb2f96', desc: '数据安全备份' },
]);

/** 待办事项 */
const todos = ref([
  { id: 1, title: '完成用户模块接口对接', done: false, priority: 'high' },
  { id: 2, title: '修复登录页样式兼容问题', done: true, priority: 'medium' },
  { id: 3, title: '优化表格组件加载速度', done: false, priority: 'high' },
  { id: 4, title: '编写角色权限单元测试', done: false, priority: 'low' },
  { id: 5, title: '更新部署文档', done: true, priority: 'medium' },
]);

/** 项目动态 */
const activities = ref<
  { id: number; user: string; action: string; target: string; time: string }[]
>([]);

onMounted(() => {
  setTimeout(() => {
    activities.value = [
      { id: 1, user: 'Admin', action: '更新了', target: '用户管理模块', time: '10 分钟前' },
      { id: 2, user: '张三', action: '提交了', target: '角色权限配置', time: '30 分钟前' },
      { id: 3, user: '李四', action: '修复了', target: '登录页 Bug #128', time: '1 小时前' },
      { id: 4, user: 'Admin', action: '部署了', target: 'v1.2.0 正式版', time: '2 小时前' },
      { id: 5, user: '王五', action: '创建了', target: '数据备份任务', time: '3 小时前' },
    ];
  }, 400);
});

/**
 * 切换待办事项完成状态
 * @param params - 配置项
 * @param params.id - 待办事项 ID
 */
function toggleTodo({ id }: { id: number }) {
  const item = todos.value.find((t) => t.id === id);
  if (item) item.done = !item.done;
}

/** 优先级标签颜色映射 */
const priorityMap: Record<string, { label: string; color: string }> = {
  high: { label: '高', color: '#ff4d4f' },
  medium: { label: '中', color: '#faad14' },
  low: { label: '低', color: '#52c41a' },
};
</script>

<template>
  <div class="workbench">
    <!-- 欢迎区 -->
    <div class="workbench__welcome">
      <div>
        <h2 class="workbench__title">工作台</h2>
        <p class="workbench__subtitle">早安，Admin！今天又是充满 Bug 的一天 🐛</p>
      </div>
      <div class="workbench__date">
        {{
          new Date().toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
          })
        }}
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="workbench__section">
      <h3 class="workbench__section-title">快捷入口</h3>
      <div class="workbench__shortcuts">
        <div v-for="item in shortcuts" :key="item.title" class="workbench__shortcut-card">
          <span class="workbench__shortcut-icon" :style="{ backgroundColor: item.color + '15' }">
            {{ item.icon }}
          </span>
          <span class="workbench__shortcut-title">{{ item.title }}</span>
          <span class="workbench__shortcut-desc">{{ item.desc }}</span>
        </div>
      </div>
    </div>

    <!-- 双栏区域：待办 + 动态 -->
    <div class="workbench__grid">
      <!-- 待办事项 -->
      <div class="workbench__card">
        <h3 class="workbench__card-header">
          待办事项
          <span class="workbench__card-badge">
            {{ todos.filter((t) => !t.done).length }} 项待完成
          </span>
        </h3>
        <ul class="workbench__todo-list">
          <li
            v-for="item in todos"
            :key="item.id"
            class="workbench__todo-item"
            :class="{ 'workbench__todo-item--done': item.done }"
            @click="toggleTodo({ id: item.id })"
          >
            <span class="workbench__todo-check">
              {{ item.done ? '✅' : '⬜' }}
            </span>
            <span class="workbench__todo-text">{{ item.title }}</span>
            <span
              class="workbench__todo-priority"
              :style="{ color: priorityMap[item.priority]?.color }"
            >
              {{ priorityMap[item.priority]?.label }}
            </span>
          </li>
        </ul>
      </div>

      <!-- 项目动态 -->
      <div class="workbench__card">
        <h3 class="workbench__card-header">项目动态</h3>
        <div v-if="!activities.length" class="workbench__empty">加载中…</div>
        <ul v-else class="workbench__activity-list">
          <li v-for="item in activities" :key="item.id" class="workbench__activity-item">
            <span class="workbench__activity-dot" />
            <div class="workbench__activity-content">
              <span class="workbench__activity-user">{{ item.user }}</span>
              <span class="workbench__activity-action">{{ item.action }}</span>
              <span class="workbench__activity-target">{{ item.target }}</span>
            </div>
            <span class="workbench__activity-time">{{ item.time }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.workbench {
  max-width: 1200px;
  padding: 0 0 24px;
}

.workbench__welcome {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px;
  margin-bottom: 20px;
  background: linear-gradient(
    135deg,
    var(--ant-color-primary, #1677ff),
    var(--ant-color-primary-hover, #4096ff)
  );
  border-radius: 12px;
  color: #fff;
}

.workbench__title {
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 4px;
}

.workbench__subtitle {
  font-size: 14px;
  opacity: 0.85;
  margin: 0;
}

.workbench__date {
  font-size: 14px;
  opacity: 0.8;
}

.workbench__section {
  margin-bottom: 20px;
}

.workbench__section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--ant-color-text, #1f1f1f);
  margin: 0 0 12px;
}

.workbench__shortcuts {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
}

@media (max-width: 960px) {
  .workbench__shortcuts {
    grid-template-columns: repeat(3, 1fr);
  }
}

.workbench__shortcut-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 12px;
  background: var(--ant-color-bg-container, #fff);
  border-radius: 10px;
  border: 1px solid var(--ant-color-border-secondary, #f0f0f0);
  cursor: pointer;
  transition: all 0.25s ease;
}

.workbench__shortcut-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.workbench__shortcut-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  font-size: 22px;
}

.workbench__shortcut-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--ant-color-text, #1f1f1f);
}

.workbench__shortcut-desc {
  font-size: 12px;
  color: var(--ant-color-text-secondary, #8c8c8c);
}

.workbench__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 768px) {
  .workbench__grid {
    grid-template-columns: 1fr;
  }
}

.workbench__card {
  background: var(--ant-color-bg-container, #fff);
  border-radius: 10px;
  border: 1px solid var(--ant-color-border-secondary, #f0f0f0);
  padding: 20px;
}

.workbench__card-header {
  font-size: 15px;
  font-weight: 600;
  color: var(--ant-color-text, #1f1f1f);
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.workbench__card-badge {
  font-size: 12px;
  font-weight: 400;
  color: var(--ant-color-text-secondary, #8c8c8c);
  background: var(--ant-color-bg-layout, #f5f5f5);
  padding: 2px 8px;
  border-radius: 10px;
}

.workbench__todo-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.workbench__todo-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.workbench__todo-item:hover {
  background: var(--ant-color-bg-layout, #f5f5f5);
}

.workbench__todo-item--done .workbench__todo-text {
  text-decoration: line-through;
  color: var(--ant-color-text-quaternary, #bfbfbf);
}

.workbench__todo-check {
  font-size: 16px;
  flex-shrink: 0;
}

.workbench__todo-text {
  flex: 1;
  font-size: 14px;
  color: var(--ant-color-text, #1f1f1f);
}

.workbench__todo-priority {
  font-size: 12px;
  font-weight: 500;
}

.workbench__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  color: var(--ant-color-text-secondary, #8c8c8c);
  font-size: 14px;
}

.workbench__activity-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.workbench__activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--ant-color-border-secondary, #f0f0f0);
}

.workbench__activity-item:last-child {
  border-bottom: none;
}

.workbench__activity-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ant-color-primary, #1677ff);
  flex-shrink: 0;
  margin-top: 6px;
}

.workbench__activity-content {
  flex: 1;
  font-size: 14px;
  color: var(--ant-color-text, #1f1f1f);
}

.workbench__activity-user {
  font-weight: 500;
  margin-right: 4px;
}

.workbench__activity-action {
  color: var(--ant-color-text-secondary, #8c8c8c);
  margin-right: 4px;
}

.workbench__activity-target {
  color: var(--ant-color-primary, #1677ff);
}

.workbench__activity-time {
  font-size: 12px;
  color: var(--ant-color-text-quaternary, #bfbfbf);
  flex-shrink: 0;
  white-space: nowrap;
}
</style>
