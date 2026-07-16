<template>
  <Select v-bind="{ ...defaultProps, ...$attrs }" v-model:value="value">
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>
  </Select>
</template>

<script setup lang="ts">
import { Select } from 'antdv-next';

import type { SelectProps } from 'antdv-next';

defineOptions({ name: 'DynamicFormSelect', inheritAttrs: false });

const value = defineModel<SelectProps['value']>('value');

/** 下拉选择器的默认配置，可在此处统一扩展。 */
const defaultProps = {
  style: { width: '100%' },
};
</script>
