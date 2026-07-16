<template>
  <div class="dynamic-form-list">
    <Card
      v-for="(item, index) in items"
      :key="itemKeys[index]"
      size="small"
      class="dynamic-form-list__item"
    >
      <template #title>{{ getItemTitle(index) }}</template>
      <template v-if="!readOnly" #extra>
        <Space size="small" wrap>
          <Button
            size="small"
            type="link"
            :disabled="disabled || index === 0"
            @click="moveItem(index, index - 1)"
          >
            {{ moveUpText ?? '上移' }}
          </Button>
          <Button
            size="small"
            type="link"
            :disabled="disabled || index === items.length - 1"
            @click="moveItem(index, index + 1)"
          >
            {{ moveDownText ?? '下移' }}
          </Button>
          <Button
            size="small"
            type="link"
            :disabled="disabled || reachedMax"
            @click="copyItem(index)"
          >
            {{ copyText ?? '复制' }}
          </Button>
          <Button
            size="small"
            type="link"
            danger
            :disabled="disabled || reachedMin"
            @click="removeItem(index)"
          >
            {{ removeText ?? '删除' }}
          </Button>
        </Space>
      </template>

      <Row :gutter="[16, 16]">
        <slot
          :schema="children"
          :base-path="[...fieldName, index]"
          :inherited-disabled="disabled"
        />
      </Row>
    </Card>

    <Button
      v-if="!readOnly"
      type="dashed"
      block
      :disabled="disabled || reachedMax"
      @click="addItem"
    >
      {{ addText ?? '新增一项' }}
    </Button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Button, Card, Row, Space } from 'antdv-next';

import { cloneDeep } from '../../utils';

import type {
  DynamicFormListSchema,
  DynamicFormResolveContext,
  FormData,
  ListProps,
} from '../../types';

defineOptions({ name: 'DynamicFormList', inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    children: DynamicFormListSchema<FormData>['children'];
    fieldName: Array<string | number>;
    resolveContext: DynamicFormResolveContext<FormData>;
    disabled?: boolean;
    readOnly?: boolean;
    minItems?: number;
    maxItems?: number;
    addText?: string;
    copyText?: string;
    removeText?: string;
    moveUpText?: string;
    moveDownText?: string;
    itemTitle?: ListProps<FormData>['itemTitle'];
    createItem?: DynamicFormListSchema<FormData>['createItem'];
    beforeAdd?: DynamicFormListSchema<FormData>['beforeAdd'];
    beforeRemove?: DynamicFormListSchema<FormData>['beforeRemove'];
    beforeCopy?: DynamicFormListSchema<FormData>['beforeCopy'];
    beforeMove?: DynamicFormListSchema<FormData>['beforeMove'];
  }>(),
  {
    disabled: false,
    readOnly: false,
    minItems: undefined,
    maxItems: undefined,
    addText: undefined,
    copyText: undefined,
    removeText: undefined,
    moveUpText: undefined,
    moveDownText: undefined,
    itemTitle: undefined,
    createItem: undefined,
    beforeAdd: undefined,
    beforeRemove: undefined,
    beforeCopy: undefined,
    beforeMove: undefined,
  },
);

defineSlots<{
  default: (props: {
    schema: DynamicFormListSchema<FormData>['children'];
    basePath: Array<string | number>;
    inheritedDisabled: boolean;
  }) => unknown;
}>();

const value = defineModel<Record<string, unknown>[]>('value', { default: () => [] });

let keySeed = 0;
const createKey = () => `dynamic-form-list-${Date.now()}-${keySeed++}`;
const items = computed(() => (Array.isArray(value.value) ? value.value : []));
const itemKeys = ref<string[]>(items.value.map(createKey));

watch(
  () => items.value.length,
  (length) => {
    while (itemKeys.value.length < length) itemKeys.value.push(createKey());
    if (itemKeys.value.length > length) itemKeys.value.splice(length);
  },
);

const reachedMin = computed(() => items.value.length <= (props.minItems ?? 0));
const reachedMax = computed(
  () => props.maxItems !== undefined && items.value.length >= props.maxItems,
);

const updateItems = (nextItems: Record<string, unknown>[]) => {
  value.value = nextItems;
};

const runHook = async (
  hook: DynamicFormListSchema<FormData>['beforeAdd'],
  payload: { index?: number; item?: Record<string, unknown> },
) => {
  if (!hook) return true;
  return (
    (await hook({
      ...props.resolveContext,
      value: items.value,
      indices:
        payload.index === undefined
          ? props.resolveContext.indices
          : [...props.resolveContext.indices, payload.index],
      index: payload.index,
      item: payload.item,
    })) !== false
  );
};

const addItem = async () => {
  if (props.disabled || reachedMax.value) return;
  const index = items.value.length;
  const item = cloneDeep(
    props.createItem
      ? await props.createItem({
          ...props.resolveContext,
          value: items.value,
          indices: [...props.resolveContext.indices, index],
          index,
          item: undefined,
        })
      : {},
  );
  if (!(await runHook(props.beforeAdd, { index, item }))) return;
  itemKeys.value.push(createKey());
  updateItems([...cloneDeep(items.value), item]);
};

const removeItem = async (index: number) => {
  if (props.disabled || reachedMin.value) return;
  const item = cloneDeep(items.value[index]);
  if (!(await runHook(props.beforeRemove, { index, item }))) return;
  const nextItems = cloneDeep(items.value);
  nextItems.splice(index, 1);
  itemKeys.value.splice(index, 1);
  updateItems(nextItems);
};

const copyItem = async (index: number) => {
  if (props.disabled || reachedMax.value) return;
  const item = cloneDeep(items.value[index]);
  if (!(await runHook(props.beforeCopy, { index, item }))) return;
  itemKeys.value.splice(index + 1, 0, createKey());
  const nextItems = cloneDeep(items.value);
  nextItems.splice(index + 1, 0, item ?? {});
  updateItems(nextItems);
};

const moveItem = async (from: number, to: number) => {
  if (props.disabled || to < 0 || to >= items.value.length) return;
  if (props.beforeMove) {
    const allowed = await props.beforeMove({
      ...props.resolveContext,
      value: items.value,
      indices: [...props.resolveContext.indices, from],
      from,
      to,
      index: from,
      item: cloneDeep(items.value[from]),
    });
    if (allowed === false) return;
  }

  const nextItems = cloneDeep(items.value);
  const [item] = nextItems.splice(from, 1);
  nextItems.splice(to, 0, item ?? {});
  const [key] = itemKeys.value.splice(from, 1);
  itemKeys.value.splice(to, 0, key ?? createKey());
  updateItems(nextItems);
};

const getItemTitle = (index: number) => {
  if (typeof props.itemTitle === 'function') {
    return props.itemTitle({
      ...props.resolveContext,
      value: items.value,
      index,
      indices: [...props.resolveContext.indices, index],
      item: items.value[index] ?? {},
    });
  }
  return props.itemTitle ? `${props.itemTitle} ${index + 1}` : `第 ${index + 1} 项`;
};
</script>

<style scoped>
.dynamic-form-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dynamic-form-list__item {
  width: 100%;
}
</style>
