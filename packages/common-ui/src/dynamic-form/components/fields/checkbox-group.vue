<template>
  <CheckboxGroup v-bind="$attrs" v-model:value="value">
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>
  </CheckboxGroup>
</template>

<script setup lang="ts">
import { CheckboxGroup } from 'antdv-next';

import type { CheckboxGroupProps } from 'antdv-next';

defineOptions({ name: 'DynamicFormCheckboxGroup', inheritAttrs: false });

const value = defineModel<CheckboxGroupProps['value']>('value');
</script>
