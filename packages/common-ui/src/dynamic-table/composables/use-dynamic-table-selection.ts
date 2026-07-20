import type { TableRowSelection } from 'antdv-next';
import type { ComputedRef, Ref, ShallowRef } from 'vue';
import { computed, ref, shallowRef, watch } from 'vue';

import type { DynamicTableKey, DynamicTablePublicProps, DynamicTableSelection } from '../types';

type SelectionProps<TRecord extends object> = Pick<
  DynamicTablePublicProps<TRecord>,
  'multiple' | 'single' | 'selection' | 'rowSelection' | 'selectedRowKeys'
>;

interface UseDynamicTableSelectionOptions<TRecord extends object> {
  props: SelectionProps<TRecord>;
  emitSelectionChange: (keys: DynamicTableKey[], rows: TRecord[]) => void;
  emitSelectedRowKeys: (keys: DynamicTableKey[]) => void;
}

interface UseDynamicTableSelectionReturn<TRecord extends object> {
  batchMode: ComputedRef<boolean>;
  clearSelection: () => void;
  mergedRowSelection: ComputedRef<TableRowSelection<TRecord> | undefined>;
  selectedRowKeys: Ref<DynamicTableKey[]>;
  selectedRows: ShallowRef<TRecord[]>;
  selectionType: ComputedRef<DynamicTableSelection>;
}

/** 将多选/单选开关和受控选中状态收敛成 Table 所需的 rowSelection。 */
export function useDynamicTableSelection<TRecord extends object>({
  props,
  emitSelectionChange,
  emitSelectedRowKeys,
}: UseDynamicTableSelectionOptions<TRecord>): UseDynamicTableSelectionReturn<TRecord> {
  const selectedRowKeys = ref<DynamicTableKey[]>([]);
  const selectedRows = shallowRef<TRecord[]>([]);

  const selectionType = computed<DynamicTableSelection>(() => {
    // multiple 明确为 true 时优先级最高，覆盖 single=true。
    if (props.multiple === true) return 'checkbox';
    if (props.single === true) return 'radio';
    if (props.multiple === false) return false;

    // 旧 selection API 只在新开关都未配置时生效。
    if (props.multiple === undefined && props.single === undefined) {
      return props.selection ?? 'checkbox';
    }

    return 'checkbox';
  });

  const batchMode = computed(
    () => selectionType.value === 'checkbox' && selectedRowKeys.value.length > 0,
  );

  const mergedRowSelection = computed<TableRowSelection<TRecord> | undefined>(() => {
    if (selectionType.value === false) return undefined;

    const configuredSelection = props.rowSelection;
    const configuredOnChange = configuredSelection?.onChange;

    return {
      ...configuredSelection,
      type: selectionType.value,
      selectedRowKeys: selectedRowKeys.value,
      onChange: (
        keys: DynamicTableKey[],
        rows: TRecord[],
        info: Parameters<NonNullable<typeof configuredOnChange>>[2],
      ) => {
        selectedRowKeys.value = [...keys];
        selectedRows.value = [...rows];
        emitSelectedRowKeys([...keys]);
        emitSelectionChange([...keys], [...rows]);
        configuredOnChange?.(keys, rows, info);
      },
    };
  });

  function clearSelection(): void {
    selectedRowKeys.value = [];
    selectedRows.value = [];
    emitSelectedRowKeys([]);
    emitSelectionChange([], []);
  }

  watch(
    () => props.selectedRowKeys,
    (keys) => {
      if (keys) selectedRowKeys.value = [...keys];
    },
    { immediate: true, deep: true },
  );

  return {
    batchMode,
    clearSelection,
    mergedRowSelection,
    selectedRowKeys,
    selectedRows,
    selectionType,
  };
}
