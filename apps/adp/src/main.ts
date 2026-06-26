import { createApp } from 'vue';
import { message } from "@package/common-ui";

import App from './App.vue';
import { router } from './router';
import { setupStores } from './stores';
import './styles/theme.css';

const app = createApp(App);

setupStores(app);
message.success('hello world');
 
app.use(router);
app.mount('#app');
