<template>
  <Input v-bind="{ ...defaultProps, ...$attrs }" v-model:value="value">
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>
  </Input>
</template>

<script setup lang="ts">
import { Input } from 'antdv-next';

import type { InputProps } from 'antdv-next';
import { useAttrs } from 'vue';

defineOptions({ name: 'DynamicFormText', inheritAttrs: false });

const value = defineModel<InputProps['value']>('value');

const attrs = useAttrs();
console.log('attrs', attrs);

/** 文本输入框的默认配置，可在此处统一扩展。 */
const defaultProps = {};
</script>
