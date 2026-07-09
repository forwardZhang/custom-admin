<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { ROUTE_NAME_ROOT } from '@/constants/route';

defineOptions({ name: 'ExceptionBase' });

type ExceptionType = '403' | '404' | '500';

interface Props {
  /** 异常类型：403 无权限 / 404 未找到 / 500 服务错误 */
  type: ExceptionType;
}

const props = defineProps<Props>();

const router = useRouter();

interface ExceptionMeta {
  code: string;
  title: string;
  desc: string;
}

const metaMap: Record<ExceptionType, ExceptionMeta> = {
  '403': { code: '403', title: '无访问权限', desc: '抱歉，您没有权限访问此页面' },
  '404': { code: '404', title: '页面未找到', desc: '您访问的页面不存在或已被移除' },
  '500': { code: '500', title: '服务器错误', desc: '服务器开小差了，请稍后重试' },
};

const meta = computed(() => metaMap[props.type]);

function goHome() {
  router.replace({ name: ROUTE_NAME_ROOT });
}

function goBack() {
  if (window.history.state?.back) {
    router.back();
  } else {
    router.replace({ name: ROUTE_NAME_ROOT });
  }
}
</script>

<template>
  <div
    class="exception-base size-full flex min-h-[60vh] flex-col items-center justify-center gap-6 overflow-hidden px-6"
  >
    <!-- 装饰光晕 + 漂浮粒子 -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        class="exception-halo absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-2xl"
      />
      <span
        class="exception-dot absolute left-[18%] top-[28%] h-8 w-8 rounded-full bg-primary/15"
      />
      <span
        class="exception-dot absolute right-[16%] top-[36%] h-5 w-5 rounded-full bg-primary/20"
      />
      <span
        class="exception-dot absolute bottom-[20%] left-[24%] h-4 w-4 rounded-full bg-primary/25"
      />
      <span
        class="exception-dot absolute bottom-[26%] right-[22%] h-10 w-10 rounded-full bg-primary/10"
      />
    </div>

    <div class="relative z-10 flex flex-col items-center justify-center gap-4 text-center">
      <!-- 线性图标插画 -->
      <div class="text-primary">
        <svg
          v-if="type === '404'"
          class="h-[72px] w-[72px]"
          viewBox="0 0 72 72"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M40 10H22a4 4 0 0 0-4 4v44a4 4 0 0 0 4 4h28a4 4 0 0 0 4-4V24z" />
          <path d="M40 10v14h14" />
          <path d="M30 42l-4 4 4 4M42 42l4 4-4 4" opacity="0.55" />
          <path d="M33 50h6" opacity="0.55" />
        </svg>
        <svg
          v-else-if="type === '403'"
          class="h-[72px] w-[72px]"
          viewBox="0 0 72 72"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <rect x="16" y="30" width="40" height="30" rx="6" />
          <path d="M26 30v-8a10 10 0 0 1 20 0v8" />
          <circle cx="36" cy="44" r="3.5" />
          <path d="M36 47.5V52" />
        </svg>
        <svg
          v-else
          class="h-[72px] w-[72px]"
          viewBox="0 0 72 72"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M44 14a22 22 0 1 0 14 14" />
          <path d="M44 14v10h10" />
          <path d="M36 26v12l8 5" />
        </svg>
      </div>

      <!-- 大号错误码 -->
      <div class="exception-code text-[96px] font-extrabold leading-none sm:text-[120px]">
        {{ meta.code }}
      </div>

      <h1 class="text-h2 font-semibold text-text">{{ meta.title }}</h1>
      <p class="max-w-[420px] text-sm leading-relaxed text-text-secondary">{{ meta.desc }}</p>

      <!-- 操作按钮 -->
      <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
        <a-button type="primary" size="large" @click="goHome">返回首页</a-button>
        <a-button size="large" @click="goBack">返回上一页</a-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.exception-base {
  position: relative;
}

.exception-code {
  color: var(--ant-color-primary);
  text-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.exception-dot {
  animation: exception-float 6s ease-in-out infinite;
}
.exception-dot:nth-of-type(2) {
  animation-duration: 7.5s;
  animation-delay: -1.2s;
}
.exception-dot:nth-of-type(3) {
  animation-duration: 5.5s;
  animation-delay: -2.4s;
}
.exception-dot:nth-of-type(4) {
  animation-duration: 8s;
  animation-delay: -0.6s;
}

@keyframes exception-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-14px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .exception-dot,
  .exception-halo {
    animation: none !important;
  }
}
</style>
