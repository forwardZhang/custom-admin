<template>
  <FieldRequestWrapper :enabled="hasRequest" :loading="loading">
    <RadioGroup v-bind="requestFieldProps" v-model:value="modelValue">
      <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
        <slot :name="slotName" v-bind="slotProps ?? {}" />
      </template>
    </RadioGroup>
  </FieldRequestWrapper>
</template>

<script setup lang="ts">
import type { RadioGroupProps } from 'antdv-next';

import { toRef } from 'vue';
import { RadioGroup } from 'antdv-next';

import FieldRequestWrapper from '../../components/field-request-wrapper.vue';
import { useFormFieldRequest } from '../../composables/use-form-field-request';

defineOptions({ name: 'DynamicFormRadio', inheritAttrs: false });

const props = withDefaults(defineProps<{ fieldProps?: RadioGroupProps }>(), {
  fieldProps: () => ({}),
});
const modelValue = defineModel<RadioGroupProps['value']>();
const { hasRequest, loading, requestFieldProps } = useFormFieldRequest(
  toRef(() => props.fieldProps),
);
</script>
