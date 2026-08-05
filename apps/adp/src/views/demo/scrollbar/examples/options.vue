<template>
  <div class="example-container">
    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">always - 始终显示滚动条</h3>
          <p class="section-description">设置 always 属性后滚动条不会自动隐藏</p>
        </div>
      </div>

      <div class="demo-block">
        <Scrollbar height="200px" always class="rounded-lg border border-border-secondary">
          <div class="space-y-3 p-4">
            <p v-for="i in 20" :key="i" class="m-0 text-sm text-text">
              第 {{ i }} 行 — always 模式下滚动条始终可见
            </p>
          </div>
        </Scrollbar>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">native - 原生滚动条</h3>
          <p class="section-description">使用浏览器默认滚动条而不是自定义样式</p>
        </div>
      </div>

      <div class="demo-block">
        <Scrollbar height="200px" native class="rounded-lg border border-border-secondary">
          <div class="space-y-3 p-4">
            <p v-for="i in 20" :key="i" class="m-0 text-sm text-text">
              第 {{ i }} 行 — native 模式使用浏览器原生滚动条
            </p>
          </div>
        </Scrollbar>
      </div>
    </section>

    <section class="example-section">
      <div class="section-header">
        <div>
          <h3 class="section-title">minSize - 最小滚动条尺寸</h3>
          <p class="section-description">设置滚动条滑块的最小尺寸</p>
        </div>
      </div>

      <div class="demo-block">
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <div class="mb-2 text-xs text-text-tertiary">默认 minSize</div>
            <Scrollbar height="150px" class="rounded-lg border border-border-secondary">
              <div class="space-y-3 p-4">
                <p v-for="i in 100" :key="i" class="m-0 text-sm text-text">第 {{ i }} 行</p>
              </div>
            </Scrollbar>
          </div>
          <div>
            <div class="mb-2 text-xs text-text-tertiary">minSize="50"</div>
            <Scrollbar
              height="150px"
              :min-size="50"
              class="rounded-lg border border-border-secondary"
            >
              <div class="space-y-3 p-4">
                <p v-for="i in 100" :key="i" class="m-0 text-sm text-text">第 {{ i }} 行</p>
              </div>
            </Scrollbar>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Scrollbar } from '@package/common-ui';

defineOptions({ name: 'OptionsExample' });
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
