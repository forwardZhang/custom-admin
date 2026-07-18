<template>
  <FieldRequestWrapper :enabled="hasRequest" :loading="loading">
    <CheckboxGroup v-bind="requestFieldProps" v-model:value="modelValue">
      <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
        <slot :name="slotName" v-bind="slotProps ?? {}" />
      </template>
    </CheckboxGroup>
  </FieldRequestWrapper>
</template>

<script setup lang="ts">
import type { CheckboxGroupProps } from 'antdv-next';

import { toRef } from 'vue';
import { CheckboxGroup } from 'antdv-next';

import FieldRequestWrapper from '../../components/field-request-wrapper.vue';
import { useFormFieldRequest } from '../../composables/use-form-field-request';

defineOptions({ name: 'DynamicFormCheckbox', inheritAttrs: false });

const props = withDefaults(defineProps<{ fieldProps?: CheckboxGroupProps }>(), {
  fieldProps: () => ({}),
});
const modelValue = defineModel<CheckboxGroupProps['value']>();
const { hasRequest, loading, requestFieldProps } = useFormFieldRequest(
  toRef(() => props.fieldProps),
);
</script>
