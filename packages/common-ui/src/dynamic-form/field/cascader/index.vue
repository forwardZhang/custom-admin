<template>
  <FieldRequestWrapper :enabled="hasRequest" :loading="loading">
    <Cascader v-bind="requestFieldProps" v-model:value="modelValue">
      <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
        <slot :name="slotName" v-bind="slotProps ?? {}" />
      </template>
    </Cascader>
  </FieldRequestWrapper>
</template>

<script setup lang="ts">
import type { CascaderProps } from 'antdv-next';

import { toRef } from 'vue';
import { Cascader } from 'antdv-next';

import FieldRequestWrapper from '../../components/field-request-wrapper.vue';
import { useFormFieldRequest } from '../../composables/use-form-field-request';

defineOptions({ name: 'DynamicFormCascader', inheritAttrs: false });

const props = withDefaults(defineProps<{ fieldProps?: CascaderProps }>(), {
  fieldProps: () => ({}),
});
const modelValue = defineModel<CascaderProps['value']>();
const { hasRequest, loading, requestFieldProps } = useFormFieldRequest(
  toRef(() => props.fieldProps),
);
</script>
