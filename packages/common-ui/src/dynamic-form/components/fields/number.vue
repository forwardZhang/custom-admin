<template>
  <InputNumber v-bind="{ ...defaultProps, ...$attrs }" v-model:value="value">
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>
  </InputNumber>
</template>

<script setup lang="ts">
import { InputNumber } from 'antdv-next';

import type { InputNumberProps } from 'antdv-next';

defineOptions({ name: 'DynamicFormNumber', inheritAttrs: false });

const value = defineModel<InputNumberProps['value']>('value');

/** 数字输入框的默认配置，可在此处统一扩展。 */
const defaultProps = {
  style: { width: '100%' },
};
</script>
