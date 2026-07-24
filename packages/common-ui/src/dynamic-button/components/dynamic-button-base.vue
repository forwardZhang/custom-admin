<template>
  <Button
    v-bind="nativeButtonProps"
    :disabled="disabled"
    :html-type="buttonProps?.htmlType ?? 'button'"
    :loading="loading"
    @click="emit('click', $event)"
  >
    <!-- config.icon 使用独立插槽，优先于 Button props 中的 icon。 -->
    <template v-if="icon" #icon>
      <component :is="icon" />
    </template>

    <!-- 函数组件可以同时正确返回文本、VNode 或 VNode 数组。 -->
    <LabelContent />
  </Button>
</template>

<script setup lang="ts">
import type { ButtonProps } from 'antdv-next';
import type { Component, VNodeChild } from 'vue';

import { Button } from 'antdv-next';
import { computed } from 'vue';

defineOptions({ name: 'DynamicButtonBase' });

/** 纯展示层只接收已经解析好的按钮状态，不参与业务行为分发。 */
const props = defineProps<{
  /** 已解析的按钮文案。 */
  label: VNodeChild;
  /** config 中声明的图标组件。 */
  icon?: Component;
  /** 透传给 Antdv Button 的属性。 */
  buttonProps?: ButtonProps;
  /** 合并业务禁用和内部执行状态后的最终值。 */
  disabled: boolean;
  /** 合并外部 loading 和内部执行阶段后的最终值。 */
  loading: ButtonProps['loading'];
}>();

/** 基础按钮只向上抛出原始点击事件。 */
const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

/**
 * click、disabled、loading 由 DynamicButton 统一管理，不能再从 props 透传一次。
 * htmlType 单独读取是为了保留调用方配置，并提供安全的 button 默认值。
 */
const nativeButtonProps = computed(() => {
  const {
    onClick: _onClick,
    disabled: _disabled,
    loading: _loading,
    htmlType: _htmlType,
    ...nativeProps
  } = props.buttonProps ?? {};

  return nativeProps;
});

/** 通过闭包读取最新 label，避免模板将 VNode 转成字符串。 */
const LabelContent = () => props.label;
</script>
