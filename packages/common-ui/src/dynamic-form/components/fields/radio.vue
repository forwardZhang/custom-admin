<template>
  <RadioGroup v-bind="$attrs">
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>
  </RadioGroup>
</template>

<script setup lang="ts">
import { RadioGroup } from 'antdv-next';

defineOptions({ name: 'DynamicFormRadio', inheritAttrs: false });
</script>
