import type { TablePaginationConfig } from 'antdv-next';

/** 分页默认值：与 Antdv 的默认行为一致，只补上项目统一的展示项。 */
export const DEFAULT_DYNAMIC_TABLE_PAGINATION: TablePaginationConfig = {
  defaultCurrent: 1,
  defaultPageSize: 10,
  pageSizeOptions: [10, 20, 50, 100],
  showQuickJumper: true,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`,
};
