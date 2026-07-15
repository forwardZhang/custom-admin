<template>
  <Checkbox v-bind="$attrs">
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>
  </Checkbox>
</template>

<script setup lang="ts">
import { Checkbox } from 'antdv-next';

defineOptions({ name: 'DynamicFormCheckbox', inheritAttrs: false });
</script>
