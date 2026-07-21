<template>
  <div class="dynamic-table-toolbar" :class="toolbarClass">
    <template v-if="batchMode">
      <div class="dynamic-table-toolbar__batch">
        <span class="dynamic-table-toolbar__selected">已选 {{ selectedRowKeys.length }} 条</span>
        <div class="dynamic-table-toolbar__batch-actions">
          <slot
            name="toolbar-batch"
            :selected-row-keys="selectedRowKeys"
            :selected-rows="selectedRows"
            :clear-selection="clearSelection"
            :reload="reload"
          />
        </div>
        <Tooltip title="取消选择">
          <Button
            class="dynamic-table-toolbar__clear"
            type="text"
            size="small"
            aria-label="取消选择"
            @click="clearSelection"
          >
            <CloseOutlined />
          </Button>
        </Tooltip>
      </div>
    </template>

    <template v-else>
      <div class="dynamic-table-toolbar__left">
        <div v-if="title || $slots.title" class="dynamic-table-toolbar__title">
          <slot name="title">{{ title }}</slot>
        </div>
        <slot name="toolbar-left" />
      </div>

      <div class="dynamic-table-toolbar__right">
        <slot name="toolbar-right" />
        <Tooltip v-if="showRefresh" title="刷新">
          <Button
            class="dynamic-table-toolbar__action"
            type="text"
            size="small"
            aria-label="刷新"
            :loading="loading"
            @click="emit('refresh')"
          >
            <ReloadOutlined />
          </Button>
        </Tooltip>
        <Tooltip v-if="showFullscreen" :title="fullscreen ? '退出放大' : '放大'">
          <Button
            class="dynamic-table-toolbar__action"
            type="text"
            size="small"
            :aria-label="fullscreen ? '退出放大' : '放大'"
            @click="emit('toggle-fullscreen')"
          >
            <FullscreenExitOutlined v-if="fullscreen" />
            <FullscreenOutlined v-else />
          </Button>
        </Tooltip>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts" generic="TRecord extends object = Record<string, unknown>">
import { Button, Tooltip } from 'antdv-next';
import {
  CloseOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  ReloadOutlined,
} from '@antdv-next/icons';

import type { DynamicTableKey, DynamicTableReloadOptions } from '../types';

defineOptions({ name: 'DynamicTableToolbar' });

// 工具栏同时服务普通模式和批量选择模式，selectedRows/clearSelection/reload 会传给批量插槽。
withDefaults(
  defineProps<{
    batchMode: boolean;
    fullscreen: boolean;
    loading: boolean;
    selectedRowKeys: DynamicTableKey[];
    selectedRows: TRecord[];
    title?: string;
    showFullscreen: boolean;
    showRefresh: boolean;
    toolbarClass?: string;
    clearSelection: () => void;
    reload: (options?: DynamicTableReloadOptions) => Promise<void>;
  }>(),
  {
    toolbarClass: undefined,
    title: undefined,
  },
);

const emit = defineEmits<{
  refresh: [];
  'toggle-fullscreen': [];
}>();
</script>

<style scoped>
.dynamic-table-toolbar {
  display: flex;
  min-height: 44px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 2px 14px;
}

.dynamic-table-toolbar__left,
.dynamic-table-toolbar__right,
.dynamic-table-toolbar__batch,
.dynamic-table-toolbar__batch-actions {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.dynamic-table-toolbar__left {
  flex: 1;
  flex-wrap: wrap;
}

.dynamic-table-toolbar__title {
  min-width: 0;
  flex-shrink: 0;
  color: var(--ant-color-text);
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.dynamic-table-toolbar__right {
  flex-shrink: 0;
  gap: 6px;
}

.dynamic-table-toolbar__batch {
  min-height: 42px;
  width: 100%;
  padding: 7px 10px 7px 14px;
  border: 1px solid var(--ant-color-primary-border);
  border-radius: 6px;
  background: var(--ant-color-primary-bg);
}

.dynamic-table-toolbar__batch-actions {
  flex-wrap: wrap;
}

.dynamic-table-toolbar__selected {
  color: var(--ant-color-primary-text);
  font-size: 13px;
  font-weight: 500;
}

.dynamic-table-toolbar__clear.ant-btn {
  display: inline-flex;
  width: 26px;
  min-width: 26px;
  height: 26px;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: var(--ant-color-primary-text);
  margin-left: auto;
}

.dynamic-table-toolbar__clear.ant-btn:hover {
  color: var(--ant-color-primary);
}

.dynamic-table-toolbar__action.ant-btn {
  display: inline-flex;
  width: 32px;
  min-width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid var(--ant-color-border-secondary);
  border-radius: 6px;
  background: var(--ant-color-fill-quaternary);
  color: var(--ant-color-text-secondary);
  transition:
    color 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease;
}

.dynamic-table-toolbar__action.ant-btn:hover {
  border-color: var(--ant-color-primary-border);
  background: var(--ant-color-primary-bg);
  color: var(--ant-color-primary);
}

@media (max-width: 640px) {
  .dynamic-table-toolbar {
    gap: 10px;
  }

  .dynamic-table-toolbar__left {
    flex: 1;
  }

  .dynamic-table-toolbar__batch {
    flex-wrap: wrap;
  }
}
</style>
