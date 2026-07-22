<template>
  <FormItem
    v-if="resolvedIf"
    v-show="resolvedShow && !collapseHidden"
    v-bind="resolvedFormItemProps"
    :class="['min-w-0', schema.itemClass, { 'dynamic-form-field--compact': compact }]"
    :data-dynamic-form-field="collapseManaged ? fieldKey : undefined"
    :data-dynamic-form-always-show="collapseManaged && schema.alwaysShow ? true : undefined"
    :label="hideLabel ? undefined : resolvedLabel"
    :name="formItemName"
    :rules="resolvedRules"
    :help="resolvedHelp"
    :extra="resolvedDescription"
  >
    <DynamicFormList v-if="isListField" :disabled="resolvedDisabled">
      <template #field="{ compact: childCompact, field, itemIndex, itemKey }">
        <FormField
          :base-path="[...fieldPath, itemIndex]"
          :collapse-managed="false"
          :compact="childCompact"
          :field-key="`${fieldKey}-${itemKey}-${pathToString(field.fieldName)}`"
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
import { useFormFieldControl } from '../composables/use-form-field-control';
import { useFormFieldSchema } from '../composables/use-form-field-schema';
import { pathToString } from '../utils/path';

import type { DynamicFormFieldSchema, FormData, FormPath } from '../types';

defineOptions({ name: 'FormField' });

const props = withDefaults(
  defineProps<{
    /** 当前字段完整配置。 */
    schema: DynamicFormFieldSchema<FormData>;
    /** 嵌套字段的父级数据路径。 */
    basePath?: FormPath;
    /** 用于 DOM 测量和折叠隐藏集合匹配的稳定 key。 */
    fieldKey: string;
    /** 是否因表单折叠而隐藏，不影响 schema.show/if。 */
    collapseHidden?: boolean;
    /** 是否参与顶层表单折叠行测量。 */
    collapseManaged?: boolean;
    /** 是否使用无外边距的紧凑样式。 */
    compact?: boolean;
    /** 是否隐藏字段标签，table 布局由表头展示 label。 */
    hideLabel?: boolean;
  }>(),
  {
    basePath: undefined,
    collapseHidden: false,
    collapseManaged: true,
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
  resolvedFieldProps,
  resolvedFormItemProps,
} = useFormFieldSchema(props);

const { FieldControl } = useFormFieldControl({
  schema: schemaRef,
  api: fieldApi,
  fieldProps: resolvedFieldProps,
});

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
