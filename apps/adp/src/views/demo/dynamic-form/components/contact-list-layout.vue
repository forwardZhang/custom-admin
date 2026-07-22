<template>
  <div class="contact-list-layout">
    <Card
      v-for="(item, itemIndex) in items"
      :key="rowKeys[itemIndex]"
      class="contact-list-layout__item"
      size="small"
    >
      <template #title>自定义布局 · 第 {{ itemIndex + 1 }} 项</template>
      <template #extra>
        <div v-if="showCopy || showDelete" class="contact-list-layout__actions">
          <Tooltip v-if="showCopy" title="复制">
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
          <Tooltip v-if="showDelete" title="删除">
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

      <div class="contact-list-layout__fields">
        <template
          v-for="(field, fieldIndex) in schema"
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

    <Button v-if="showAdd" block type="dashed" :disabled="disabled || reachedMax" @click="addItem">
      <template #icon><PlusOutlined /></template>
      新增联系人
    </Button>
  </div>
</template>

<script setup lang="ts">
import { Button, Card, Tooltip } from 'antdv-next';
import { CopyOutlined, DeleteOutlined, PlusOutlined } from '@antdv-next/icons';

import type {
  DynamicFormFieldSchema,
  DynamicFormListLayoutComponentProps,
  FormData,
} from '@package/common-ui';

defineOptions({ name: 'ContactListLayout' });

defineProps<DynamicFormListLayoutComponentProps<FormData>>();

defineSlots<{
  field(props: {
    compact: boolean;
    field: DynamicFormFieldSchema<FormData>;
    fieldIndex: number;
    itemIndex: number;
    itemKey: string;
  }): unknown;
}>();
</script>

<style scoped>
.contact-list-layout {
  display: grid;
  gap: 12px;
}

.contact-list-layout__item {
  border-radius: 6px;
}

.contact-list-layout__fields {
  display: grid;
  min-width: 0;
  grid-template-columns: repeat(auto-fit, minmax(min(220px, 100%), 1fr));
  gap: 0 16px;
}

.contact-list-layout__actions {
  display: inline-flex;
  gap: 2px;
}
</style>
