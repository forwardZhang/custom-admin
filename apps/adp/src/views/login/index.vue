<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '#/stores';

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
  <div class="login-page">
    <div class="login-card">
      <h1 class="login-card__title">ADP Admin</h1>
      <p class="login-card__desc">登录您的账户</p>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="login-form__field">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="请输入用户名"
            autocomplete="username"
          />
        </div>

        <div class="login-form__field">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="请输入密码"
            autocomplete="current-password"
          />
        </div>

        <button type="submit" class="login-form__btn" :disabled="loading">
          {{ loading ? '登录中...' : '登 录' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped lang="less">
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
}

.login-card__title {
  margin-bottom: 8px;
  font-size: 28px;
  font-weight: 700;
  text-align: center;
}

.login-card__desc {
  margin-bottom: 32px;
  color: #999;
  text-align: center;
}

.login-form__field {
  margin-bottom: 20px;

  label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
    color: #333;
  }

  input {
    width: 100%;
    height: 40px;
    padding: 0 12px;
    font-size: 14px;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    outline: none;
    transition: border-color 0.2s;

    &:focus {
      border-color: #1677ff;
      box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.15);
    }
  }
}

.login-form__btn {
  width: 100%;
  height: 42px;
  margin-top: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  cursor: pointer;
  background: #1677ff;
  border: none;
  border-radius: 6px;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: #4096ff;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
}
</style>
