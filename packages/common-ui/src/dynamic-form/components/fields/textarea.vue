<template>
  <TextArea v-bind="{ ...defaultProps, ...$attrs }">
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>
  </TextArea>
</template>

<script setup lang="ts">
import { TextArea } from 'antdv-next';

defineOptions({ name: 'DynamicFormTextarea', inheritAttrs: false });

/** 多行文本输入框的默认配置，可在此处统一扩展。 */
const defaultProps = {
  style: { width: '100%' },
};
</script>
