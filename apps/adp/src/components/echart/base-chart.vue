<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, shallowRef } from 'vue';
import * as echarts from 'echarts';
import type { ECharts, EChartsOption } from 'echarts';

defineOptions({ name: 'BaseChart' });

interface Props {
  /** 图表配置选项 */
  option: EChartsOption;
  /** 图表高度 */
  height?: string | number;
  /** 图表宽度 */
  width?: string | number;
  /** 是否自动监听窗口大小变化 */
  autoResize?: boolean;
  /** 主题 */
  theme?: string | object;
  /** 加载状态 */
  loading?: boolean;
  /** 加载配置 */
  loadingOption?: object;
}

const props = withDefaults(defineProps<Props>(), {
  height: '400px',
  width: '100%',
  autoResize: true,
  theme: undefined,
  loading: false,
  loadingOption: () => ({}),
});

const emit = defineEmits<{
  chartClick: [params: any];
  chartReady: [chart: ECharts];
}>();

const chartRef = ref<HTMLDivElement>();
const chartInstance = shallowRef<ECharts>();

/** 初始化图表 */
function initChart() {
  if (!chartRef.value) return;

  // 如果已存在实例，先销毁
  if (chartInstance.value) {
    chartInstance.value.dispose();
  }

  // 创建图表实例
  chartInstance.value = echarts.init(chartRef.value, props.theme);

  // 设置配置项
  chartInstance.value.setOption(props.option, true);

  // 绑定点击事件
  chartInstance.value.on('click', (params) => {
    emit('chartClick', params);
  });

  // 触发就绪事件
  emit('chartReady', chartInstance.value);
}

/** 更新图表配置 */
function updateChart() {
  if (!chartInstance.value) return;
  chartInstance.value.setOption(props.option, true);
}

/** 调整图表大小 */
function resize() {
  chartInstance.value?.resize();
}

/** 显示加载动画 */
function showLoading() {
  if (!chartInstance.value) return;
  chartInstance.value.showLoading('default', {
    text: '加载中...',
    color: '#1677ff',
    textColor: '#000',
    maskColor: 'rgba(255, 255, 255, 0.8)',
    zlevel: 0,
    ...props.loadingOption,
  });
}

/** 隐藏加载动画 */
function hideLoading() {
  chartInstance.value?.hideLoading();
}

/** 窗口大小变化处理 */
function handleResize() {
  resize();
}

// 监听配置变化
watch(
  () => props.option,
  () => {
    updateChart();
  },
  { deep: true },
);

// 监听加载状态
watch(
  () => props.loading,
  (loading) => {
    if (loading) {
      showLoading();
    } else {
      hideLoading();
    }
  },
);

onMounted(() => {
  initChart();

  if (props.autoResize) {
    window.addEventListener('resize', handleResize);
  }

  // 处理初始加载状态
  if (props.loading) {
    showLoading();
  }
});

onUnmounted(() => {
  if (props.autoResize) {
    window.removeEventListener('resize', handleResize);
  }

  chartInstance.value?.dispose();
  chartInstance.value = undefined;
});

// 暴露方法给父组件
defineExpose({
  /** 图表实例 */
  chartInstance,
  /** 刷新图表 */
  refresh: updateChart,
  /** 调整大小 */
  resize,
  /** 显示加载 */
  showLoading,
  /** 隐藏加载 */
  hideLoading,
});
</script>

<template>
  <div
    ref="chartRef"
    class="base-chart"
    :style="{
      height: typeof height === 'number' ? `${height}px` : height,
      width: typeof width === 'number' ? `${width}px` : width,
    }"
  />
</template>

<style scoped>
.base-chart {
  width: 100%;
  height: 100%;
}
</style>
