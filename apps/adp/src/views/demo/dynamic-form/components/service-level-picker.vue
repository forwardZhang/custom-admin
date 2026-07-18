<template>
  <div class="flex flex-wrap gap-2" role="radiogroup" aria-label="服务等级">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="rounded-md border px-3 py-1.5 text-sm transition-colors"
      :class="
        selected === option.value
          ? 'border-[var(--ant-color-primary)] bg-[var(--ant-color-primary-bg)] text-[var(--ant-color-primary)]'
          : 'border-[var(--ant-color-border)] text-[var(--ant-color-text-secondary)] hover:border-[var(--ant-color-primary)]'
      "
      :disabled="disabled"
      :aria-pressed="selected === option.value"
      @click="emit('update:selected', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
type ServiceLevel = 'standard' | 'priority' | 'dedicated';

defineProps<{
  selected?: ServiceLevel;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  'update:selected': [value: ServiceLevel];
}>();

const options: Array<{ label: string; value: ServiceLevel }> = [
  { label: '标准服务', value: 'standard' },
  { label: '优先服务', value: 'priority' },
  { label: '专属服务', value: 'dedicated' },
];
</script>
