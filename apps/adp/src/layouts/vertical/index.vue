<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const title = computed(() => String(route.meta.title ?? 'Dashboard'));
</script>

<template>
  <div class="flex min-h-screen bg-[#f5f7fb]">
    <aside class="w-sider bg-[#111827] text-white">
      <div class="h-header px-5 text-[18px] font-bold leading-[56px]">ADP</div>
      <nav class="p-2">
        <RouterLink to="/dashboard" class="block py-2.5 px-3 text-white/78 rounded-base"
          >Dashboard</RouterLink
        >
      </nav>
    </aside>

    <section class="flex flex-1 flex-col min-w-0">
      <header class="h-header px-6 font-semibold leading-[56px] bg-white border-b border-[#e5e7eb]">
        <span>{{ title }}</span>
      </header>
      <main class="flex-1 p-6">
        <RouterView />
      </main>
    </section>
  </div>
</template>

<style scoped>
.router-link-active {
  color: #fff;
  background: #2563eb;
}
</style>
