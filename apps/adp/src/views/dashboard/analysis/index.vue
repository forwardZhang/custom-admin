<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

defineOptions({ name: 'DashboardAnalysis' });

/** 统计卡片数据 */
const stats = ref([
  {
    title: '总访问量',
    value: 0,
    suffix: '',
    icon: '👁️',
    color: '#1677ff',
    trend: '+12.5%',
    trendUp: true,
  },
  {
    title: '总销售额',
    value: 0,
    suffix: '¥',
    icon: '💰',
    color: '#52c41a',
    trend: '+8.2%',
    trendUp: true,
  },
  {
    title: '订单总量',
    value: 0,
    suffix: '',
    icon: '📦',
    color: '#faad14',
    trend: '-3.1%',
    trendUp: false,
  },
  {
    title: '活跃用户',
    value: 0,
    suffix: '',
    icon: '🔥',
    color: '#ff4d4f',
    trend: '+22.6%',
    trendUp: true,
  },
]);

/** 热门页面排行 */
const topPages = ref([
  { rank: 1, page: '/dashboard/workbench', title: '工作台', visits: 5832 },
  { rank: 2, page: '/system/user', title: '用户管理', visits: 4211 },
  { rank: 3, page: '/dashboard/analysis', title: '分析页', visits: 3876 },
  { rank: 4, page: '/system/role', title: '角色管理', visits: 2543 },
  { rank: 5, page: '/monitor/server', title: '服务监控', visits: 1987 },
]);

/** 最近 7 天趋势模拟数据 */
const trendDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const trendData = ref([320, 450, 380, 520, 610, 480, 550]);
const trendMax = computed(() => Math.max(...trendData.value));

/** 渠道分布 */
const channels = ref([
  { name: '直接访问', value: 335, color: '#1677ff' },
  { name: '搜索引擎', value: 410, color: '#52c41a' },
  { name: '社交媒体', value: 274, color: '#faad14' },
  { name: '邮件营销', value: 135, color: '#722ed1' },
  { name: '广告投放', value: 198, color: '#13c2c2' },
]);

const channelTotal = computed(() => channels.value.reduce((sum, c) => sum + c.value, 0));

onMounted(() => {
  setTimeout(() => {
    stats.value = [
      {
        title: '总访问量',
        value: 89_234,
        suffix: '',
        icon: '👁️',
        color: '#1677ff',
        trend: '+12.5%',
        trendUp: true,
      },
      {
        title: '总销售额',
        value: 562_800,
        suffix: '¥',
        icon: '💰',
        color: '#52c41a',
        trend: '+8.2%',
        trendUp: true,
      },
      {
        title: '订单总量',
        value: 6_928,
        suffix: '',
        icon: '📦',
        color: '#faad14',
        trend: '-3.1%',
        trendUp: false,
      },
      {
        title: '活跃用户',
        value: 3_456,
        suffix: '',
        icon: '🔥',
        color: '#ff4d4f',
        trend: '+22.6%',
        trendUp: true,
      },
    ];
  }, 500);
});

/**
 * 格式化大数字为可读字符串
 * @param params - 配置项
 * @param params.num - 待格式化的数字
 */
function formatNumber({ num }: { num: number }): string {
  return num.toLocaleString('zh-CN');
}
</script>

