<template>
  <!-- Confirm 使用受控 Popconfirm；业务提交和取消分别管理自己的 loading。 -->
  <Popconfirm
    v-if="isConfirm"
    v-bind="confirmProps"
    :open="confirmOpened"
    @cancel="cancelConfirm('cancel-button')"
    @confirm="submitConfirm"
    @open-change="handleConfirmOpenChange"
  >
    <DynamicButtonBase
      :button-props="props.config.props"
      :disabled="disabled"
      :icon="props.config.icon"
      :label="label"
      :loading="loading"
      @click="handleClick"
    />
  </Popconfirm>

  <!-- click、modal、drawer 共用同一个基础按钮入口。 -->
  <DynamicButtonBase
    v-else
    :button-props="props.config.props"
    :disabled="disabled"
    :icon="props.config.icon"
    :label="label"
    :loading="loading"
    @click="handleClick"
  />

  <!--
    Modal/Drawer 组件由 hooks 创建，但通过 component :is 留在当前组件树。
    因此主题、locale 和 inject 自动继承，不需要独立挂载或手动复制 context。
  -->
  <component :is="layerComponent" v-if="layerMounted && layerComponent" />
</template>

<script setup lang="ts">
import { Popconfirm } from 'antdv-next';

import DynamicButtonBase from './dynamic-button-base.vue';
import { useDynamicButton } from '../composables/use-dynamic-button';

import type { DynamicButtonEmits, DynamicButtonProps } from '../types';

defineOptions({ name: 'DynamicButton' });

/** DynamicButton 只接收配置和当前业务数据，不使用 SFC 泛型。 */
const props = defineProps<DynamicButtonProps>();

/** 对外事件均携带当前 record 和明确的行为阶段。 */
const emit = defineEmits<DynamicButtonEmits>();

/** composable 负责行为分发，SFC 只拼装基础按钮、确认框和树内弹层组件。 */
const {
  label,
  disabled,
  loading,
  isConfirm,
  confirmOpened,
  confirmProps,
  layerMounted,
  layerComponent,
  handleClick,
  handleConfirmOpenChange,
  submitConfirm,
  cancelConfirm,
} = useDynamicButton(props, emit);
</script>
