<template>
  <Switch v-bind="$attrs">
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>
  </Switch>
</template>

<script setup lang="ts">
import { Switch } from 'antdv-next';

defineOptions({ name: 'DynamicFormSwitch', inheritAttrs: false });
</script>
