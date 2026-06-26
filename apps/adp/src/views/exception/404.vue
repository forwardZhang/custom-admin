<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

function goHome() {
  router.replace('/dashboard');
}
</script>

<template>
  <div class="flex-col-center min-h-[calc(100vh-160px)] text-center">
    <div class="text-[120px] font-extrabold text-primary leading-none opacity-30">404</div>
    <h1 class="mt-4 text-xxl font-semibold text-foreground">页面未找到</h1>
    <p class="mt-2 text-muted text-sm">您访问的页面不存在或已被移除</p>
    <button class="mt-6 h-10 px-6 text-sm text-white cursor-pointer bg-primary border-none rounded-base transition-[background] duration-200 hover:bg-[#4096ff]" @click="goHome">返回首页</button>
  </div>
</template>
