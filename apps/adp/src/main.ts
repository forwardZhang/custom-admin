import { createApp } from 'vue';

import './styles/tailwind.css';
import './styles/nprogress.css';
import './styles/global.scss';
import App from './App.vue';

import { setupDayjs, setupNProgress } from './plugins';
import { setupStore } from './store';
import { setupRouter } from './router';
import { initPreference } from './utils/preference';

async function setupApp() {
  // 初始化偏好设置（声明 HTML 属性与 CSS 变量）
  initPreference();

  // 安装dayjs与nprogress进度条
  setupDayjs();
  setupNProgress();

  const app = createApp(App);

  // 初始化pinia
  setupStore(app);

  // 初始化并挂载路由
  await setupRouter(app);

  app.mount('#app');
}

setupApp();
