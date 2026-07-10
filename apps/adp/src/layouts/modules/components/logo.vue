<template>
  <div class="logo-wrap" :class="{ 'logo-collapsed': collapsed }">
    <div class="logo-content">
      <!-- 渐变背景与悬浮微交互的 Logo 容器 -->
      <div class="logo-avatar-box">
        <a-avatar :size="avatarSize" :src="logoSrc" class="logo-avatar">
          <template #icon>
            <AntDesignOutlined class="logo-default-icon" />
          </template>
        </a-avatar>
      </div>
      <!-- 带平滑进入与滑动效果的系统标题 -->
      <transition name="fade-slide">
        <span v-if="!collapsed" class="logo-title" :style="{ color: titleColor }">
          {{ displayTitle }}
        </span>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { AntDesignOutlined } from '@antdv-next/icons';
import { APP_TITLE } from '@/constants';

interface Props {
  /** 是否折叠，折叠时隐藏文字标题 */
  collapsed?: boolean;
  /** Logo 图像路径 */
  logoSrc?: string;
  /** 系统名称标题 */
  title?: string;
  /** 标志头像尺寸 */
  avatarSize?: number;
  /** 标题颜色 */
  titleColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
  logoSrc: '',
  title: '',
  avatarSize: 36,
  titleColor: 'var(--ant-color-text-heading)',
});

const displayTitle = computed(() => props.title || APP_TITLE);
</script>

<style scoped lang="scss">
.logo-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  height: var(--ant-layout-header-height);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);

  &.logo-collapsed {
    padding: 0;
    .logo-content {
      justify-content: center;
    }
  }
}

.logo-content {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  gap: 12px;
  transition: all 0.3s;
  justify-content: center;
}

.logo-avatar-box {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .logo-avatar {
    background: var(--ant-color-primary);
    box-shadow: 0 2px 8px var(--ant-color-primary-bg);
    transition: transform 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      transform: scale(1.5) rotate(30deg);
    }
  }

  .logo-default-icon {
    font-size: 20px;
    color: #fff;
  }
}

.logo-title {
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  letter-spacing: 0.5px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 渐入与滑动动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.645, 0.045, 0.355, 1);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
