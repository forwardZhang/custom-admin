<template>
  <DatePicker v-bind="{ ...defaultProps, ...$attrs }" v-model:value="value">
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>
  </DatePicker>
</template>

<script setup lang="ts">
import { DatePicker } from 'antdv-next';

defineOptions({ name: 'DynamicFormDatePicker', inheritAttrs: false });

const value = defineModel<string | null>('value');

/** 日期字段默认输出字符串，避免表单数据中混入 Dayjs 实例。 */
const defaultProps = {
  style: { width: '100%' },
  valueFormat: 'YYYY-MM-DD',
};
</script>
