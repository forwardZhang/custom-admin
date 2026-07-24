<template>
  <FormItem
    v-if="resolvedIf"
    v-show="resolvedShow"
    v-bind="resolvedFormItemProps"
    :class="['min-w-0', schema.itemClass, { 'dynamic-form-field--compact': compact }]"
    :label="hideLabel ? undefined : resolvedLabel"
    :name="formItemName"
    :rules="resolvedRules"
    :help="resolvedHelp"
    :extra="resolvedDescription"
  >
    <DynamicFormList v-if="isListField" :disabled="resolvedDisabled">
      <template #field="{ compact: childCompact, field, itemIndex }">
        <FormField
          :base-path="[...fieldPath, itemIndex]"
          :compact="childCompact"
          :hide-label="childCompact"
          :schema="field"
        />
      </template>
    </DynamicFormList>
    <FieldControl v-else />
  </FormItem>
</template>

<script setup lang="ts">
import type { Ref } from 'vue';

import { computed } from 'vue';
import { FormItem } from 'antdv-next';

import DynamicFormList from '../field/list/index.vue';
import { provideDynamicFormFieldContext } from '../core/context';
import { useFormField } from '../composables/use-form-field';
import type { DynamicFormFieldSchema, FormData, FormPath } from '../types';

defineOptions({ name: 'FormField' });

const props = withDefaults(
  defineProps<{
    /** 当前字段完整配置。 */
    schema: DynamicFormFieldSchema<FormData>;
    /** 嵌套字段的父级数据路径。 */
    basePath?: FormPath;
    /** 是否使用无外边距的紧凑样式。 */
    compact?: boolean;
    /** 是否隐藏字段标签，table 布局由表头展示 label。 */
    hideLabel?: boolean;
  }>(),
  {
    basePath: undefined,
    compact: false,
    hideLabel: false,
  },
);

const isListField = computed(() => props.schema.component === 'list');

const {
  schemaRef,
  fieldApi,
  fieldPath,
  formItemName,
  resolvedIf,
  resolvedShow,
  resolvedDisabled,
  resolvedLabel,
  resolvedHelp,
  resolvedDescription,
  resolvedRules,
  resolvedFormItemProps,
  FieldControl,
} = useFormField(props);

provideDynamicFormFieldContext<FormData>({
  api: fieldApi,
  schema: schemaRef as Readonly<Ref<DynamicFormFieldSchema<FormData>>>,
});
</script>

<style scoped>
.dynamic-form-field--compact {
  margin-bottom: 0;
}
</style>
