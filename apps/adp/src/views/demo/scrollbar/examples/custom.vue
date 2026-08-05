<template>
  <div class="example-container">
    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">CSS 变量自定义</h3>
          <p class="section-description">通过 CSS 变量自定义滚动条颜色、尺寸等</p>
        </div>
      </div>

      <div class="demo-block">
        <div class="grid gap-4">
          <div>
            <div class="mb-2 text-xs text-text-tertiary">主题色滚动条</div>
            <Scrollbar
              height="200px"
              class="rounded-lg border border-border-secondary"
              style="
                --scrollbar-size: 10px;
                --scrollbar-thumb-color: var(--ant-color-primary);
                --scrollbar-thumb-hover-color: var(--ant-color-primary-hover);
                --scrollbar-radius: 5px;
              "
            >
              <div class="space-y-3 p-4">
                <p v-for="i in 20" :key="i" class="m-0 text-sm text-text">
                  第 {{ i }} 行 — 使用主题色的滚动条
                </p>
              </div>
            </Scrollbar>
          </div>

          <div>
            <div class="mb-2 text-xs text-text-tertiary">成功色滚动条</div>
            <Scrollbar
              height="200px"
              class="rounded-lg border border-border-secondary"
              style="
                --scrollbar-size: 8px;
                --scrollbar-thumb-color: var(--ant-color-success);
                --scrollbar-thumb-hover-color: var(--ant-color-success-hover);
                --scrollbar-radius: 4px;
              "
            >
              <div class="space-y-3 p-4">
                <p v-for="i in 20" :key="i" class="m-0 text-sm text-text">
                  第 {{ i }} 行 — 使用成功色的滚动条
                </p>
              </div>
            </Scrollbar>
          </div>

          <div>
            <div class="mb-2 text-xs text-text-tertiary">粗滚动条</div>
            <Scrollbar
              height="200px"
              class="rounded-lg border border-border-secondary"
              style="
                --scrollbar-size: 14px;
                --scrollbar-thumb-color: var(--ant-color-warning);
                --scrollbar-thumb-hover-color: var(--ant-color-warning-hover);
                --scrollbar-radius: 7px;
              "
            >
              <div class="space-y-3 p-4">
                <p v-for="i in 20" :key="i" class="m-0 text-sm text-text">
                  第 {{ i }} 行 — 使用粗滚动条
                </p>
              </div>
            </Scrollbar>
          </div>
        </div>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">可用的 CSS 变量</h3>
          <p class="section-description">通过这些变量自定义滚动条外观</p>
        </div>
      </div>

      <div class="demo-block">
        <div class="grid gap-3 sm:grid-cols-2">
          <div v-for="item in cssVars" :key="item.name" class="css-var-item">
            <code>{{ item.name }}</code>
            <span>{{ item.description }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Scrollbar } from '@package/common-ui';

defineOptions({ name: 'CustomExample' });

const cssVars = [
  { name: '--scrollbar-size', description: '滚动条宽度/高度' },
  { name: '--scrollbar-thumb-color', description: '滑块颜色' },
  { name: '--scrollbar-thumb-hover-color', description: '滑块悬停颜色' },
  { name: '--scrollbar-track-color', description: '轨道颜色' },
  { name: '--scrollbar-radius', description: '滑块圆角' },
];
</script>

<style scoped>
.example-container {
  display: grid;
  gap: 24px;
}

.example-section {
  border: 1px solid var(--ant-color-border-secondary);
  border-radius: 8px;
  background: var(--ant-color-bg-container);
  padding: 20px;
}

.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.section-title {
  margin: 0;
  color: var(--ant-color-text);
  font-size: 16px;
  font-weight: 600;
}

.section-description {
  margin: 4px 0 0;
  color: var(--ant-color-text-secondary);
  font-size: 13px;
}

.demo-block {
  border-top: 1px solid var(--ant-color-border-secondary);
  padding-top: 16px;
}

.css-var-item {
  display: grid;
  gap: 6px;
  border-radius: 6px;
  background: var(--ant-color-fill-quaternary);
  padding: 12px;
}

.css-var-item code {
  color: var(--ant-color-primary);
  font-size: 12px;
  font-weight: 600;
}

.css-var-item span {
  color: var(--ant-color-text-secondary);
  font-size: 12px;
}
</style>
