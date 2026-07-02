<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'antdv-next';
import type { FormInstance, Rule } from 'antdv-next';
import { storage } from '@package/shared';
import { useUserStore } from '@/store/modules/user';
import { loginApi } from '@/api/auth';
import type { LoginParams } from '@/api/auth';

defineOptions({ name: 'PwdLogin' });

const REMEMBER_KEY = 'login-remember-username';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const formRef = ref<FormInstance>();
const loading = ref(false);
const remember = ref(false);

const form = reactive<LoginParams>({
  username: '',
  password: '',
});

const rules: Record<string, Rule[]> = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' },
  ],
};

onMounted(() => {
  const saved = storage.get<string>(REMEMBER_KEY, '');
  if (saved) {
    form.username = saved;
    remember.value = true;
  }
});

async function handleLogin() {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  loading.value = true;
  try {
    const res = await loginApi(form);
    userStore.setToken(res.data.token);
    userStore.setUserInfo(res.data.userInfo);

    if (remember.value) {
      storage.set(REMEMBER_KEY, form.username);
    } else {
      storage.remove(REMEMBER_KEY);
    }

    message.success('登录成功');

    const redirect = (route.query.redirect as string) || '/dashboard';
    router.replace(redirect);
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || '登录失败，请检查用户名和密码';
    message.error(msg);
  } finally {
    loading.value = false;
  }
}

function handleQuickLogin(account: { username: string; password: string }) {
  form.username = account.username;
  form.password = account.password;
  handleLogin();
}

function handleTodo(label: string) {
  message.info(`${label}功能开发中，敬请期待`);
}

const demoAccounts = [
  { label: '管理员', username: 'admin', password: '123456' },
  { label: '普通用户', username: 'user', password: '123456' },
];
</script>

<template>
  <a-form
    ref="formRef"
    :model="form"
    :rules="rules"
    size="large"
    layout="vertical"
    @keyup.enter="handleLogin"
  >
    <a-form-item name="username">
      <a-input
        v-model:value="form.username"
        placeholder="请输入账号"
        autocomplete="username"
        allow-clear
      >
        <template #prefix>
          <svg
            class="h-[18px] w-[18px] text-text-quaternary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
          </svg>
        </template>
      </a-input>
    </a-form-item>

    <a-form-item name="password">
      <a-input-password
        v-model:value="form.password"
        placeholder="请输入密码"
        autocomplete="current-password"
      >
        <template #prefix>
          <svg
            class="h-[18px] w-[18px] text-text-quaternary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <rect x="4" y="10" width="16" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
        </template>
      </a-input-password>
    </a-form-item>

    <!-- 记住我 + 忘记密码 -->
    <div class="flex items-center justify-between -mt-2 mb-4">
      <a-checkbox v-model:checked="remember">记住我</a-checkbox>
      <a-button type="link" size="small" class="!px-0" @click="handleTodo('忘记密码')"
        >忘记密码？</a-button
      >
    </div>

    <a-form-item>
      <a-button
        type="primary"
        block
        size="large"
        shape="round"
        :loading="loading"
        @click="handleLogin"
      >
        登 录
      </a-button>
    </a-form-item>
  </a-form>

  <!-- 分隔线 -->
  <a-divider class="!my-4 !text-text-quaternary !text-xs">演示账号快速登录</a-divider>

  <!-- 演示账号 -->
  <div class="flex gap-3">
    <a-button
      v-for="account in demoAccounts"
      :key="account.username"
      block
      :disabled="loading"
      @click="handleQuickLogin(account)"
    >
      {{ account.label }}
    </a-button>
  </div>

  <!-- 底部注册 -->
  <p class="mt-6 text-center text-sm text-text-secondary">
    还没有账号？
    <a-button type="link" class="!px-1 !py-0 !h-auto" @click="handleTodo('注册')"
      >立即注册</a-button
    >
  </p>
</template>
