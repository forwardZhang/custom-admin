<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { BaseChart, chartColors } from '@/components/echart';
import type { EChartsOption } from 'echarts';

defineOptions({ name: 'DashboardAnalysis' });

/** 统计卡片数据 */
const stats = ref([
  {
    title: '总访问量',
    value: 0,
    suffix: '',
    icon: '👁️',
    color: chartColors.primary,
    trend: '+12.5%',
    trendUp: true,
    chart: 'visits',
  },
  {
    title: '总销售额',
    value: 0,
    suffix: '¥',
    icon: '💰',
    color: chartColors.success,
    trend: '+8.2%',
    trendUp: true,
    chart: 'sales',
  },
  {
    title: '订单总量',
    value: 0,
    suffix: '',
    icon: '📦',
    color: chartColors.warning,
    trend: '-3.1%',
    trendUp: false,
    chart: 'orders',
  },
  {
    title: '活跃用户',
    value: 0,
    suffix: '',
    icon: '🔥',
    color: chartColors.error,
    trend: '+22.6%',
    trendUp: true,
    chart: 'users',
  },
]);

/** 热门页面排行 */
const topPages = ref([
  { rank: 1, page: '/dashboard/workbench', title: '工作台', visits: 5832, change: '+12%' },
  { rank: 2, page: '/system/user', title: '用户管理', visits: 4211, change: '+8%' },
  { rank: 3, page: '/dashboard/analysis', title: '分析页', visits: 3876, change: '-3%' },
  { rank: 4, page: '/system/role', title: '角色管理', visits: 2543, change: '+15%' },
  { rank: 5, page: '/monitor/server', title: '服务监控', visits: 1987, change: '+22%' },
]);

/** 迷你图数据 */
const miniChartData = {
  visits: [120, 132, 101, 134, 190, 230, 210, 182, 191, 234, 290, 330],
  sales: [220, 182, 191, 234, 290, 330, 310, 320, 332, 301, 334, 390],
  orders: [150, 230, 224, 218, 135, 147, 260, 180, 170, 190, 210, 230],
  users: [320, 332, 301, 334, 390, 330, 320, 310, 340, 380, 410, 420],
};

/** 访问趋势图配置 */
const trendChartOption = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985',
      },
    },
  },
  legend: {
    data: ['访问量', '销售额'],
    bottom: 0,
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '12%',
    top: '4%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  },
  yAxis: [
    {
      type: 'value',
      name: '访问量',
      position: 'left',
    },
    {
      type: 'value',
      name: '销售额',
      position: 'right',
    },
  ],
  series: [
    {
      name: '访问量',
      type: 'line',
      smooth: true,
      data: [320, 450, 380, 520, 610, 480, 550],
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(22, 119, 255, 0.3)' },
            { offset: 1, color: 'rgba(22, 119, 255, 0.05)' },
          ],
        },
      },
      itemStyle: {
        color: chartColors.primary,
      },
      lineStyle: {
        width: 3,
      },
    },
    {
      name: '销售额',
      type: 'line',
      smooth: true,
      yAxisIndex: 1,
      data: [220, 310, 290, 380, 450, 360, 420],
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
            { offset: 1, color: 'rgba(82, 196, 26, 0.05)' },
          ],
        },
      },
      itemStyle: {
        color: chartColors.success,
      },
      lineStyle: {
        width: 3,
      },
    },
  ],
}));

/** 渠道分布饼图配置 */
const channelChartOption = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)',
  },
  legend: {
    bottom: 0,
    left: 'center',
  },
  series: [
    {
      name: '访问来源',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2,
      },
      label: {
        show: false,
        position: 'center',
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
          fontWeight: 'bold',
        },
      },
      labelLine: {
        show: false,
      },
      data: [
        { value: 335, name: '直接访问', itemStyle: { color: chartColors.primary } },
        { value: 410, name: '搜索引擎', itemStyle: { color: chartColors.success } },
        { value: 274, name: '社交媒体', itemStyle: { color: chartColors.warning } },
        { value: 135, name: '邮件营销', itemStyle: { color: chartColors.purple } },
        { value: 198, name: '广告投放', itemStyle: { color: chartColors.info } },
      ],
    },
  ],
}));

