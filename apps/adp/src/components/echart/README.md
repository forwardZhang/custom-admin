# BaseChart

对 ECharts 的一层薄封装，只负责实例的生命周期：初始化、option 更新、resize、销毁。

图表的 option 直接写在使用它的组件里，这里不预置任何图表配置。每个页面的图表诉求都不一样，抽成通用函数反而要塞一堆参数。

## 目录结构

```
src/components/echart/
├── base-chart.vue  # 图表组件
├── colors.ts       # 配色常量
└── index.ts        # 导出入口
```

## 用法

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { BaseChart, chartColors } from '@/components/echart';
import type { EChartsOption } from 'echarts';

const option = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: ['周一', '周二', '周三'] },
  yAxis: { type: 'value' },
  series: [
    {
      type: 'line',
      smooth: true,
      data: [320, 450, 380],
      itemStyle: { color: chartColors.primary },
    },
  ],
}));
</script>

<template>
  <BaseChart :option="option" height="320px" />
</template>
```

option 用 `computed` 包一层，数据变化时组件内部会 `setOption` 重绘，不需要手动调用。

## Props

| 属性            | 类型               | 默认值    | 说明                      |
| --------------- | ------------------ | --------- | ------------------------- |
| `option`        | `EChartsOption`    | 必填      | ECharts 配置对象          |
| `height`        | `string \| number` | `'400px'` | 数字按 px 处理            |
| `width`         | `string \| number` | `'100%'`  | 数字按 px 处理            |
| `autoResize`    | `boolean`          | `true`    | 监听 window resize 并重绘 |
| `theme`         | `string \| object` | -         | 传给 `echarts.init`       |
| `loading`       | `boolean`          | `false`   | 切换内置 loading 动画     |
| `loadingOption` | `object`           | `{}`      | 覆盖 loading 默认样式     |

## Events

| 事件名       | 参数             | 说明                                  |
| ------------ | ---------------- | ------------------------------------- |
| `chartClick` | `params: any`    | 图表点击                              |
| `chartReady` | `chart: ECharts` | 实例就绪，可在此绑定其他 ECharts 事件 |

需要 `click` 之外的事件时，在 `chartReady` 里自己绑：

```ts
function onReady(chart: ECharts) {
  chart.on('legendselectchanged', (params) => {
    // ...
  });
}
```

## 实例方法

通过 ref 拿到：

```ts
const chartRef = ref();

chartRef.value?.refresh(); // 重新 setOption
chartRef.value?.resize(); // 手动 resize
chartRef.value?.showLoading();
chartRef.value?.hideLoading();
chartRef.value?.chartInstance; // 原生 ECharts 实例
```

## 配色

`chartColors` 与 antdv-next 主题色一致，按需取用：

```ts
import { chartColors } from '@/components/echart';

chartColors.primary; // #1677ff
chartColors.success; // #52c41a
chartColors.warning; // #faad14
chartColors.error; // #ff4d4f
chartColors.info; // #13c2c2
chartColors.purple; // #722ed1
chartColors.pink; // #eb2f96
chartColors.orange; // #fa8c16
```

## 参考

`src/views/dashboard/analysis/index.vue` 里有折线图、饼图、柱状图、热力图四种 option 的写法。
