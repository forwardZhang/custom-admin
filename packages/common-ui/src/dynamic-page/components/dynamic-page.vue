<template>
  <div v-bind="attrs" class="dynamic-page p-3" :class="{ 'dynamic-page--fill': props.fill }">
    <section class="dynamic-page__search" aria-label="查询条件">
      <DynamicSearch
        ref="searchRef"
        v-bind="props.search"
        @reset="handleReset"
        @search="handleSearch"
      />
    </section>

    <div v-if="slots.between" class="dynamic-page__between">
      <slot name="between" :search="searchApi" :search-values="searchValues" :table="tableApi" />
    </div>

    <section class="dynamic-page__table">
      <DynamicTable
        ref="tableRef"
        v-bind="props.table"
        :fill="props.fill"
        :immediate="false"
        :request="pageRequest"
      >
        <template v-if="slots.default" #default><slot /></template>
        <template v-for="slotName in tableSlotNames" :key="slotName" #[slotName]="slotProps">
          <slot :name="slotName" v-bind="slotProps" />
        </template>
      </DynamicTable>
    </section>
  </div>
</template>

<script
  setup
  lang="ts"
  generic="TSearch extends FormData = FormData, TRecord extends object = Record<string, unknown>"
>
import { cloneDeep } from 'lodash-es';
import { computed, onMounted, shallowRef, useAttrs, watch } from 'vue';

import { DynamicSearch } from '../../dynamic-search';
import { DynamicTable } from '../../dynamic-table';
import { createSearchApiDefinition } from '../../dynamic-search/core/api-definition';
import { createTableApiDefinition } from '../../dynamic-table/core/api-definition';
import { useApiProxy } from '../../internal/use-api-proxy';

import type { FormData } from '../../dynamic-form';
import type { DynamicSearchApi } from '../../dynamic-search';
import type { DynamicTableApi, DynamicTableRequest } from '../../dynamic-table';
import type { DynamicPageApi, DynamicPageEmits, DynamicPageProps } from '../types';

defineOptions({ name: 'DynamicPage', inheritAttrs: false });

// 配置只从 props 来；默认值只写在这里一处。
const props = withDefaults(defineProps<DynamicPageProps<TSearch, TRecord>>(), {
  autoReload: true,
  clearSelectionOnSearch: true,
  fill: false,
});

const emit = defineEmits<DynamicPageEmits<TSearch>>();

const attrs = useAttrs();
const slots = defineSlots<Record<string, (props?: Record<string, unknown>) => unknown>>();

const searchRef = shallowRef<DynamicSearchApi<TSearch>>();
const tableRef = shallowRef<DynamicTableApi<TRecord>>();

/** 最近一次查询或重置后的搜索条件快照；挂载前回落到搜索区当前值。 */
const submittedSearchValues = shallowRef<TSearch>();

// 两个子 API 用代理取用：引用稳定，且挂载前的调用有统一的排队 / 兜底语义。
const searchApi = useApiProxy<DynamicSearchApi<TSearch>>(
  'DynamicPage',
  () => searchRef.value,
  createSearchApiDefinition<TSearch>(),
);
const tableApi = useApiProxy<DynamicTableApi<TRecord>>(
  'DynamicPage',
  () => tableRef.value,
  createTableApiDefinition<TRecord>(),
);

function currentSearchValues(): TSearch {
  return submittedSearchValues.value ?? searchApi.getValues();
}

const searchValues = computed<TSearch>(currentSearchValues);

/**
 * 把搜索条件补进表格 request 的上下文。
 * 只依赖 props.table.request 的引用，条件在调用时才读，因此表格看到的 request 引用是稳定的。
 */
const pageRequest = computed<DynamicTableRequest<TRecord> | undefined>(() => {
  const request = props.table.request;
  if (!request) return undefined;

  return (context) => request({ ...context, searchValues: cloneDeep(currentSearchValues()) });
});

/** 首屏与 request 变化后是否由页面发起请求。 */
const shouldRequest = () => Boolean(props.table.request) && props.table.immediate !== false;

/** 查询与重置成功后：先记录条件快照，再按配置清选中并刷新。 */
function applySubmitted(values: TSearch): void {
  submittedSearchValues.value = cloneDeep(values);

  if (props.clearSelectionOnSearch) tableApi.clearSelection();
  if (props.autoReload) void tableApi.reload({ resetPage: true });
}

function handleSearch(values: TSearch): void {
  applySubmitted(values);
  emit('search', values);
}

function handleReset(values: TSearch): void {
  applySubmitted(values);
  emit('reset', values);
}

// 首屏请求由页面编排：表格拿到的是 :immediate="false"，条件快照在这里才成立。
onMounted(() => {
  submittedSearchValues.value = cloneDeep(searchApi.getValues());
  if (shouldRequest()) void tableApi.reload();
});

// request 换了函数就重新取数；post 刷新让这次请求晚于表格自身的 reset（否则会被它中止）。
watch(
  pageRequest,
  () => {
    if (shouldRequest()) void tableApi.reload();
  },
  { flush: 'post' },
);

const tableSlotNames = computed(() =>
  Object.keys(slots).filter((name) => !['between', 'default'].includes(name)),
);

const pageApi: DynamicPageApi<TSearch, TRecord> = {
  search: searchApi,
  table: tableApi,
  get searchValues() {
    return currentSearchValues();
  },
};

defineExpose<DynamicPageApi<TSearch, TRecord>>(pageApi);
</script>

<style scoped>
.dynamic-page {
  display: grid;
  min-width: 0;
  gap: 16px;
}

/* 撑满模式：页面吃满父容器高度并禁止整页滚动，剩余高度全部交给表格区。 */
.dynamic-page--fill {
  display: flex;
  height: 100%;
  overflow: hidden;
  flex-direction: column;
}

.dynamic-page--fill .dynamic-page__table {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
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
