export interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  roles: string[];
}

export interface PageResult<T> {
  items: T[];
  total: number;
}
