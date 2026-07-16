<template>
  <RadioGroup v-bind="$attrs" v-model:value="value">
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>
  </RadioGroup>
</template>

<script setup lang="ts">
import { RadioGroup } from 'antdv-next';

import type { RadioGroupProps } from 'antdv-next';

defineOptions({ name: 'DynamicFormRadio', inheritAttrs: false });

const value = defineModel<RadioGroupProps['value']>('value');
</script>
