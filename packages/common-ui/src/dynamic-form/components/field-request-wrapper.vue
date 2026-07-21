<template>
  <Spin v-if="enabled" :delay="160" :spinning="loading" :classes="{ root: 'w-full' }" size="small">
    <slot />
  </Spin>
  <slot v-else />
</template>

<script setup lang="ts">
import { Spin } from 'antdv-next';

defineOptions({ name: 'DynamicFormFieldRequestWrapper' });

defineProps<{
  /** 字段是否配置远程选项请求；未配置时不渲染 Spin 包装层。 */
  enabled: boolean;
  /** 当前远程选项请求是否进行中。 */
  loading: boolean;
}>();
</script>
