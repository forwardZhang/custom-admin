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
    <Button
      v-if="showCollapseButton"
      type="link"
      html-type="button"
      @click="$emit('toggle-collapse')"
    >
      {{ collapsed ? '展开' : '收起' }}
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
    /** 当前是否处于折叠状态，用于切换按钮文案。 */
    collapsed?: boolean;
    /** 是否显示展开/收起按钮。 */
    showCollapseButton?: boolean;
    /** 提交按钮的文案、显隐和 Antdv Button 属性。 */
    submitButtonOptions?: DynamicFormButtonOptions;
    /** 重置按钮的文案、显隐和 Antdv Button 属性。 */
    resetButtonOptions?: DynamicFormButtonOptions;
  }>(),
  {
    collapsed: false,
    showCollapseButton: false,
    submitButtonOptions: undefined,
    resetButtonOptions: undefined,
  },
);

defineEmits<{
  submit: [];
  reset: [];
  'toggle-collapse': [];
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
