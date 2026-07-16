<template>
  <TextArea v-bind="{ ...defaultProps, ...$attrs }" v-model:value="value">
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>
  </TextArea>
</template>

<script setup lang="ts">
import { TextArea } from 'antdv-next';

import type { TextAreaProps } from 'antdv-next';

defineOptions({ name: 'DynamicFormTextarea', inheritAttrs: false });

const value = defineModel<TextAreaProps['value']>('value');

/** 多行文本输入框的默认配置，可在此处统一扩展。 */
const defaultProps = {
  style: { width: '100%' },
};
</script>
