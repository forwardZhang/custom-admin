<script setup lang="ts">
import { ref, onMounted } from 'vue';

const loading = ref(false);
const stats = ref([
  { title: '用户数', value: 0, color: '#1677ff' },
  { title: '订单数', value: 0, color: '#52c41a' },
  { title: '销售额', value: 0, color: '#faad14' },
  { title: '转化率', value: 0, color: '#ff4d4f' },
]);

// Simulated data fetch
onMounted(() => {
  loading.value = true;
  setTimeout(() => {
    stats.value = [
      { title: '用户数', value: 1286, color: '#1677ff' },
      { title: '订单数', value: 542, color: '#52c41a' },
      { title: '销售额', value: 98600, color: '#faad14' },
      { title: '转化率', value: 24, color: '#ff4d4f' },
    ];
    loading.value = false;
  }, 600);
});
</script>

<template>
  <div class="max-w-[1200px]">
    <div class="mb-6">
      <h2 class="text-[22px] font-semibold text-foreground">Dashboard</h2>
      <p class="mt-1 text-muted text-sm">欢迎回来，这是您的数据概览1 2</p>
    </div>

    <div class="grid grid-cols-4 gap-4 mb-8 md:grid-cols-2">
      <div
        v-for="item in stats"
        :key="item.title"
        class="p-5 bg-card rounded-lg border-t-[3px] shadow-sm transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
        :style="{ borderTopColor: item.color }"
      >
        <span class="block text-[28px] font-bold text-foreground mb-1">
          {{ item.title === '销售额' ? '¥' : '' }}{{ item.value
          }}{{ item.title === '转化率' ? '%' : '' }}
        </span>
        <span class="text-muted text-sm">{{ item.title }}</span>
      </div>
    </div>

    <div>
      <h3 class="text-lg font-semibold mb-4">最近活动</h3>
      <div class="flex-col-center min-h-[200px] p-10 bg-card rounded-lg shadow-sm">
        <p class="text-lg text-muted">暂无数据</p>
        <span class="mt-2 text-[13px] text-[#bbb]">更多内容敬请期待</span>
      </div>
    </div>
  </div>
</template>
