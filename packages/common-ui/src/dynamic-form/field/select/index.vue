<template>
  <FieldRequestWrapper :enabled="hasRequest" :loading="loading">
    <Select v-model:value="modelValue" allow-clear show-search v-bind="requestFieldProps">
      <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
        <slot :name="slotName" v-bind="slotProps ?? {}" />
      </template>
    </Select>
  </FieldRequestWrapper>
</template>

<script setup lang="ts">
import type { SelectProps } from 'antdv-next';

import { toRef } from 'vue';
import { Select } from 'antdv-next';

import FieldRequestWrapper from '../../components/field-request-wrapper.vue';
import { useFormFieldRequest } from '../../composables/use-form-field-request';

defineOptions({ name: 'DynamicFormSelect', inheritAttrs: false });

const props = withDefaults(defineProps<{ fieldProps?: SelectProps }>(), {
  fieldProps: () => ({}),
});

const modelValue = defineModel<SelectProps['value']>();
const { hasRequest, loading, requestFieldProps } = useFormFieldRequest(
  toRef(() => props.fieldProps),
);
</script>
