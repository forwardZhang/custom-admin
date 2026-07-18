<template>
  <FieldRequestWrapper :enabled="hasRequest" :loading="loading">
    <TreeSelect v-bind="requestFieldProps" v-model:value="modelValue" class="w-full">
      <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
        <slot :name="slotName" v-bind="slotProps ?? {}" />
      </template>
    </TreeSelect>
  </FieldRequestWrapper>
</template>

<script setup lang="ts">
import type { TreeSelectProps } from 'antdv-next';

import { toRef } from 'vue';
import { TreeSelect } from 'antdv-next';

import FieldRequestWrapper from '../../components/field-request-wrapper.vue';
import { useFormFieldRequest } from '../../composables/use-form-field-request';

defineOptions({ name: 'DynamicFormTreeSelect', inheritAttrs: false });

const props = withDefaults(defineProps<{ fieldProps?: TreeSelectProps }>(), {
  fieldProps: () => ({}),
});
const modelValue = defineModel<TreeSelectProps['value']>();
const { hasRequest, loading, requestFieldProps } = useFormFieldRequest(
  toRef(() => props.fieldProps),
);
</script>
