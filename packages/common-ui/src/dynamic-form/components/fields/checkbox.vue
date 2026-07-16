<template>
  <Checkbox v-bind="$attrs" v-model:checked="value">
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>
  </Checkbox>
</template>

<script setup lang="ts">
import { Checkbox } from 'antdv-next';

import type { CheckboxProps } from 'antdv-next';

defineOptions({ name: 'DynamicFormCheckbox', inheritAttrs: false });

/** DynamicForm 对外统一使用 value，组件内部再适配 Checkbox 的 checked 模型。 */
const value = defineModel<CheckboxProps['checked']>('value');
</script>
