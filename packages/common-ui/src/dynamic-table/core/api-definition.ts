import type { ApiProxyDefinition } from '../../internal/use-api-proxy';

import type { DynamicTableApi } from '../types';

/** 表格 api 的成员清单：hook 代理据此决定排队 / 兜底 / 转发。 */
export function createTableApiDefinition<TRecord extends object>(): ApiProxyDefinition<
  DynamicTableApi<TRecord>
> {
  return {
    commands: ['reload'],
    methods: ['clearSelection', 'toggleFullscreen', 'getNativeInstance'],
    properties: ['selectedRowKeys', 'selectedRows', 'loading'],
    fallbacks: {
      selectedRowKeys: () => [],
      selectedRows: () => [],
      loading: () => false,
      getNativeInstance: () => undefined,
    },
  };
}
