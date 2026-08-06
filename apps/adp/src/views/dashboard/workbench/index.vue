<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { message } from 'antdv-next';

defineOptions({ name: 'DashboardWorkbench' });

/** 用户信息 */
const userInfo = ref({
  name: 'Admin',
  role: '系统管理员',
  avatar: '👨‍💼',
  loginCount: 128,
  lastLogin: '2026-08-06 09:30:00',
});

/** 快捷操作入口 */
const shortcuts = ref([
  { title: '用户管理', icon: '👤', color: '#1677ff', desc: '管理系统用户', path: '/system/user' },
  { title: '角色管理', icon: '🛡️', color: '#52c41a', desc: '配置角色权限', path: '/system/role' },
  { title: '菜单管理', icon: '📋', color: '#faad14', desc: '调整菜单结构', path: '/system/menu' },
  { title: '操作日志', icon: '📝', color: '#722ed1', desc: '查看操作记录', path: '/system/log' },
  {
    title: '系统监控',
    icon: '📊',
    color: '#13c2c2',
    desc: '服务运行状态',
    path: '/monitor/server',
  },
  { title: '数据备份', icon: '💾', color: '#eb2f96', desc: '数据安全备份', path: '/system/backup' },
]);

/** 数据概览 */
const overview = ref([
  { label: '今日访问', value: 0, unit: '次', icon: '📈', color: '#1677ff' },
  { label: '在线用户', value: 0, unit: '人', icon: '👥', color: '#52c41a' },
  { label: '待处理', value: 0, unit: '项', icon: '⏰', color: '#faad14' },
  { label: '消息通知', value: 0, unit: '条', icon: '🔔', color: '#ff4d4f' },
]);

/** 待办事项 */
const todos = ref([
  { id: 1, title: '完成用户模块接口对接', done: false, priority: 'high', dueDate: '今天' },
  { id: 2, title: '修复登录页样式兼容问题', done: true, priority: 'medium', dueDate: '昨天' },
  { id: 3, title: '优化表格组件加载速度', done: false, priority: 'high', dueDate: '明天' },
  { id: 4, title: '编写角色权限单元测试', done: false, priority: 'low', dueDate: '本周' },
  { id: 5, title: '更新部署文档', done: true, priority: 'medium', dueDate: '昨天' },
  { id: 6, title: '代码审查：权限模块重构', done: false, priority: 'medium', dueDate: '明天' },
]);

/** 项目动态 */
const activities = ref<
  { id: number; user: string; action: string; target: string; time: string; type: string }[]
>([]);

/** 快速统计 */
const quickStats = ref({
  todayCommits: 0,
  weekTasks: 0,
  monthBugs: 0,
  codeReviews: 0,
});

onMounted(() => {
  // 模拟数据加载
  setTimeout(() => {
    overview.value = [
      { label: '今日访问', value: 1248, unit: '次', icon: '📈', color: '#1677ff' },
      { label: '在线用户', value: 89, unit: '人', icon: '👥', color: '#52c41a' },
      { label: '待处理', value: 12, unit: '项', icon: '⏰', color: '#faad14' },
      { label: '消息通知', value: 5, unit: '条', icon: '🔔', color: '#ff4d4f' },
    ];

    activities.value = [
      {
        id: 1,
        user: 'Admin',
        action: '更新了',
        target: '用户管理模块',
        time: '10 分钟前',
        type: 'update',
      },
      {
        id: 2,
        user: '张三',
        action: '提交了',
        target: '角色权限配置',
        time: '30 分钟前',
        type: 'commit',
      },
      {
        id: 3,
        user: '李四',
        action: '修复了',
        target: '登录页 Bug #128',
        time: '1 小时前',
        type: 'fix',
      },
      {
        id: 4,
        user: 'Admin',
        action: '部署了',
        target: 'v1.2.0 正式版',
        time: '2 小时前',
        type: 'deploy',
      },
      {
        id: 5,
        user: '王五',
        action: '创建了',
        target: '数据备份任务',
        time: '3 小时前',
        type: 'create',
      },
      {
        id: 6,
        user: '赵六',
        action: '审查了',
        target: '权限模块代码',
        time: '4 小时前',
        type: 'review',
      },
    ];

    quickStats.value = {
      todayCommits: 8,
      weekTasks: 23,
      monthBugs: 5,
      codeReviews: 12,
    };
  }, 400);
});

