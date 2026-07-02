import { createApp } from 'vue';

import './styles/tailwind.css';
import './styles/nprogress.css';
import './styles/global.scss';
import App from './App.vue';

import { setupDayjs, setupNProgress, setupLoading } from './plugins';
import { setupStore } from './store';
import { setupRouter } from './router';
import { initPreference } from './utils/preference';
import { APP_TITLE } from './constants';

async function setupApp() {
  // 初始化用户偏好设置
  const preference = initPreference();
  // 初始化首屏 Loading
  setupLoading({
    title: APP_TITLE,
    themeColor: preference.theme.colorPrimary,
  });

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
