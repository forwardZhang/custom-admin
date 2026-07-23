<template>
  <div class="flex flex-wrap items-center gap-2 pt-1">
    <Button
      v-if="showResetButton"
      v-bind="resetButtonProps"
      html-type="button"
      @click="$emit('reset')"
    >
      {{ resetButtonOptions?.content ?? '重置' }}
    </Button>
    <Button
      v-if="showSubmitButton"
      v-bind="submitButtonProps"
      html-type="button"
      type="primary"
      @click="$emit('submit')"
    >
      {{ submitButtonOptions?.content ?? '提交' }}
    </Button>
  </div>
</template>

<script setup lang="ts">
import type { DynamicFormButtonOptions } from '../types';

import { computed } from 'vue';
import { Button } from 'antdv-next';
import { omit } from 'lodash-es';

const props = withDefaults(
  defineProps<{
    /** 提交按钮的文案、显隐和 Antdv Button 属性。 */
    submitButtonOptions?: DynamicFormButtonOptions;
    /** 重置按钮的文案、显隐和 Antdv Button 属性。 */
    resetButtonOptions?: DynamicFormButtonOptions;
  }>(),
  {
    submitButtonOptions: undefined,
    resetButtonOptions: undefined,
  },
);

defineEmits<{
  submit: [];
  reset: [];
}>();

const showSubmitButton = computed(() => props.submitButtonOptions?.show !== false);
const showResetButton = computed(() => props.resetButtonOptions?.show !== false);
const submitButtonProps = computed(() =>
  omit(props.submitButtonOptions ?? {}, ['content', 'show', 'type', 'htmlType']),
);
const resetButtonProps = computed(() =>
  omit(props.resetButtonOptions ?? {}, ['content', 'show', 'type', 'htmlType']),
);
</script>
