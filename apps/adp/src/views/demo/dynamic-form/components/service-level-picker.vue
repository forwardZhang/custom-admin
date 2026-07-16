<template>
  <div class="service-level-picker">
    <Segmented v-model:value="selected" :options="options" :disabled="disabled" block />
    <p class="service-level-picker__description">
      {{ descriptions[selected] }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { Segmented } from 'antdv-next';

type ServiceLevel = 'standard' | 'priority' | 'dedicated';

withDefaults(
  defineProps<{
    disabled?: boolean;
  }>(),
  {
    disabled: false,
  },
);

const selected = defineModel<ServiceLevel>('selected', { required: true });

const options: Array<{ label: string; value: ServiceLevel }> = [
  { label: '标准支持', value: 'standard' },
  { label: '优先响应', value: 'priority' },
  { label: '专属顾问', value: 'dedicated' },
];

const descriptions: Record<ServiceLevel, string> = {
  standard: '工作日在线支持，适合常规业务咨询。',
  priority: '优先进入服务队列，适合高频业务协作。',
  dedicated: '由固定顾问跟进，适合复杂项目和长期服务。',
};
</script>

<style scoped>
.service-level-picker {
  width: 100%;
}

.service-level-picker__description {
  min-height: 22px;
  margin: 6px 0 0;
  color: var(--ant-color-text-secondary);
  font-size: 12px;
  line-height: 1.5;
}
</style>
