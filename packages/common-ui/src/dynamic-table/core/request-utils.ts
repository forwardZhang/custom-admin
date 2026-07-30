import type { TablePaginationConfig } from 'antdv-next';

import { isArray, isObject } from 'lodash-es';

import type { DynamicTableRequestResult } from '../types';

export const DEFAULT_DYNAMIC_TABLE_PAGINATION: TablePaginationConfig = {
  defaultCurrent: 1,
  defaultPageSize: 10,
  pageSizeOptions: [10, 20, 50, 100],
  showQuickJumper: true,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`,
};

/** 判断 request 是否返回服务端分页格式，而不是一次性数组。 */
export function isPagedResult<TRecord extends object>(
  result: DynamicTableRequestResult<TRecord>,
): result is Extract<
  DynamicTableRequestResult<TRecord>,
  { data: { list: TRecord[]; total: number } }
> {
  return (
    isObject(result) &&
    !isArray(result) &&
    isObject(result.data) &&
    isArray(result.data.list) &&
    typeof result.data.total === 'number'
  );
}
