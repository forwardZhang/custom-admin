import { createApp } from 'vue';
import App from './App.vue';
function setupApp() {
  const app = createApp(App);
  app.mount('#app');
}

setupApp();
