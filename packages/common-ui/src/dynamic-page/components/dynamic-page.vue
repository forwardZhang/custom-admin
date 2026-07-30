<template>
  <div v-bind="attrs" class="dynamic-page">
    <section class="dynamic-page__search" aria-label="查询条件">
      <DynamicSearch :search-state="pageState.searchState" />
    </section>

    <div v-if="slots.between" class="dynamic-page__between">
      <slot
        name="between"
        :search-api="pageState.searchApi"
        :search-values="submittedSearchValues"
        :table-api="pageState.tableApi"
      />
    </div>

    <section class="dynamic-page__table">
      <DynamicTable :table-state="pageState.tableState">
        <template v-if="slots.default" #default><slot /></template>
        <template v-for="slotName in tableSlotNames" :key="slotName" #[slotName]="slotProps">
          <slot :name="slotName" v-bind="slotProps" />
        </template>
      </DynamicTable>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs, watch } from 'vue';

import { DynamicSearch } from '../../dynamic-search';
import { DynamicTable } from '../../dynamic-table';
import { DynamicPageState } from '../core/page-state';

import type { DynamicPageInternalProps } from '../core/internal-props';
import type { FormData } from '../../dynamic-form';
import type { UseDynamicPageOptions } from '../types';

defineOptions({ name: 'DynamicPage', inheritAttrs: false });

// 组件模式读 props 自建 State；useDynamicPage 模式通过 pageState prop 复用同一份 State。
const props = withDefaults(defineProps<DynamicPageInternalProps>(), {
  autoReload: true,
  clearSelectionOnSearch: true,
  searchConfig: undefined,
  tableConfig: undefined,
  pageState: undefined,
});

const attrs = useAttrs();
const slots = defineSlots<Record<string, (props?: Record<string, unknown>) => unknown>>();

const ownsState = !props.pageState;
const pageState =
  props.pageState ??
  new DynamicPageState<FormData, Record<string, unknown>>(props as UseDynamicPageOptions);

const submittedSearchValues = pageState.submittedSearchValues;

// 组件模式下 props 是唯一配置来源；Hook 模式的配置直接改 State，不经过 props。
if (ownsState) {
  watch(
    () => props.searchConfig,
    (searchConfig) => searchConfig && pageState.searchApi.setOptions(searchConfig),
  );

  watch(
    () => props.tableConfig,
    (tableConfig) => tableConfig && pageState.tableApi.setState(tableConfig),
  );

  watch(
    () => [props.autoReload, props.clearSelectionOnSearch] as const,
    ([autoReload, clearSelectionOnSearch]) =>
      pageState.setOptions({ autoReload, clearSelectionOnSearch }),
  );
}

const tableSlotNames = computed(() =>
  Object.keys(slots).filter((name) => !['between', 'default'].includes(name)),
);

// SFC 声明只保留运行时键，精确泛型由公开的 DynamicPageInstance 类型提供。
defineExpose<Record<string, unknown>>({
  get searchApi() {
    return pageState.searchApi;
  },
  get tableApi() {
    return pageState.tableApi;
  },
  get searchValues() {
    return pageState.submittedSearchValues.value;
  },
} as unknown as Record<string, unknown>);
</script>

<style scoped>
.dynamic-page {
  display: grid;
  min-width: 0;
  gap: 16px;
}

.dynamic-page__search,
.dynamic-page__table {
  min-width: 0;
  border: 1px solid var(--ant-color-border-secondary);
  border-radius: 8px;
  background: var(--ant-color-bg-container);
}

.dynamic-page__search {
  padding: 18px 18px 2px;
}

.dynamic-page__between {
  min-width: 0;
}

.dynamic-page__table {
  overflow: hidden;
  padding: 18px;
}

@media (max-width: 640px) {
  .dynamic-page {
    gap: 12px;
  }

  .dynamic-page__search,
  .dynamic-page__table {
    padding: 12px;
  }
}
</style>
