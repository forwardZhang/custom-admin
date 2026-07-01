<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/modules/user';

const router = useRouter();
const userStore = useUserStore();

const username = ref('');
const password = ref('');
const loading = ref(false);

async function handleLogin() {
  if (!username.value || !password.value) return;

  loading.value = true;
  try {
    // TODO: call login API
    userStore.setToken('mock-token');
    userStore.setUserInfo({
      id: 1,
      username: username.value,
      nickname: username.value,
      roles: ['admin'],
    });
    router.replace('/dashboard');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="flex-center min-h-screen bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)]">
    <div class="w-[400px] p-10 bg-card rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.18)]">
      <h1 class="mb-2 text-[28px] font-bold text-center">ADP Admin</h1>
      <p class="mb-8 text-muted text-center">登录您的账户</p>

      <form @submit.prevent="handleLogin">
        <div class="mb-5">
          <label for="username" class="block mb-1.5 font-medium text-[#333]">用户名</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="请输入用户名"
            autocomplete="username"
            class="w-full h-10 px-3 text-sm border border-[#d9d9d9] rounded-base outline-none transition-[border-color] duration-200 focus:border-primary focus:shadow-[0_0_0_2px_rgba(22,119,255,0.15)]"
          />
        </div>

        <div class="mb-5">
          <label for="password" class="block mb-1.5 font-medium text-[#333]">密码</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="请输入密码"
            autocomplete="current-password"
            class="w-full h-10 px-3 text-sm border border-[#d9d9d9] rounded-base outline-none transition-[border-color] duration-200 focus:border-primary focus:shadow-[0_0_0_2px_rgba(22,119,255,0.15)]"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full h-[42px] mt-2 text-lg font-medium text-white cursor-pointer bg-primary border-none rounded-base transition-[background] duration-200 hover:bg-[#4096ff] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {{ loading ? '登录中...' : '登 录' }}
        </button>
      </form>
    </div>
  </div>
</template>
