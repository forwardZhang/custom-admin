<template>
  <template v-for="(item, index) in schema" :key="getSchemaKey(item, index)">
    <DynamicFormContainer
      v-if="isContainerSchema(item)"
      :schema="item"
      :base-path="basePath"
      :inherited-disabled="inheritedDisabled"
    >
      <template #default="slotProps">
        <DynamicFormSchemaRenderer
          :schema="item.children"
          :base-path="slotProps.basePath"
          :inherited-disabled="slotProps.inheritedDisabled"
        />
      </template>
    </DynamicFormContainer>

    <DynamicFormSchemaRenderer
      v-else-if="isObjectSchema(item)"
      :schema="item.children"
      :base-path="resolvePath(basePath, item.fieldName)"
      :inherited-disabled="inheritedDisabled"
    />

    <DynamicFormFieldRenderer
      v-else
      :schema="item"
      :base-path="basePath"
      :inherited-disabled="inheritedDisabled"
    >
      <template v-if="isListSchema(item)" #default="slotProps">
        <DynamicFormSchemaRenderer
          :schema="slotProps.schema"
          :base-path="slotProps.basePath"
          :inherited-disabled="slotProps.inheritedDisabled"
        />
      </template>
    </DynamicFormFieldRenderer>
  </template>
</template>

<script setup lang="ts">
import DynamicFormContainer from '../components/container.vue';
import DynamicFormFieldRenderer from './field-renderer.vue';
import {
  isContainerSchema,
  isListSchema,
  isObjectSchema,
  pathToString,
  resolvePath,
} from '../utils';

import type { DynamicFormSchema, DynamicFormSchemaItem, FormData } from '../types';

defineOptions({ name: 'DynamicFormSchemaRenderer' });

const props = withDefaults(
  defineProps<{
    schema: DynamicFormSchema<FormData>;
    basePath?: Array<string | number>;
    inheritedDisabled?: boolean;
  }>(),
  {
    basePath: () => [],
    inheritedDisabled: false,
  },
);

/** 具名结构使用完整数据路径作为 key；纯 UI 容器回退到下标。 */
const getSchemaKey = (item: DynamicFormSchemaItem<FormData>, index: number) =>
  'fieldName' in item
    ? `${item.component}-${pathToString(resolvePath(props.basePath, item.fieldName))}`
    : `${item.component}-${index}`;
</script>
