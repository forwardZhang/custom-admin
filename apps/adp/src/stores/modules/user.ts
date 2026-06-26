import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { UserInfo } from '@package/shared';
import { storage, APP_TOKEN_KEY } from '@package/shared';

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(storage.get(APP_TOKEN_KEY, null));
  const userInfo = ref<UserInfo | null>(null);

  const isLoggedIn = () => !!token.value;

  function setToken(value: string) {
    token.value = value;
    storage.set(APP_TOKEN_KEY, value);
  }

  function setUserInfo(info: UserInfo) {
    userInfo.value = info;
  }

  function logout() {
    token.value = null;
    userInfo.value = null;
    storage.remove(APP_TOKEN_KEY);
  }

  return { token, userInfo, isLoggedIn, setToken, setUserInfo, logout };
});
