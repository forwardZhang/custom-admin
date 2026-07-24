<template>
  <div class="dynamic-form-list">
    <component
      :is="layout"
      v-if="isCustomLayout"
      :add-item="addItem"
      :copy-item="copyItem"
      :disabled="disabled"
      :items="items"
      :list-path="listPath"
      :reached-max="reachedMax"
      :reached-min="reachedMin"
      :remove-item="removeItem"
      :row-keys="rowKeys"
      :schema="childSchema"
      :show-add="listProps.showAdd !== false"
      :show-copy="listProps.showCopy !== false"
      :show-delete="listProps.showDelete !== false"
    >
      <template #field="fieldProps">
        <slot name="field" v-bind="fieldProps" />
      </template>
    </component>

    <template v-else-if="items.length">
      <div v-if="layout === 'card'" class="dynamic-form-list__cards">
        <Card
          v-for="(item, itemIndex) in items"
          :key="rowKeys[itemIndex]"
          class="dynamic-form-list__card"
          size="small"
          :title="`第 ${itemIndex + 1} 项`"
        >
          <template v-if="showActions" #extra>
            <div class="dynamic-form-list__actions">
              <Tooltip v-if="listProps.showCopy !== false" title="复制">
                <Button
                  aria-label="复制"
                  size="small"
                  type="text"
                  :disabled="disabled || reachedMax"
                  @click="copyItem(itemIndex)"
                >
                  <CopyOutlined />
                </Button>
              </Tooltip>
              <Tooltip v-if="listProps.showDelete !== false" title="删除">
                <Button
                  aria-label="删除"
                  danger
                  size="small"
                  type="text"
                  :disabled="disabled || reachedMin"
                  @click="removeItem(itemIndex)"
                >
                  <DeleteOutlined />
                </Button>
              </Tooltip>
            </div>
          </template>

          <div class="dynamic-form-list__card-fields">
            <template
              v-for="(field, fieldIndex) in childSchema"
              :key="`${rowKeys[itemIndex]}-${fieldIndex}`"
            >
              <slot
                name="field"
                :compact="false"
                :field="field"
                :field-index="fieldIndex"
                :item-index="itemIndex"
                :item-key="rowKeys[itemIndex]"
              />
            </template>
          </div>
        </Card>
      </div>

      <Table
        v-else
        class="dynamic-form-list__table"
        :columns="tableColumns"
        :data-source="items"
        :pagination="false"
        :row-key="getRowKey"
        :scroll="{ x: 'max-content' }"
        size="middle"
        bordered
      >
        <template #bodyCell="{ column, index }">
          <slot
            v-if="getColumnFieldIndex(column) >= 0"
            :compact="true"
            :field="childSchema[getColumnFieldIndex(column)]"
            :field-index="getColumnFieldIndex(column)"
            :item-index="index"
            :item-key="rowKeys[index]"
            name="field"
          />
          <div v-else class="dynamic-form-list__actions dynamic-form-list__table-actions">
            <Tooltip v-if="listProps.showCopy !== false" title="复制">
              <Button
                aria-label="复制"
                size="small"
                type="text"
                :disabled="disabled || reachedMax"
                @click="copyItem(index)"
              >
                <CopyOutlined />
              </Button>
            </Tooltip>
            <Tooltip v-if="listProps.showDelete !== false" title="删除">
              <Button
                aria-label="删除"
                danger
                size="small"
                type="text"
                :disabled="disabled || reachedMin"
                @click="removeItem(index)"
              >
                <DeleteOutlined />
              </Button>
            </Tooltip>
          </div>
        </template>
      </Table>
    </template>

    <Empty v-else :description="listProps.emptyText ?? '暂无数据'" />

    <Button
      v-if="!isCustomLayout && listProps.showAdd !== false"
      block
      class="dynamic-form-list__add"
      type="dashed"
      :disabled="disabled || reachedMax"
      @click="addItem"
    >
      <template #icon><PlusOutlined /></template>
      {{ listProps.addButtonText ?? '新增一项' }}
    </Button>
  </div>
</template>

<script setup lang="ts">
import { Button, Card, Empty, Table, Tooltip } from 'antdv-next';
import { CopyOutlined, DeleteOutlined, PlusOutlined } from '@antdv-next/icons';

import { useFormList } from '../../composables/use-form-list';
import type { DynamicFormFieldSchema, FormData } from '../../types';

defineOptions({ name: 'DynamicFormList', inheritAttrs: false });

const props = defineProps<{
  disabled: boolean;
}>();

defineSlots<{
  field(props: {
    compact: boolean;
    field: DynamicFormFieldSchema<FormData>;
    fieldIndex: number;
    itemIndex: number;
    itemKey: string;
  }): unknown;
}>();

const {
  childSchema,
  listProps,
  layout,
  isCustomLayout,
  items,
  listPath,
  reachedMin,
  reachedMax,
  showActions,
  rowKeys,
  tableColumns,
  getRowKey,
  getColumnFieldIndex,
  addItem,
  copyItem,
  removeItem,
} = useFormList(() => props.disabled);
</script>

<style scoped>
.dynamic-form-list {
  min-width: 0;
  width: 100%;
}

.dynamic-form-list__cards {
  display: grid;
  gap: 12px;
}

.dynamic-form-list__card {
  border-radius: 6px;
}

.dynamic-form-list__card-fields {
  display: grid;
  min-width: 0;
  grid-template-columns: repeat(auto-fit, minmax(min(220px, 100%), 1fr));
  column-gap: 16px;
}

.dynamic-form-list__actions {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 2px;
}

.dynamic-form-list__table-actions {
  justify-content: center;
}

.dynamic-form-list__table :deep(.ant-form-item) {
  margin-bottom: 0;
}

.dynamic-form-list__add {
  margin-top: 12px;
}
</style>
