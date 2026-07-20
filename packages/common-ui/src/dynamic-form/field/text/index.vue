<template>
  <Input v-model:value="modelValue" allow-clear v-bind="props.fieldProps">
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>
  </Input>
</template>

<script setup lang="ts">
import type { InputProps } from 'antdv-next';

import { Input } from 'antdv-next';

defineOptions({ name: 'DynamicFormText', inheritAttrs: false });

const props = withDefaults(defineProps<{ fieldProps?: InputProps }>(), {
  fieldProps: () => ({}),
});
const modelValue = defineModel<InputProps['value']>();
</script>
