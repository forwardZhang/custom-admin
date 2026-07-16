<template>
  <DateRangePicker v-bind="{ ...defaultProps, ...$attrs }" v-model:value="value">
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>
  </DateRangePicker>
</template>

<script setup lang="ts">
import { DateRangePicker } from 'antdv-next';

defineOptions({ name: 'DynamicFormRangePicker', inheritAttrs: false });

const value = defineModel<
  [start: string | null | undefined, end: string | null | undefined] | null
>('value');

/** 日期范围字段默认输出字符串数组，便于直接提交给接口。 */
const defaultProps = {
  style: { width: '100%' },
  valueFormat: 'YYYY-MM-DD',
};
</script>
