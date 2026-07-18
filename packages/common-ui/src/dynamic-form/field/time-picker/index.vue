<template>
  <TimePicker v-bind="props.fieldProps" v-model:value="pickerValue" class="w-full">
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>
  </TimePicker>
</template>

<script setup lang="ts">
import type { TimePickerProps } from 'antdv-next';

import { TimePicker } from 'antdv-next';
import { computed } from 'vue';

defineOptions({ name: 'DynamicFormTimePicker', inheritAttrs: false });

const props = withDefaults(defineProps<{ fieldProps?: TimePickerProps }>(), {
  fieldProps: () => ({}),
});
const modelValue = defineModel<unknown>();
const pickerValue = computed<TimePickerProps['value']>({
  get: () => modelValue.value as TimePickerProps['value'],
  set: (value) => {
    modelValue.value = value;
  },
});
</script>
