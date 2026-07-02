import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { storage } from '@package/shared';
import { APP_TOKEN_KEY } from '@/constants';
import { ROUTE_NAME_LOGIN } from '@/constants/route';
import { loginApi, logoutApi, getProfileApi } from '@/api/auth';
import type { LoginParams, UserInfo } from '@/api/auth';

/**
 * 用户 / 认证 Store
 *
 * 参考 soybean-admin 的 auth store 设计，适配当前项目的请求层与存储层：
 * - token 真相源在 localStorage，内存 token 在 store 创建时从 storage 读取；
 * - 登录态、用户信息、角色权限统一由本 store 管理；
 * - 路由守卫通过 isLogin 判断登录态，在 userInfo 为空时调用 initUserInfo 拉取。
 *
 * 请求层已自动解包 ApiResponse.data 并在业务失败时抛错，
 * 因此本 store 直接使用接口返回的业务数据，无需判断 code。
 */
export const useUserStore = defineStore('user', () => {
  /** 访问令牌（创建时从 localStorage 恢复，刷新后仍可判断登录态） */
  const token = ref<string>(storage.get(APP_TOKEN_KEY, ''));

  /** 当前登录用户信息 */
  const userInfo = ref<UserInfo | null>(null);

  /** 用户信息是否已加载（避免路由守卫重复请求 profile） */
  const isUserInfoLoaded = ref(false);

  /** 是否已登录 */
  const isLogin = computed(() => Boolean(token.value));

  /** 当前用户角色编码列表 */
  const roles = computed<string[]>(() => userInfo.value?.roles ?? []);

  /** 当前用户按钮级权限码列表 */
  const buttons = computed<string[]>(() => userInfo.value?.buttons ?? []);

  /** 是否为超级管理员（拥有 R_SUPER 角色即放行所有路由） */
  const isSuper = computed(() => roles.value.includes('R_SUPER'));

  /**
   * 登录
   *
   * 调用登录接口（请求层已解包，失败自动抛错）→ 落地 token（内存 + localStorage）→ 写入用户信息。
   * 登录接口已返回 userInfo，因此无需再额外请求 profile。
   * @param params - 账号密码
   * @returns 登录结果（token + userInfo）
   * @throws 登录失败时抛出 RequestError，由调用方捕获并提示
   */
  async function login(params: LoginParams) {
    // 请求层已解包：返回值即业务数据 { token, userInfo }
    const { token: loginToken, userInfo: info } = await loginApi(params);

    // 1. 落地 token（内存 + localStorage，后续请求头会从 storage 读取）
    token.value = loginToken;
    storage.set(APP_TOKEN_KEY, loginToken);

    // 2. 写入用户信息（登录接口已返回，无需再请求 profile）
    userInfo.value = info;
    isUserInfoLoaded.value = true;

    return { token: loginToken, userInfo: info };
  }

  /**
   * 获取用户信息
   *
   * 主动调用 profile 接口刷新 userInfo（如权限变更后重新拉取）。
   * @returns 用户信息
   * @throws 接口失败时抛出 RequestError
   */
  async function getUserInfo() {
    // 请求层已解包：返回值即 UserInfo
    userInfo.value = await getProfileApi();
    isUserInfoLoaded.value = true;
    return userInfo.value;
  }

  /**
   * 初始化用户信息
   *
   * 页面刷新后 store 重建，userInfo 丢失但 token 仍在 localStorage。
   * 由路由守卫在「已登录但 userInfo 为空」时调用，拉取用户信息；
   * 拉取失败（token 失效）则重置登录态并返回 false。
   * @returns 是否初始化成功
   */
  async function initUserInfo() {
    if (!token.value) return false;

    try {
      await getUserInfo();
      return true;
    } catch {
      resetStore();
      return false;
    }
  }

  /**
   * 退出登录
   *
   * 通知后端注销（失败不阻塞）→ 清空本地登录态 → 跳转登录页（带 redirect）。
   * 通过动态 import 路由实例，避免 store 与 router 的循环依赖。
   * @param redirect - 登录后是否回跳到当前页，默认 true
   */
  async function logout(redirect = true) {
    // 1. 通知后端（静默失败，不影响本地登出）
    try {
      await logoutApi();
    } catch {
      // 忽略：即便后端注销失败也要完成本地登出
    }

    // 2. 记录当前路径，用于登录后回跳
    const { router } = await import('@/router');
    const currentPath = router.currentRoute.value.fullPath;

    // 3. 清空本地登录态
    resetStore();

    // 4. 跳转登录页
    const query = redirect ? { redirect: currentPath } : undefined;
    await router.replace({ name: ROUTE_NAME_LOGIN, query });
  }

  /**
   * 重置登录态
   *
   * 清空内存 token / userInfo，并移除 localStorage 中的 token。
   * 不负责跳转，由调用方（如 logout、token 失效拦截器）决定后续行为。
   */
  function resetStore() {
    token.value = '';
    userInfo.value = null;
    isUserInfoLoaded.value = false;
    storage.remove(APP_TOKEN_KEY);
  }

  return {
    token,
    userInfo,
    isUserInfoLoaded,
    isLogin,
    roles,
    buttons,
    isSuper,
    login,
    getUserInfo,
    initUserInfo,
    logout,
    resetStore,
  };
});
