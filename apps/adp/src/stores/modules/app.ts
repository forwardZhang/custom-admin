import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { LayoutType } from '@/layouts';

export const useAppStore = defineStore('app', () => {
  const layout = ref<LayoutType>('vertical');
  const collapsed = ref(false);
  const darkMode = ref(false);

  function setLayout(value: LayoutType) {
    layout.value = value;
  }

  function toggleCollapsed() {
    collapsed.value = !collapsed.value;
  }

  function toggleDarkMode() {
    darkMode.value = !darkMode.value;
  }

  return { layout, collapsed, darkMode, setLayout, toggleCollapsed, toggleDarkMode };
});
