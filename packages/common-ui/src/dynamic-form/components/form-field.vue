<template>
  <FormItem
    v-if="resolvedIf"
    v-show="resolvedShow && !collapseHidden"
    v-bind="resolvedFormItemProps"
    :class="['min-w-0', schema.itemClass]"
    :data-dynamic-form-field="fieldKey"
    :data-dynamic-form-always-show="schema.alwaysShow || undefined"
    :label="resolvedLabel"
    :name="formItemName"
    :rules="resolvedRules"
    :help="resolvedHelp"
    :extra="resolvedDescription"
  >
    <FieldControl />
  </FormItem>
</template>

<script setup lang="ts">
import type { Ref } from 'vue';

import { computed } from 'vue';
import { FormItem } from 'antdv-next';
import { get } from 'lodash-es';

import { provideDynamicFormFieldContext } from '../core/context';
import { useFormFieldControl } from '../composables/use-form-field-control';
import { useFormFieldSchema } from '../composables/use-form-field-schema';

import type { DynamicFormFieldSchema, FormData, FormPath, NormalizedFormPath } from '../types';

const props = withDefaults(
  defineProps<{
    schema: DynamicFormFieldSchema<FormData>;
    basePath?: FormPath;
    fieldKey: string;
    collapseHidden?: boolean;
  }>(),
  {
    basePath: undefined,
    collapseHidden: false,
  },
);

const {
  formApi,
  formData,
  schemaRef,
  fieldPath,
  formItemName,
  resolveContext,
  resolvedIf,
  resolvedShow,
  resolvedLabel,
  resolvedHelp,
  resolvedDescription,
  resolvedRules,
  resolvedFieldProps,
  resolvedFormItemProps,
} = useFormFieldSchema(props);

const { FieldControl } = useFormFieldControl({
  schema: schemaRef,
  formData,
  formApi,
  fieldPath,
  resolveContext,
  fieldProps: resolvedFieldProps,
});

provideDynamicFormFieldContext<FormData>({
  fieldPath: fieldPath as Readonly<Ref<NormalizedFormPath>>,
  value: computed(() => get(formData.value, fieldPath.value)),
  api: formApi,
  schema: schemaRef as Readonly<Ref<DynamicFormFieldSchema<FormData>>>,
  resolveContext,
});
</script>
