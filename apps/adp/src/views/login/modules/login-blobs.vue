<script setup lang="ts">
defineOptions({ name: 'LoginBlobs' });
</script>

<template>
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
</template>

<style scoped>
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

@media (prefers-reduced-motion: reduce) {
  .login-blob {
    animation: none !important;
  }
}
</style>
