<script setup lang="ts">
import ExceptionBase from '@/components/exception/exception-base.vue';

defineOptions({ name: 'Forbidden' });
</script>

<template>
  <ExceptionBase type="403" />
</template>
