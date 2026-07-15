<template>
  <DateRangePicker v-bind="{ ...defaultProps, ...$attrs }">
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>
  </DateRangePicker>
</template>

<script setup lang="ts">
import { DateRangePicker } from 'antdv-next';

defineOptions({ name: 'DynamicFormRangePicker', inheritAttrs: false });

/** 日期范围字段默认输出字符串数组，便于直接提交给接口。 */
const defaultProps = {
  style: { width: '100%' },
  valueFormat: 'YYYY-MM-DD',
};
</script>
