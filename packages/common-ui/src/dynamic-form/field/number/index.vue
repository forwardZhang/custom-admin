<template>
  <InputNumber v-bind="props.fieldProps" v-model:value="modelValue" class="w-full">
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>
  </InputNumber>
</template>

<script setup lang="ts">
import type { InputNumberProps } from 'antdv-next';

import { InputNumber } from 'antdv-next';

defineOptions({ name: 'DynamicFormNumber', inheritAttrs: false });

const props = withDefaults(defineProps<{ fieldProps?: InputNumberProps }>(), {
  fieldProps: () => ({}),
});
const modelValue = defineModel<InputNumberProps['value']>();
</script>