/** 计算待完成任务数 */
const unfinishedCount = computed(() => todos.value.filter((t) => !t.done).length);

/**
 * 切换待办事项完成状态
 */
function toggleTodo(id: number) {
  const item = todos.value.find((t) => t.id === id);
  if (item) {
    item.done = !item.done;
    message.success(item.done ? '任务已完成 ✅' : '任务已标记为未完成');
  }
}

/**
 * 删除待办事项
 */
function deleteTodo(id: number) {
  const index = todos.value.findIndex((t) => t.id === id);
  if (index > -1) {
    todos.value.splice(index, 1);
    message.success('任务已删除');
  }
}

/**
 * 点击快捷入口
 */
function handleShortcutClick(item: (typeof shortcuts.value)[0]) {
  message.info(`导航到：${item.title}`);
}

/** 优先级标签配置 */
const priorityMap: Record<string, { label: string; color: string }> = {
  high: { label: '高', color: '#ff4d4f' },
  medium: { label: '中', color: '#faad14' },
  low: { label: '低', color: '#52c41a' },
};

/** 活动类型图标 */
const activityTypeIcon: Record<string, string> = {
  update: '🔄',
  commit: '📤',
  fix: '🔧',
  deploy: '🚀',
  create: '✨',
  review: '👀',
};

/** 获取问候语 */
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return '夜深了';
  if (hour < 9) return '早安';
  if (hour < 12) return '上午好';
  if (hour < 14) return '中午好';
  if (hour < 18) return '下午好';
  if (hour < 22) return '晚上好';
  return '夜深了';
}
</script>