/** 品类销售柱状图配置 */
const categoryChartOption = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
    },
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: '4%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: ['电子产品', '服装鞋帽', '食品饮料', '家居用品', '图书音像', '运动户外'],
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      name: '销售额',
      type: 'bar',
      data: [520, 432, 301, 394, 290, 330],
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: chartColors.primary },
            { offset: 1, color: chartColors.primary + '80' },
          ],
        },
        borderRadius: [8, 8, 0, 0],
      },
      barWidth: '40%',
    },
  ],
}));

/** 时段分析热力图配置 */
const timeChartOption = computed<EChartsOption>(() => {
  const hours = [
    '00',
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
    '21',
    '22',
    '23',
  ];
  const days = ['周日', '周六', '周五', '周四', '周三', '周二', '周一'];

  const data: Array<[number, number, number]> = [];
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 24; j++) {
      const value = Math.floor(Math.random() * 100);
      data.push([j, i, value]);
    }
  }

  return {
    tooltip: {
      position: 'top',
      formatter: (params: any) => {
        return `${days[params.data[1]]} ${hours[params.data[0]]}:00<br/>访问量: ${params.data[2]}`;
      },
    },
    grid: {
      left: '10%',
      right: '3%',
      bottom: '15%',
      top: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: hours,
      splitArea: {
        show: true,
      },
    },
    yAxis: {
      type: 'category',
      data: days,
      splitArea: {
        show: true,
      },
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      inRange: {
        color: ['#e6f4ff', chartColors.primary],
      },
    },
    series: [
      {
        name: '访问量',
        type: 'heatmap',
        data: data,
        label: {
          show: false,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };
});

onMounted(() => {
  // 模拟数据加载
  setTimeout(() => {
    stats.value = [
      {
        title: '总访问量',
        value: 89234,
        suffix: '',
        icon: '👁️',
        color: chartColors.primary,
        trend: '+12.5%',
        trendUp: true,
        chart: 'visits',
      },
      {
        title: '总销售额',
        value: 562800,
        suffix: '¥',
        icon: '💰',
        color: chartColors.success,
        trend: '+8.2%',
        trendUp: true,
        chart: 'sales',
      },
      {
        title: '订单总量',
        value: 6928,
        suffix: '',
        icon: '📦',
        color: chartColors.warning,
        trend: '-3.1%',
        trendUp: false,
        chart: 'orders',
      },
      {
        title: '活跃用户',
        value: 3456,
        suffix: '',
        icon: '🔥',
        color: chartColors.error,
        trend: '+22.6%',
        trendUp: true,
        chart: 'users',
      },
    ];
  }, 500);
});

/**
 * 格式化大数字
 */
function formatNumber(num: number): string {
  return num.toLocaleString('zh-CN');
}

/**
 * 获取迷你图数据
 */
function getMiniChartData(type: string) {
  return miniChartData[type as keyof typeof miniChartData] || [];
}

/**
 * 图表点击事件
 */
function handleChartClick(params: any) {
  console.log('图表点击:', params);
}
</script>

<template>
  <div class="analysis">
    <!-- 页面标题 -->
    <div class="analysis__header">
      <div>
        <h2 class="analysis__title">数据分析</h2>
        <p class="analysis__subtitle">实时数据概览与关键指标监控</p>
      </div>
      <div class="analysis__actions">
        <button class="analysis__action-btn">导出报告</button>
        <button class="analysis__action-btn analysis__action-btn--primary">刷新数据</button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="analysis__stats">
      <div v-for="item in stats" :key="item.title" class="analysis__stat-card">
        <div class="analysis__stat-header">
          <div class="analysis__stat-icon" :style="{ backgroundColor: item.color + '15' }">
            {{ item.icon }}
          </div>
          <span
            class="analysis__stat-trend"
            :class="item.trendUp ? 'analysis__stat-trend--up' : 'analysis__stat-trend--down'"
          >
            {{ item.trend }}
            <span class="analysis__stat-arrow">{{ item.trendUp ? '↗' : '↘' }}</span>
          </span>
        </div>
        <div class="analysis__stat-body">
          <div class="analysis__stat-value">
            <span v-if="item.suffix === '¥'" class="analysis__stat-prefix">¥</span>
            {{ formatNumber(item.value) }}
          </div>
          <div class="analysis__stat-label">{{ item.title }}</div>
        </div>
        <div class="analysis__stat-chart">
          <svg viewBox="0 0 200 40" class="analysis__mini-chart">
            <polyline
              :points="
                getMiniChartData(item.chart)
                  .map((v, i) => `${(i / 11) * 200},${40 - (v / 500) * 40}`)
                  .join(' ')
              "
              fill="none"
              :stroke="item.color"
              stroke-width="2"
              stroke-linecap="round"
            />
            <polyline
              :points="
                getMiniChartData(item.chart)
                  .map((v, i) => `${(i / 11) * 200},${40 - (v / 500) * 40}`)
                  .join(' ') + ' 200,40 0,40'
              "
              :fill="`url(#gradient-${item.chart})`"
            />
            <defs>
              <linearGradient :id="`gradient-${item.chart}`" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" :style="{ stopColor: item.color, stopOpacity: 0.3 }" />
                <stop offset="100%" :style="{ stopColor: item.color, stopOpacity: 0 }" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="analysis__charts">
      <!-- 访问趋势 -->
      <div class="analysis__card analysis__card--large">
        <div class="analysis__card-header">
          <h3 class="analysis__card-title">
            访问趋势 <span class="analysis__card-tag">近 7 天</span>
          </h3>
        </div>
        <BaseChart :option="trendChartOption" height="320px" @chart-click="handleChartClick" />
      </div>

      <!-- 渠道分布 -->
      <div class="analysis__card">
        <div class="analysis__card-header">
          <h3 class="analysis__card-title">渠道分布</h3>
        </div>
        <BaseChart :option="channelChartOption" height="320px" @chart-click="handleChartClick" />
      </div>

      <!-- 品类销售 -->
      <div class="analysis__card">
        <div class="analysis__card-header">
          <h3 class="analysis__card-title">品类销售</h3>
        </div>
        <BaseChart :option="categoryChartOption" height="320px" @chart-click="handleChartClick" />
      </div>

      <!-- 时段分析 -->
      <div class="analysis__card analysis__card--large">
        <div class="analysis__card-header">
          <h3 class="analysis__card-title">
            时段分析热力图 <span class="analysis__card-tag">本周</span>
          </h3>
        </div>
        <BaseChart :option="timeChartOption" height="320px" @chart-click="handleChartClick" />
      </div>
    </div>

    <!-- 热门页面 -->
    <div class="analysis__card">
      <div class="analysis__card-header">
        <h3 class="analysis__card-title">热门页面 TOP 5</h3>
      </div>
      <table class="analysis__table">
        <thead>
          <tr>
            <th width="80">排名</th>
            <th>页面路径</th>
            <th width="160">页面标题</th>
            <th width="120" style="text-align: right">访问量</th>
            <th width="100" style="text-align: right">变化</th>
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
            <td class="analysis__visits">{{ formatNumber(item.visits) }}</td>
            <td
              class="analysis__change"
              :class="
                item.change.startsWith('+') ? 'analysis__change--up' : 'analysis__change--down'
              "
            >
              {{ item.change }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.analysis {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 16px 24px;
}

/* 页面标题 */
.analysis__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.analysis__title {
  font-size: 24px;
  font-weight: 600;
  color: var(--ant-color-text, #1f1f1f);
  margin: 0 0 6px;
}

.analysis__subtitle {
  font-size: 14px;
  color: var(--ant-color-text-secondary, #8c8c8c);
  margin: 0;
}

.analysis__actions {
  display: flex;
  gap: 12px;
}

.analysis__action-btn {
  padding: 8px 20px;
  font-size: 14px;
  background: var(--ant-color-bg-container, #fff);
  color: var(--ant-color-text, #1f1f1f);
  border: 1px solid var(--ant-color-border, #d9d9d9);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.analysis__action-btn:hover {
  border-color: var(--ant-color-primary, #1677ff);
  color: var(--ant-color-primary, #1677ff);
}

.analysis__action-btn--primary {
  background: var(--ant-color-primary, #1677ff);
  color: #fff;
  border-color: var(--ant-color-primary, #1677ff);
}

.analysis__action-btn--primary:hover {
  background: var(--ant-color-primary-hover, #4096ff);
}

/* 统计卡片 */
.analysis__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

@media (max-width: 1200px) {
  .analysis__stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

.analysis__stat-card {
  background: var(--ant-color-bg-container, #fff);
  border-radius: 12px;
  border: 1px solid var(--ant-color-border-secondary, #f0f0f0);
  padding: 20px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.analysis__stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.analysis__stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.analysis__stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  font-size: 24px;
}

.analysis__stat-trend {
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.analysis__stat-trend--up {
  color: #52c41a;
}

.analysis__stat-trend--down {
  color: #ff4d4f;
}

.analysis__stat-arrow {
  font-size: 16px;
}

.analysis__stat-body {
  margin-bottom: 12px;
}

.analysis__stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--ant-color-text, #1f1f1f);
  margin-bottom: 6px;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.analysis__stat-prefix {
  font-size: 20px;
  font-weight: 500;
  margin-right: 2px;
}

.analysis__stat-label {
  font-size: 14px;
  color: var(--ant-color-text-secondary, #8c8c8c);
}

.analysis__stat-chart {
  margin: 0 -20px -20px;
  height: 40px;
}

.analysis__mini-chart {
  width: 100%;
  height: 100%;
}

/* 图表区域 */
.analysis__charts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

@media (max-width: 1200px) {
  .analysis__charts {
    grid-template-columns: 1fr;
  }
}

.analysis__card {
  background: var(--ant-color-bg-container, #fff);
  border-radius: 12px;
  border: 1px solid var(--ant-color-border-secondary, #f0f0f0);
  padding: 24px;
}

.analysis__card--large {
  grid-column: span 2;
}

@media (max-width: 1200px) {
  .analysis__card--large {
    grid-column: span 1;
  }
}

.analysis__card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.analysis__card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--ant-color-text, #1f1f1f);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.analysis__card-tag {
  font-size: 12px;
  font-weight: 400;
  color: var(--ant-color-text-secondary, #8c8c8c);
  background: var(--ant-color-bg-layout, #f5f5f5);
  padding: 4px 10px;
  border-radius: 12px;
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
  padding: 12px 16px;
  background: var(--ant-color-fill-quaternary, #f5f5f5);
  border-bottom: 1px solid var(--ant-color-border-secondary, #f0f0f0);
}

.analysis__table th:first-child {
  border-radius: 8px 0 0 0;
}

.analysis__table th:last-child {
  border-radius: 0 8px 0 0;
}

.analysis__table td {
  font-size: 14px;
  color: var(--ant-color-text, #1f1f1f);
  padding: 16px;
  border-bottom: 1px solid var(--ant-color-border-secondary, #f0f0f0);
}

.analysis__table tr:last-child td {
  border-bottom: none;
}

.analysis__table tbody tr {
  transition: background 0.2s;
}

.analysis__table tbody tr:hover {
  background: var(--ant-color-bg-layout, #f5f5f5);
}

.analysis__rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  background: var(--ant-color-fill-quaternary, #f5f5f5);
  color: var(--ant-color-text-secondary, #8c8c8c);
}

.analysis__rank--top {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.analysis__page-path {
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  font-size: 13px;
  color: var(--ant-color-text-secondary, #8c8c8c);
  word-break: break-all;
}

.analysis__visits {
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.analysis__change {
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.analysis__change--up {
  color: #52c41a;
}

.analysis__change--down {
  color: #ff4d4f;
}

@media (max-width: 768px) {
  .analysis__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .analysis__actions {
    width: 100%;
  }

  .analysis__action-btn {
    flex: 1;
  }
}
</style>
