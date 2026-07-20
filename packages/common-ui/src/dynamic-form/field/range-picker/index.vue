<template>
  <DateRangePicker v-bind="props.fieldProps" v-model:value="pickerValue">
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>
  </DateRangePicker>
</template>

<script setup lang="ts">
import type { RangePickerProps } from 'antdv-next';

import { DateRangePicker } from 'antdv-next';
import { computed } from 'vue';

defineOptions({ name: 'DynamicFormRangePicker', inheritAttrs: false });

const props = withDefaults(defineProps<{ fieldProps?: RangePickerProps }>(), {
  fieldProps: () => ({}),
});
const modelValue = defineModel<unknown>();
const pickerValue = computed<RangePickerProps['value']>({
  get: () => modelValue.value as RangePickerProps['value'],
  set: (value) => {
    modelValue.value = value;
  },
});
</script>
