<template>
  <Switch v-bind="$attrs" v-model:checked="value">
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>
  </Switch>
</template>

<script setup lang="ts">
import { Switch } from 'antdv-next';

import type { SwitchProps } from 'antdv-next';

defineOptions({ name: 'DynamicFormSwitch', inheritAttrs: false });

/** DynamicForm 对外统一使用 value，组件内部再适配 Switch 的 checked 模型。 */
const value = defineModel<SwitchProps['checked']>('value');
</script>
