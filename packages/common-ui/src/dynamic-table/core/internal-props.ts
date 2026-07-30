import type { DynamicTablePublicProps } from '../types';
import type { DynamicTableState } from './table-state';

/**
 * DynamicTable 的内部 props。
 * tableState 只由 useDynamicTable / DynamicPage 传入，不进入 DynamicTablePublicProps。
 */
export interface DynamicTableInternalProps<
  TRecord extends object = Record<string, unknown>,
> extends DynamicTablePublicProps<TRecord> {
  /** 复用已创建的 State；为空时由组件自建。 */
  tableState?: DynamicTableState<TRecord>;
}
