import type { Router } from 'vue-router';
import { APP_TITLE } from '@/constants';

/**
 * 文档标题守卫
 *
 * 路由切换后，根据 meta.title 更新浏览器标签页标题，
 * 格式为 `${title} - ${APP_TITLE}`；无 title 时仅显示 APP_TITLE。
 * @param router - 路由实例
 */
export function createTitleGuard(router: Router) {
  router.afterEach((to) => {
    const pageTitle = to.meta.title?.trim() || '';
    document.title = pageTitle ? `${pageTitle} - ${APP_TITLE}` : APP_TITLE;
  });
}
