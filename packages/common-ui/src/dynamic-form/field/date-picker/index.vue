<template>
  <DatePicker v-bind="props.fieldProps" v-model:value="pickerValue" class="w-full">
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>
  </DatePicker>
</template>

<script setup lang="ts">
import type { DatePickerProps } from 'antdv-next';

import { DatePicker } from 'antdv-next';
import { computed } from 'vue';

defineOptions({ name: 'DynamicFormDatePicker', inheritAttrs: false });

const props = withDefaults(defineProps<{ fieldProps?: DatePickerProps }>(), {
  fieldProps: () => ({}),
});
const modelValue = defineModel<unknown>();
const pickerValue = computed<DatePickerProps['value']>({
  get: () => modelValue.value as DatePickerProps['value'],
  set: (value) => {
    modelValue.value = value;
  },
});
</script>
