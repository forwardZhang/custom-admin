<template>
  <!--
    Schema 节点只分三路：布局容器、数组字段、普通字段。
    前两类通过默认插槽递归回到当前 Renderer，因此可无限嵌套。
  -->
  <template v-for="(item, index) in schema" :key="getSchemaKey(item, index)">
    <!-- card / collapse：渲染容器外壳，并把相对路径和禁用状态传给 children。 -->
    <DynamicFormContainerField
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
    </DynamicFormContainerField>

    <!-- arrayField：每个数组项各渲染一次 children，basePath 会附加当前索引。 -->
    <DynamicFormArrayField
      v-else-if="isArraySchema(item)"
      :schema="item"
      :base-path="basePath"
      :inherited-disabled="inheritedDisabled"
    >
      <template #default="slotProps">
        <DynamicFormSchemaRenderer
          :schema="slotProps.schema"
          :base-path="slotProps.basePath"
          :inherited-disabled="slotProps.inheritedDisabled"
        />
      </template>
    </DynamicFormArrayField>

    <!-- 其余内置名称或 Vue Component 均作为普通受控字段渲染。 -->
    <DynamicFormFieldRenderer
      v-else
      :schema="item"
      :base-path="basePath"
      :inherited-disabled="inheritedDisabled"
    />
  </template>
</template>

<script setup lang="ts">
import DynamicFormArrayField from '../components/array-field.vue';
import DynamicFormContainerField from '../components/container-field.vue';
import DynamicFormFieldRenderer from './field-renderer.vue';
import { isArraySchema, isContainerSchema, pathToString, resolvePath } from '../utils';

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

/** 字段优先使用完整数据路径作为 key；无 fieldName 的纯布局容器回退到下标。 */
const getSchemaKey = (item: DynamicFormSchemaItem<FormData>, index: number) =>
  item.fieldName
    ? `${item.component}-${pathToString(resolvePath(props.basePath, item.fieldName))}`
    : `${item.component}-${index}`;
</script>
