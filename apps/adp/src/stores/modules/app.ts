import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
  const collapsed = ref(false);
  const darkMode = ref(false);

  function toggleCollapsed() {
    collapsed.value = !collapsed.value;
  }

  function toggleDarkMode() {
    darkMode.value = !darkMode.value;
  }

  return { collapsed, darkMode, toggleCollapsed, toggleDarkMode };
});
