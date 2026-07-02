<script setup lang="ts">
import { computed } from 'vue';
import { useAppStore } from '@/store';
import { APP_TITLE } from '@/constants';
import { themeColors } from '@/constants/preference';
import PwdLogin from './modules/pwd-login.vue';

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
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <!-- 右上大圆 blob -->
      <div
        class="login-blob absolute -right-[300px] -top-[900px] max-sm:-right-[100px] max-sm:-top-[1170px]"
      >
        <svg height="1337" width="1337" aria-hidden="true">
          <defs>
            <path
              id="login-path-1"
              fill-rule="evenodd"
              d="M1337,668.5 C1337,1037.455193874239 1037.455193874239,1337 668.5,1337 C523.6725684305388,1337 337,1236 370.50000000000006,1094 C434.03835568300906,824.6732385973953 6.906089672974592e-14,892.6277623047779 0,668.5000000000001 C0,299.5448061257611 299.5448061257609,1.1368683772161603e-13 668.4999999999999,0 C1037.455193874239,0 1337,299.544806125761 1337,668.5Z"
            />
            <linearGradient id="login-grad-1" x1="0.79" y1="0.62" x2="0.21" y2="0.86">
              <stop offset="0" stop-color="var(--ant-color-primary-bg)" stop-opacity="1" />
              <stop offset="1" stop-color="var(--ant-color-primary)" stop-opacity="1" />
            </linearGradient>
          </defs>
          <g>
            <use xlink:href="#login-path-1" fill="url(#login-grad-1)" fill-opacity="0.85" />
          </g>
        </svg>
      </div>

      <!-- 左下大圆 blob -->
      <div
        class="login-blob absolute -bottom-[400px] -left-[200px] max-sm:-bottom-[760px] max-sm:-left-[100px]"
      >
        <svg height="896" width="967.8852157128662" aria-hidden="true">
          <defs>
            <path
              id="login-path-2"
              fill-rule="evenodd"
              d="M896,448 C1142.6325445712241,465.5747656464056 695.2579309733121,896 448,896 C200.74206902668806,896 5.684341886080802e-14,695.2579309733121 0,448.0000000000001 C0,200.74206902668806 200.74206902668791,5.684341886080802e-14 447.99999999999994,0 C695.2579309733121,0 475,418 896,448Z"
            />
            <linearGradient id="login-grad-2" x1="0.5" y1="0" x2="0.5" y2="1">
              <stop offset="0" stop-color="var(--ant-color-primary)" stop-opacity="1" />
              <stop offset="1" stop-color="var(--ant-color-primary-bg)" stop-opacity="1" />
            </linearGradient>
          </defs>
          <g>
            <use xlink:href="#login-path-2" fill="url(#login-grad-2)" fill-opacity="0.8" />
          </g>
        </svg>
      </div>
    </div>

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

.login-blob {
  animation: login-float 18s ease-in-out infinite;
}
.login-blob:nth-of-type(2) {
  animation-duration: 22s;
  animation-delay: -5s;
}

@keyframes login-float {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(20px, 16px) scale(1.03);
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
  .login-card,
  .login-blob {
    animation: none !important;
  }
}
</style>
