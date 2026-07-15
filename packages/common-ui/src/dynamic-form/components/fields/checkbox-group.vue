<template>
  <CheckboxGroup v-bind="$attrs">
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>
  </CheckboxGroup>
</template>

<script setup lang="ts">
import { CheckboxGroup } from 'antdv-next';

defineOptions({ name: 'DynamicFormCheckboxGroup', inheritAttrs: false });
</script>
