<template>
  <Switch v-bind="props.fieldProps" v-model:checked="modelValue">
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>
  </Switch>
</template>

<script setup lang="ts">
import type { SwitchProps } from 'antdv-next';

import { Switch } from 'antdv-next';

defineOptions({ name: 'DynamicFormSwitch', inheritAttrs: false });

const props = withDefaults(defineProps<{ fieldProps?: SwitchProps }>(), {
  fieldProps: () => ({}),
});
const modelValue = defineModel<SwitchProps['checked']>();
</script>
