<template>
  <div class="example-container">
    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">固定高度滚动</h3>
          <p class="section-description">设置 height 属性，内容超出时显示滚动条</p>
        </div>
      </div>

      <div class="demo-block">
        <Scrollbar height="300px" class="rounded-lg border border-border-secondary">
          <div class="space-y-3 p-4">
            <p v-for="i in 30" :key="i" class="m-0 text-sm text-text">
              第 {{ i }} 行 — 这是一段用于演示垂直滚动效果的占位文本
            </p>
          </div>
        </Scrollbar>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">最大高度模式</h3>
          <p class="section-description">设置 maxHeight，内容不超出时不显示滚动条</p>
        </div>
      </div>

      <div class="demo-block">
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <div class="mb-2 text-xs text-text-tertiary">内容少于 maxHeight</div>
            <Scrollbar max-height="200px" class="rounded-lg border border-border-secondary">
              <div class="space-y-3 p-4">
                <p v-for="i in 5" :key="i" class="m-0 text-sm text-text">
                  第 {{ i }} 行 — 内容未超出
                </p>
              </div>
            </Scrollbar>
          </div>
          <div>
            <div class="mb-2 text-xs text-text-tertiary">内容超出 maxHeight</div>
            <Scrollbar max-height="200px" class="rounded-lg border border-border-secondary">
              <div class="space-y-3 p-4">
                <p v-for="i in 20" :key="i" class="m-0 text-sm text-text">
                  第 {{ i }} 行 — 内容超出，显示滚动条
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
          <h3 class="section-title">水平与垂直滚动</h3>
          <p class="section-description">内容宽高均超出容器时，同时出现两个滚动条</p>
        </div>
      </div>

      <div class="demo-block">
        <Scrollbar height="200px" class="rounded-lg border border-border-secondary">
          <div class="w-150 space-y-3 p-4">
            <p v-for="i in 20" :key="i" class="m-0 text-sm text-text">
              第 {{ i }} 行 — 内容宽度 600px，超出容器，会出现水平滚动条
            </p>
          </div>
        </Scrollbar>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Scrollbar } from '@package/common-ui';

defineOptions({ name: 'BasicExample' });
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
</style>