<template>
  <div class="analysis p-4">
    <!-- 页面标题 -->
    <div class="analysis__header">
      <h2 class="analysis__title">数据分析</h2>
      <p class="analysis__subtitle">实时数据概览与关键指标监控</p>
    </div>

    <!-- 统计卡片 -->
    <div class="analysis__stats">
      <div v-for="item in stats" :key="item.title" class="analysis__stat-card">
        <div class="analysis__stat-top">
          <span class="analysis__stat-icon" :style="{ backgroundColor: item.color + '15' }">
            {{ item.icon }}
          </span>
          <span
            class="analysis__stat-trend"
            :class="item.trendUp ? 'analysis__stat-trend--up' : 'analysis__stat-trend--down'"
          >
            {{ item.trend }}
          </span>
        </div>
        <div class="analysis__stat-value">
          <span v-if="item.suffix === '¥'" class="analysis__stat-prefix">¥</span>
          {{ formatNumber({ num: item.value }) }}
        </div>
        <div class="analysis__stat-label">{{ item.title }}</div>
      </div>
    </div>

    <!-- 双栏 -->
    <div class="analysis__grid">
      <!-- 访问趋势 -->
      <div class="analysis__card">
        <h3 class="analysis__card-title">
          访问趋势 <span class="analysis__card-tag">近 7 天</span>
        </h3>
        <div class="analysis__chart">
          <div v-for="(val, idx) in trendData" :key="idx" class="analysis__chart-col">
            <div class="analysis__chart-value">{{ val }}</div>
            <div class="analysis__chart-bar-wrap">
              <div
                class="analysis__chart-bar"
                :style="{
                  height: (val / trendMax) * 100 + '%',
                  backgroundColor:
                    idx === trendData.length - 1
                      ? 'var(--ant-color-primary, #1677ff)'
                      : 'var(--ant-color-primary-bg, #e6f4ff)',
                }"
              />
            </div>
            <div class="analysis__chart-label">{{ trendDays[idx] }}</div>
          </div>
        </div>
      </div>

      <!-- 渠道分布 -->
      <div class="analysis__card">
        <h3 class="analysis__card-title">渠道分布</h3>
        <div class="analysis__channels">
          <div v-for="item in channels" :key="item.name" class="analysis__channel-row">
            <span class="analysis__channel-dot" :style="{ backgroundColor: item.color }" />
            <span class="analysis__channel-name">{{ item.name }}</span>
            <div class="analysis__channel-bar-wrap">
              <div
                class="analysis__channel-bar"
                :style="{
                  width: (item.value / channelTotal) * 100 + '%',
                  backgroundColor: item.color,
                }"
              />
            </div>
            <span class="analysis__channel-value">{{ formatNumber({ num: item.value }) }}</span>
            <span class="analysis__channel-percent">
              {{ ((item.value / channelTotal) * 100).toFixed(1) }}%
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 热门页面 -->
    <div class="analysis__card analysis__card--full">
      <h3 class="analysis__card-title">热门页面 TOP 5</h3>
      <table class="analysis__table">
        <thead>
          <tr>
            <th>排名</th>
            <th>页面</th>
            <th>标题</th>
            <th>访问量</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in topPages" :key="item.rank">
            <td>
              <span class="analysis__rank" :class="{ 'analysis__rank--top': item.rank <= 3 }">
                {{ item.rank }}
              </span>
            </td>
            <td class="analysis__page-path">{{ item.page }}</td>
            <td>{{ item.title }}</td>
            <td class="analysis__visits">{{ formatNumber({ num: item.visits }) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.analysis {
  max-width: 1200px;
}

.analysis__header {
  margin-bottom: 20px;
}

.analysis__title {
  font-size: 22px;
  font-weight: 600;
  color: var(--ant-color-text, #1f1f1f);
  margin: 0 0 4px;
}

.analysis__subtitle {
  font-size: 14px;
  color: var(--ant-color-text-secondary, #8c8c8c);
  margin: 0;
}

/* 统计卡片 */
.analysis__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

@media (max-width: 960px) {
  .analysis__stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

.analysis__stat-card {
  background: var(--ant-color-bg-container, #fff);
  border-radius: 10px;
  border: 1px solid var(--ant-color-border-secondary, #f0f0f0);
  padding: 20px;
  transition: all 0.25s ease;
}

.analysis__stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.analysis__stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.analysis__stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  font-size: 20px;
}

.analysis__stat-trend {
  font-size: 13px;
  font-weight: 500;
}

.analysis__stat-trend--up {
  color: #52c41a;
}

.analysis__stat-trend--down {
  color: #ff4d4f;
}

.analysis__stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--ant-color-text, #1f1f1f);
  margin-bottom: 4px;
  line-height: 1.2;
}

.analysis__stat-prefix {
  font-size: 18px;
  font-weight: 500;
  margin-right: 2px;
}

.analysis__stat-label {
  font-size: 14px;
  color: var(--ant-color-text-secondary, #8c8c8c);
}

/* 双栏布局 */
.analysis__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .analysis__grid {
    grid-template-columns: 1fr;
  }
}

.analysis__card {
  background: var(--ant-color-bg-container, #fff);
  border-radius: 10px;
  border: 1px solid var(--ant-color-border-secondary, #f0f0f0);
  padding: 20px;
}

.analysis__card--full {
  margin-bottom: 0;
}

.analysis__card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--ant-color-text, #1f1f1f);
  margin: 0 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.analysis__card-tag {
  font-size: 12px;
  font-weight: 400;
  color: var(--ant-color-text-secondary, #8c8c8c);
  background: var(--ant-color-bg-layout, #f5f5f5);
  padding: 2px 8px;
  border-radius: 10px;
}

/* 柱状趋势图 */
.analysis__chart {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 200px;
  padding-top: 24px;
}

.analysis__chart-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.analysis__chart-value {
  font-size: 11px;
  color: var(--ant-color-text-secondary, #8c8c8c);
  margin-bottom: 6px;
}

.analysis__chart-bar-wrap {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
}

.analysis__chart-bar {
  width: 100%;
  border-radius: 4px 4px 0 0;
  min-height: 4px;
  transition: height 0.6s ease;
}

.analysis__chart-label {
  font-size: 12px;
  color: var(--ant-color-text-secondary, #8c8c8c);
  margin-top: 8px;
}

/* 渠道分布 */
.analysis__channels {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.analysis__channel-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.analysis__channel-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.analysis__channel-name {
  font-size: 14px;
  color: var(--ant-color-text, #1f1f1f);
  width: 72px;
  flex-shrink: 0;
}

.analysis__channel-bar-wrap {
  flex: 1;
  height: 8px;
  background: var(--ant-color-bg-layout, #f5f5f5);
  border-radius: 4px;
  overflow: hidden;
}

.analysis__channel-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease;
}

.analysis__channel-value {
  font-size: 13px;
  font-weight: 500;
  color: var(--ant-color-text, #1f1f1f);
  width: 40px;
  text-align: right;
  flex-shrink: 0;
}

.analysis__channel-percent {
  font-size: 12px;
  color: var(--ant-color-text-secondary, #8c8c8c);
  width: 44px;
  text-align: right;
  flex-shrink: 0;
}

/* 热门页面表格 */
.analysis__table {
  width: 100%;
  border-collapse: collapse;
}

.analysis__table th {
  font-size: 13px;
  font-weight: 500;
  color: var(--ant-color-text-secondary, #8c8c8c);
  text-align: left;
  padding: 10px 12px;
  border-bottom: 1px solid var(--ant-color-border-secondary, #f0f0f0);
}

.analysis__table td {
  font-size: 14px;
  color: var(--ant-color-text, #1f1f1f);
  padding: 12px;
  border-bottom: 1px solid var(--ant-color-border-secondary, #f0f0f0);
}

.analysis__table tr:last-child td {
  border-bottom: none;
}

.analysis__table tr:hover td {
  background: var(--ant-color-bg-layout, #f5f5f5);
}

.analysis__rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: var(--ant-color-bg-layout, #f5f5f5);
  color: var(--ant-color-text-secondary, #8c8c8c);
}

.analysis__rank--top {
  background: var(--ant-color-primary, #1677ff);
  color: #fff;
}

.analysis__page-path {
  font-family: monospace;
  font-size: 13px;
  color: var(--ant-color-text-secondary, #8c8c8c);
}

.analysis__visits {
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}
</style>