<template>
  <div class="workbench">
    <!-- 欢迎区 -->
    <div class="workbench__welcome">
      <div class="workbench__welcome-left">
        <div class="workbench__avatar">{{ userInfo.avatar }}</div>
        <div class="workbench__user-info">
          <h2 class="workbench__title">{{ getGreeting() }}，{{ userInfo.name }}！</h2>
          <p class="workbench__subtitle">
            {{ userInfo.role }} • 登录次数 {{ userInfo.loginCount }}
          </p>
        </div>
      </div>
      <div class="workbench__welcome-right">
        <div class="workbench__date">
          {{
            new Date().toLocaleDateString('zh-CN', {
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })
          }}
        </div>
        <div class="workbench__time">
          {{
            new Date().toLocaleTimeString('zh-CN', {
              hour12: false,
              hour: '2-digit',
              minute: '2-digit',
            })
          }}
        </div>
      </div>
    </div>

    <!-- 数据概览 -->
    <div class="workbench__overview">
      <div v-for="item in overview" :key="item.label" class="workbench__overview-card">
        <div
          class="workbench__overview-icon"
          :style="{ backgroundColor: item.color + '15', color: item.color }"
        >
          {{ item.icon }}
        </div>
        <div class="workbench__overview-content">
          <div class="workbench__overview-label">{{ item.label }}</div>
          <div class="workbench__overview-value">
            {{ item.value.toLocaleString()
            }}<span class="workbench__overview-unit">{{ item.unit }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="workbench__section">
      <h3 class="workbench__section-title">快捷入口</h3>
      <div class="workbench__shortcuts">
        <div
          v-for="item in shortcuts"
          :key="item.title"
          class="workbench__shortcut-card"
          @click="handleShortcutClick(item)"
        >
          <span class="workbench__shortcut-icon" :style="{ backgroundColor: item.color + '15' }">
            {{ item.icon }}
          </span>
          <span class="workbench__shortcut-title">{{ item.title }}</span>
          <span class="workbench__shortcut-desc">{{ item.desc }}</span>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="workbench__grid">
      <!-- 待办事项 -->
      <div class="workbench__card workbench__card--todos">
        <div class="workbench__card-header">
          <h3 class="workbench__card-title">
            待办事项
            <span class="workbench__card-badge">{{ unfinishedCount }} 项待完成</span>
          </h3>
          <button class="workbench__add-btn">+ 添加</button>
        </div>

        <div class="workbench__todo-list">
          <div
            v-for="item in todos"
            :key="item.id"
            class="workbench__todo-item"
            :class="{ 'workbench__todo-item--done': item.done }"
          >
            <div class="workbench__todo-main" @click="toggleTodo(item.id)">
              <span class="workbench__todo-check">
                {{ item.done ? '✅' : '⬜' }}
              </span>
              <div class="workbench__todo-content">
                <span class="workbench__todo-text">{{ item.title }}</span>
                <span class="workbench__todo-meta">
                  <span
                    class="workbench__todo-priority"
                    :style="{ color: priorityMap[item.priority]?.color }"
                  >
                    {{ priorityMap[item.priority]?.label }}
                  </span>
                  <span class="workbench__todo-date">{{ item.dueDate }}</span>
                </span>
              </div>
            </div>
            <button class="workbench__todo-delete" @click.stop="deleteTodo(item.id)">🗑️</button>
          </div>
        </div>
      </div>

      <!-- 项目动态 -->
      <div class="workbench__card">
        <h3 class="workbench__card-title">项目动态</h3>
        <div v-if="!activities.length" class="workbench__empty">加载中…</div>
        <div v-else class="workbench__activity-list">
          <div v-for="item in activities" :key="item.id" class="workbench__activity-item">
            <span class="workbench__activity-icon">{{ activityTypeIcon[item.type] }}</span>
            <div class="workbench__activity-content">
              <div class="workbench__activity-main">
                <span class="workbench__activity-user">{{ item.user }}</span>
                <span class="workbench__activity-action">{{ item.action }}</span>
                <span class="workbench__activity-target">{{ item.target }}</span>
              </div>
              <span class="workbench__activity-time">{{ item.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速统计 -->
    <div class="workbench__stats">
      <div class="workbench__stat-item">
        <div class="workbench__stat-value">{{ quickStats.todayCommits }}</div>
        <div class="workbench__stat-label">今日提交</div>
      </div>
      <div class="workbench__stat-item">
        <div class="workbench__stat-value">{{ quickStats.weekTasks }}</div>
        <div class="workbench__stat-label">本周任务</div>
      </div>
      <div class="workbench__stat-item">
        <div class="workbench__stat-value">{{ quickStats.monthBugs }}</div>
        <div class="workbench__stat-label">本月缺陷</div>
      </div>
      <div class="workbench__stat-item">
        <div class="workbench__stat-value">{{ quickStats.codeReviews }}</div>
        <div class="workbench__stat-label">代码审查</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.workbench {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 16px 24px;
}

/* 欢迎区 */
.workbench__welcome {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32px;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: #fff;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.25);
}

.workbench__welcome-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.workbench__avatar {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.workbench__user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.workbench__title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.workbench__subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

.workbench__welcome-right {
  text-align: right;
}

.workbench__date {
  font-size: 16px;
  font-weight: 500;
  opacity: 0.95;
  margin-bottom: 4px;
}

.workbench__time {
  font-size: 28px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

/* 数据概览 */
.workbench__overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 960px) {
  .workbench__overview {
    grid-template-columns: repeat(2, 1fr);
  }
}

.workbench__overview-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--ant-color-bg-container, #fff);
  border-radius: 12px;
  border: 1px solid var(--ant-color-border-secondary, #f0f0f0);
  transition: all 0.3s ease;
}

.workbench__overview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.workbench__overview-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  border-radius: 12px;
  flex-shrink: 0;
}

.workbench__overview-content {
  flex: 1;
  min-width: 0;
}

.workbench__overview-label {
  font-size: 13px;
  color: var(--ant-color-text-secondary, #8c8c8c);
  margin-bottom: 4px;
}

.workbench__overview-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--ant-color-text, #1f1f1f);
  font-variant-numeric: tabular-nums;
}

.workbench__overview-unit {
  font-size: 14px;
  font-weight: 400;
  margin-left: 4px;
  color: var(--ant-color-text-secondary, #8c8c8c);
}

/* 快捷入口 */
.workbench__section {
  margin-bottom: 24px;
}

.workbench__section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--ant-color-text, #1f1f1f);
  margin: 0 0 16px;
}

.workbench__shortcuts {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
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
  gap: 10px;
  padding: 24px 16px;
  background: var(--ant-color-bg-container, #fff);
  border-radius: 12px;
  border: 1px solid var(--ant-color-border-secondary, #f0f0f0);
  cursor: pointer;
  transition: all 0.3s ease;
}

.workbench__shortcut-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  border-color: var(--ant-color-primary, #1677ff);
}

.workbench__shortcut-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 12px;
  font-size: 24px;
}

.workbench__shortcut-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--ant-color-text, #1f1f1f);
}

.workbench__shortcut-desc {
  font-size: 12px;
  color: var(--ant-color-text-secondary, #8c8c8c);
  text-align: center;
}

/* 主内容区 */
.workbench__grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

@media (max-width: 960px) {
  .workbench__grid {
    grid-template-columns: 1fr;
  }
}

.workbench__card {
  background: var(--ant-color-bg-container, #fff);
  border-radius: 12px;
  border: 1px solid var(--ant-color-border-secondary, #f0f0f0);
  padding: 24px;
}

.workbench__card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.workbench__card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--ant-color-text, #1f1f1f);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.workbench__card-badge {
  font-size: 12px;
  font-weight: 400;
  color: var(--ant-color-primary, #1677ff);
  background: var(--ant-color-primary-bg, #e6f4ff);
  padding: 4px 10px;
  border-radius: 12px;
}

.workbench__add-btn {
  padding: 6px 16px;
  font-size: 13px;
  background: var(--ant-color-primary, #1677ff);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.workbench__add-btn:hover {
  background: var(--ant-color-primary-hover, #4096ff);
  transform: translateY(-1px);
}

/* 待办事项 */
.workbench__todo-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.workbench__todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px;
  border-radius: 10px;
  border: 1px solid var(--ant-color-border-secondary, #f0f0f0);
  transition: all 0.2s;
}

.workbench__todo-item:hover {
  background: var(--ant-color-bg-layout, #f5f5f5);
  border-color: var(--ant-color-border, #d9d9d9);
}

.workbench__todo-item--done {
  opacity: 0.6;
}

.workbench__todo-main {
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  min-width: 0;
}

.workbench__todo-check {
  font-size: 18px;
  flex-shrink: 0;
  line-height: 1;
  margin-top: 2px;
}

.workbench__todo-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.workbench__todo-text {
  font-size: 14px;
  color: var(--ant-color-text, #1f1f1f);
  word-break: break-word;
}

.workbench__todo-item--done .workbench__todo-text {
  text-decoration: line-through;
  color: var(--ant-color-text-quaternary, #bfbfbf);
}

.workbench__todo-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
}

.workbench__todo-priority {
  font-weight: 500;
}

.workbench__todo-date {
  color: var(--ant-color-text-tertiary, #a8a8a8);
}

.workbench__todo-delete {
  padding: 6px;
  font-size: 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
  border-radius: 6px;
  flex-shrink: 0;
}

.workbench__todo-item:hover .workbench__todo-delete {
  opacity: 0.5;
}

.workbench__todo-delete:hover {
  opacity: 1 !important;
  background: var(--ant-color-error-bg, #fff2f0);
}

/* 项目动态 */
.workbench__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  color: var(--ant-color-text-secondary, #8c8c8c);
  font-size: 14px;
}

.workbench__activity-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.workbench__activity-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px;
  border-radius: 10px;
  transition: background 0.2s;
}

.workbench__activity-item:hover {
  background: var(--ant-color-bg-layout, #f5f5f5);
}

.workbench__activity-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  background: var(--ant-color-fill-quaternary, #f5f5f5);
  border-radius: 8px;
  flex-shrink: 0;
}

.workbench__activity-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.workbench__activity-main {
  font-size: 14px;
  color: var(--ant-color-text, #1f1f1f);
  word-break: break-word;
}

.workbench__activity-user {
  font-weight: 500;
  color: var(--ant-color-text, #1f1f1f);
  margin-right: 4px;
}

.workbench__activity-action {
  color: var(--ant-color-text-secondary, #8c8c8c);
  margin-right: 4px;
}

.workbench__activity-target {
  color: var(--ant-color-primary, #1677ff);
  font-weight: 500;
}

.workbench__activity-time {
  font-size: 12px;
  color: var(--ant-color-text-quaternary, #bfbfbf);
}

/* 快速统计 */
.workbench__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 24px;
  background: var(--ant-color-bg-container, #fff);
  border-radius: 12px;
  border: 1px solid var(--ant-color-border-secondary, #f0f0f0);
}

@media (max-width: 960px) {
  .workbench__stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

.workbench__stat-item {
  text-align: center;
  padding: 12px;
}

.workbench__stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--ant-color-primary, #1677ff);
  margin-bottom: 6px;
  font-variant-numeric: tabular-nums;
}

.workbench__stat-label {
  font-size: 13px;
  color: var(--ant-color-text-secondary, #8c8c8c);
}

@media (max-width: 768px) {
  .workbench__welcome {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .workbench__welcome-left {
    flex-direction: column;
  }

  .workbench__welcome-right {
    text-align: center;
  }
}
</style>
