<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

function goHome() {
  router.replace('/dashboard');
}
</script>

<template>
  <div class="not-found">
    <div class="not-found__code">404</div>
    <h1 class="not-found__title">页面未找到</h1>
    <p class="not-found__desc">您访问的页面不存在或已被移除</p>
    <button class="not-found__btn" @click="goHome">返回首页</button>
  </div>
</template>

<style scoped lang="less">
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 160px);
  text-align: center;
}

.not-found__code {
  font-size: 120px;
  font-weight: 800;
  color: #1677ff;
  line-height: 1;
  opacity: 0.3;
}

.not-found__title {
  margin-top: 16px;
  font-size: 24px;
  font-weight: 600;
  color: #1f1f1f;
}

.not-found__desc {
  margin-top: 8px;
  color: #999;
  font-size: 14px;
}

.not-found__btn {
  margin-top: 24px;
  height: 40px;
  padding: 0 24px;
  font-size: 14px;
  color: #fff;
  cursor: pointer;
  background: #1677ff;
  border: none;
  border-radius: 6px;
  transition: background 0.2s;

  &:hover {
    background: #4096ff;
  }
}
</style>
