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
  enabled: boolean;
  loading: boolean;
}>();
</script>
