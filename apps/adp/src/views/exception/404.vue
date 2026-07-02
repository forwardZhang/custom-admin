<script setup lang="ts">
import ExceptionBase from '@/components/exception/exception-base.vue';

defineOptions({ name: 'NotFound' });
</script>

<template>
  <ExceptionBase type="404" />
</template>
