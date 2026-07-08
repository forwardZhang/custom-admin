<script setup lang="ts">
import { computed } from 'vue';
import { useAppStore } from '@/store';
import { APP_TITLE } from '@/constants';
import { themeColors } from '@/constants/preference';
import PwdLogin from './modules/pwd-login.vue';
import LoginBlobs from './modules/login-blobs.vue';

defineOptions({ name: 'Login' });

const appStore = useAppStore();

const activeColor = computed(() => appStore.preference.theme.colorPrimary);

/** 标题首字母，用于 Logo 展示 */
const titleInitial = computed(() => (APP_TITLE || 'A').trim().charAt(0).toUpperCase());

function selectTheme(color: string) {
  appStore.updatePreference({ theme: { colorPrimary: color } });
}
</script>

<template>
  <div class="login-page relative size-full overflow-hidden">
    <!-- 渐变色块装饰（参考 soybean WaveBg） -->
    <LoginBlobs />

    <!-- 居中卡片 -->
    <div class="relative z-10 flex size-full items-center justify-center p-4">
      <div
        class="login-card w-[420px] max-w-[92vw] overflow-hidden rounded-2xl bg-container shadow-2xl"
      >
        <!-- 卡片头部 -->
        <header class="flex items-center justify-between px-8 pt-8 max-sm:px-6 max-sm:pt-6">
          <div class="flex items-center gap-3">
            <div
              class="login-logo flex h-11 w-11 items-center justify-center rounded-xl text-xl font-bold text-white shadow-md max-sm:h-10 max-sm:w-10"
            >
              {{ titleInitial }}
            </div>
            <span class="text-base font-semibold tracking-wider text-text">{{ APP_TITLE }}</span>
          </div>

          <!-- 主题色快速切换 -->
          <div class="flex items-center gap-1.5">
            <button
              v-for="item in themeColors"
              :key="item.value"
              type="button"
              class="login-dot h-5 w-5 rounded-full transition-transform"
              :style="{
                backgroundColor: item.value,
                boxShadow:
                  activeColor === item.value
                    ? `0 0 0 2px var(--ant-color-bg-container), 0 0 0 4px ${item.value}`
                    : 'none',
                transform: activeColor === item.value ? 'scale(1.15)' : 'scale(1)',
              }"
              :aria-label="`切换主题色 ${item.label}`"
              :aria-pressed="activeColor === item.value"
              @click="selectTheme(item.value)"
            />
          </div>
        </header>

        <!-- 卡片主体 -->
        <main class="px-8 pb-8 pt-6 max-sm:px-6 max-sm:pb-6">
          <div class="mb-6">
            <h1 class="text-2xl font-bold text-text">欢迎回来</h1>
            <p class="mt-1 text-sm text-text-secondary">请输入账号信息登录 {{ APP_TITLE }}</p>
          </div>

          <h3 class="mb-4 text-base font-medium text-primary">账号登录</h3>
          <PwdLogin />
        </main>

        <!-- 底部版权 -->
        <footer
          class="border-t border-border px-8 py-4 text-center text-xs text-text-quaternary max-sm:px-6"
        >
          © 2026 {{ APP_TITLE }}. All rights reserved.
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 浅色调底：主题色极浅版本，避免整片深色 */
.login-page {
  background-color: var(--ant-color-primary-bg);
}

.login-logo {
  background: linear-gradient(
    135deg,
    var(--ant-color-primary) 0%,
    var(--ant-color-primary-active) 100%
  );
}

.login-card {
  animation: login-card-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes login-card-in {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.login-dot {
  border: none;
  cursor: pointer;
}
.login-dot:hover {
  transform: scale(1.2) !important;
}

@media (prefers-reduced-motion: reduce) {
  .login-card {
    animation: none !important;
  }
}
</style>
