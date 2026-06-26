<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const title = computed(() => String(route.meta.title ?? 'Dashboard'));
</script>

<template>
  <div class="vertical-layout">
    <aside class="vertical-layout__sider">
      <div class="vertical-layout__brand">ADP</div>
      <nav class="vertical-layout__nav">
        <RouterLink to="/dashboard" class="vertical-layout__nav-item">Dashboard</RouterLink>
      </nav>
    </aside>

    <section class="vertical-layout__main">
      <header class="vertical-layout__header">
        <span>{{ title }}</span>
      </header>
      <main class="vertical-layout__content">
        <RouterView />
      </main>
    </section>
  </div>
</template>

<style scoped lang="less">
.vertical-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f7fb;
}

.vertical-layout__sider {
  width: 220px;
  background: #111827;
  color: #fff;
}

.vertical-layout__brand {
  height: 56px;
  padding: 0 20px;
  font-size: 18px;
  font-weight: 700;
  line-height: 56px;
}

.vertical-layout__nav {
  padding: 8px;
}

.vertical-layout__nav-item {
  display: block;
  padding: 10px 12px;
  color: rgb(255 255 255 / 78%);
  border-radius: 6px;
}

.vertical-layout__nav-item.router-link-active {
  color: #fff;
  background: #2563eb;
}

.vertical-layout__main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.vertical-layout__header {
  height: 56px;
  padding: 0 24px;
  font-weight: 600;
  line-height: 56px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}

.vertical-layout__content {
  flex: 1;
  padding: 24px;
}
</style>
