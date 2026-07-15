<template>
  <Select v-bind="{ ...defaultProps, ...$attrs }">
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>
  </Select>
</template>

<script setup lang="ts">
import { Select } from 'antdv-next';

defineOptions({ name: 'DynamicFormSelect', inheritAttrs: false });

/** 下拉选择器的默认配置，可在此处统一扩展。 */
const defaultProps = {
  style: { width: '100%' },
};
</script>
