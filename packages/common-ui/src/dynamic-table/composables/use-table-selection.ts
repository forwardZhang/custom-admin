import type { TableRowSelection } from 'antdv-next';

import { computed, ref, shallowRef, watch } from 'vue';
import { isEqual } from 'lodash-es';

import type {
  DynamicTableKey,
  DynamicTableRowSelection,
  DynamicTableSelectionMode,
} from '../types';

export interface UseTableSelectionOptions<TRecord extends object> {
  getMode: () => DynamicTableSelectionMode;
  getRowSelection: () => DynamicTableRowSelection<TRecord> | undefined;
  /** 受控选中 key；未配置时选中状态完全由内部持有。 */
  getSelectedRowKeys: () => DynamicTableKey[] | undefined;
  onChange: (keys: DynamicTableKey[], rows: TRecord[]) => void;
}

/**
 * 行选择状态。
 * 对外交出的数组一律是新数组，避免调用方拿到内部引用后就地修改。
 */
export function useTableSelection<TRecord extends object>(
  options: UseTableSelectionOptions<TRecord>,
) {
  const selectedRowKeys = ref<DynamicTableKey[]>([...(options.getSelectedRowKeys() ?? [])]);
  const selectedRows = shallowRef<TRecord[]>([]);

  const type = computed<'checkbox' | 'radio' | false>(() => {
    const mode = options.getMode();
    if (mode === false) return false;
    return mode === 'single' ? 'radio' : 'checkbox';
  });

  /** 多选且有选中项时工具栏切到批量操作形态。 */
  const batchMode = computed(() => type.value === 'checkbox' && selectedRowKeys.value.length > 0);

  const rowSelection = computed<TableRowSelection<TRecord> | undefined>(() => {
    if (type.value === false) return undefined;

    const configured = options.getRowSelection();
    const configuredOnChange = configured?.onChange;

    return {
      ...configured,
      type: type.value,
      selectedRowKeys: selectedRowKeys.value,
      onChange: (
        keys: DynamicTableKey[],
        rows: TRecord[],
        info: Parameters<NonNullable<typeof configuredOnChange>>[2],
      ) => {
        selectedRowKeys.value = [...keys];
        selectedRows.value = [...rows];
        options.onChange([...keys], [...rows]);
        configuredOnChange?.(keys, rows, info);
      },
    };
  });

  function clearSelection(): void {
    selectedRowKeys.value = [];
    selectedRows.value = [];
    options.onChange([], []);
  }

  // 受控 selectedRowKeys 只作为输入同步进来；相等时不写，避免与 update:selectedRowKeys 成环。
  watch(
    () => options.getSelectedRowKeys(),
    (keys) => {
      if (keys && !isEqual(keys, selectedRowKeys.value)) selectedRowKeys.value = [...keys];
    },
    { deep: true },
  );

  return { selectedRowKeys, selectedRows, type, batchMode, rowSelection, clearSelection };
}
