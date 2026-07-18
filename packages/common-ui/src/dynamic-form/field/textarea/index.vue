<template>
  <TextArea v-bind="props.fieldProps" v-model:value="modelValue" class="w-full">
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>
  </TextArea>
</template>

<script setup lang="ts">
import type { TextAreaProps } from 'antdv-next';

import { TextArea } from 'antdv-next';

defineOptions({ name: 'DynamicFormTextarea', inheritAttrs: false });

const props = withDefaults(defineProps<{ fieldProps?: TextAreaProps }>(), {
  fieldProps: () => ({}),
});
const modelValue = defineModel<TextAreaProps['value']>();
</script>
