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
  <div class="dashboard">
    <div class="dashboard__header">
      <h2>Dashboard</h2>
      <p>欢迎回来，这是您的数据概览1 2</p>
    </div>

    <div class="dashboard__stats">
      <div
        v-for="item in stats"
        :key="item.title"
        class="stat-card"
        :style="{ borderTopColor: item.color }"
      >
        <span class="stat-card__value">
          {{ item.title === '销售额' ? '¥' : '' }}{{ item.value
          }}{{ item.title === '转化率' ? '%' : '' }}
        </span>
        <span class="stat-card__label">{{ item.title }}</span>
      </div>
    </div>

    <div class="dashboard__section">
      <h3>最近活动</h3>
      <div class="dashboard__placeholder">
        <p>暂无数据</p>
        <span>更多内容敬请期待</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.dashboard {
  max-width: 1200px;
}

.dashboard__header {
  margin-bottom: 24px;
  h2 {
    font-size: 22px;
    font-weight: 600;
    color: #1f1f1f;
  }
  p {
    margin-top: 4px;
    color: #999;
    font-size: 14px;
  }
}

.dashboard__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stat-card {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  border-top: 3px solid;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.stat-card__value {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: #1f1f1f;
  margin-bottom: 4px;
}

.stat-card__label {
  color: #999;
  font-size: 14px;
}

.dashboard__section {
  h3 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
  }
}

.dashboard__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);

  p {
    font-size: 16px;
    color: #999;
  }

  span {
    margin-top: 8px;
    font-size: 13px;
    color: #bbb;
  }
}
</style>
