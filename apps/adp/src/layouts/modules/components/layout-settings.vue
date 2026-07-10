<template>
  <div class="layout-settings">
    <!-- 布局模式设置区域 -->
    <div class="settings-section">
      <div class="settings-heading">
        <h3>布局模式</h3>
        <p>布局切换会自动保存到本地；移动端固定使用垂直抽屉菜单。</p>
      </div>

      <div class="layout-options">
        <button
          v-for="item in LAYOUT_MODE_LIST"
          :key="item.key"
          class="layout-option"
          :class="{ 'is-active': item.key === appStore.preference.layout.mode }"
          type="button"
          @click="selectLayout({ mode: item.key })"
        >
          <div class="layout-preview-wrapper">
            <span class="layout-preview" :class="`is-${item.key}`">
              <!-- 垂直布局线框微缩图 -->
              <template v-if="item.key === 'vertical'">
                <i class="preview-sider" />
                <i class="preview-header" />
                <i class="preview-content" />
              </template>
              <!-- 顶部垂直/混合垂直线框微缩图 -->
              <template v-else-if="item.key === 'vertical-top'">
                <i class="preview-header" />
                <i class="preview-sider" />
                <i class="preview-content" />
              </template>
              <!-- 双列布局线框微缩图 -->
              <template v-else-if="item.key === 'two-column'">
                <i class="preview-sider" />
                <i class="preview-sider-sub" />
                <i class="preview-header" />
                <i class="preview-content" />
              </template>
              <!-- 顶部布局线框微缩图 -->
              <template v-else-if="item.key === 'top'">
                <i class="preview-header" />
                <i class="preview-content" />
              </template>
            </span>
          </div>
          <div class="layout-name">
            <span>{{ item.label }}</span>
            <a-tooltip :title="getLayoutDesc({ mode: item.key })">
              <QuestionCircleOutlined class="question-icon" />
            </a-tooltip>
          </div>
        </button>
      </div>
    </div>

    <!-- 视觉分割线 -->
    <a-divider class="settings-divider" />

    <!-- 系统主题色设置区域 -->
    <div class="settings-section">
      <div class="settings-heading">
        <h3>内置主题</h3>
        <p>选择系统主色调，系统所有核心组件和布局线框图都将应用该主题色。</p>
      </div>

      <div class="theme-options">
        <button
          v-for="color in themeColors"
          :key="color.value"
          class="theme-option"
          :class="{ 'is-active': appStore.preference.theme.colorPrimary === color.value }"
          :style="{ '--theme-color': color.value, '--theme-color-light': `${color.value}1e` }"
          type="button"
          @click="selectThemeColor({ colorPrimary: color.value })"
        >
          <div class="theme-card">
            <span class="theme-color-pill" />
          </div>
          <span class="theme-label">{{ color.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckOutlined, QuestionCircleOutlined } from '@antdv-next/icons';
import { useAppStore } from '@/store/modules/app';
import type { LayoutMode } from '@/constants/preference';
import { LAYOUT_MODE_LIST } from '@/layouts/constants';
import { themeColors } from '@/constants/preference';

const appStore = useAppStore();

/**
 * 切换布局模式并同步保存。
 * @param params 参数对象，包含所选的布局模式
 */
function selectLayout(params: { mode: LayoutMode }) {
  appStore.updatePreference({ layout: { mode: params.mode } });
}

/**
 * 切换全局系统主题色并同步保存。
 * @param params 参数对象，包含所选的主题十六进制颜色值
 */
function selectThemeColor(params: { colorPrimary: string }) {
  appStore.updatePreference({ theme: { colorPrimary: params.colorPrimary } });
}

/**
 * 获取布局模式的简短说明文案。
 * @param params 参数对象，包含布局模式键名
 * @returns 对应的描述字串
 */
function getLayoutDesc(params: { mode: LayoutMode }): string {
  switch (params.mode) {
    case 'vertical':
      return '垂直导航布局，侧边栏承载完整菜单。';
    case 'vertical-top':
      return '混合垂直布局，顶部展示一级导航，左侧展示子级菜单。';
    case 'two-column':
      return '双列菜单布局，最左侧承载一级菜单大图标，旁边为二级子菜单栏。';
    case 'top':
      return '水平导航布局，所有菜单均在顶部横向展开。';
    default:
      return '';
  }
}
</script>

<style scoped lang="scss">
.layout-settings {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-section {
  display: flex;
  flex-direction: column;
}

.settings-heading {
  margin-bottom: 16px;

  h3 {
    margin: 0 0 6px;
    color: var(--ant-color-text);
    font-weight: 600;
    font-size: 15px;
  }

  p {
    margin: 0;
    color: var(--ant-color-text-secondary);
    font-size: 12px;
    line-height: 1.5;
  }
}

.settings-divider {
  margin: 12px 0;
  border-color: var(--ant-color-border-secondary);
}

/* 布局网格排版（一排3列） */
.layout-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.layout-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
  outline: none;

  &:hover {
    .layout-preview-wrapper {
      border-color: var(--ant-color-primary);
      opacity: 0.95;
    }
  }

  &.is-active {
    .layout-preview-wrapper {
      border-color: var(--ant-color-primary);
      box-shadow: 0 0 0 2px var(--ant-color-primary-light-1);
    }
  }
}

.layout-preview-wrapper {
  position: relative;
  width: 100%;
  padding: 2px;
  border: 2px solid transparent;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.layout-preview {
  position: relative;
  display: block;
  width: 100%;
  height: 56px;
  overflow: hidden;
  border: 1px solid var(--ant-color-border-secondary);
  border-radius: 5px;
  background: #f8fafc; /* 自定义高级淡灰底色 */

  i {
    position: absolute;
    display: block;
    box-sizing: border-box;
    transition: all 0.2s ease;
  }
}

/* 核心指示块背景色自适应全局系统主色 */
.preview-sider,
.preview-sider-primary,
.preview-header-primary {
  background-color: var(--ant-color-primary);
}

/* 各组件块细节定位与样式 */
.preview-header {
  top: 0;
  right: 0;
  height: 10px;
  background: #ffffff;
  border-bottom: 1px solid var(--ant-color-border-secondary);
}

.preview-sider {
  left: 0;
  bottom: 0;
  background: var(--ant-color-primary);
}

.preview-sider-sub {
  bottom: 0;
  background: #ffffff;
  border-right: 1px solid var(--ant-color-border-secondary);
}

.preview-content {
  right: 4px;
  bottom: 4px;
  border: 1px solid var(--ant-color-border-secondary);
  border-radius: 2px;
  background: #ffffff;

  &::after {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    background:
      linear-gradient(to right, #f1f5f9 60%, transparent 60%),
      linear-gradient(to right, transparent 65%, #f1f5f9 65%);
    background-size: 100% 4px;
    background-repeat: no-repeat;
    background-position: 0 4px;
  }
}

/* 1. 垂直布局 (vertical) */
.is-vertical:not(.is-vertical-top) {
  .preview-sider {
    top: 0;
    width: 20%;
    border-radius: 4px 0 0 4px;

    /* 最上面的白色方块代表 Logo */
    &::before {
      content: '';
      position: absolute;
      top: 8%;
      left: 20%;
      width: 60%;
      height: 18%;
      background: #ffffff;
      border-radius: 1px;
    }

    /* 内部白细条模拟二级菜单 */
    &::after {
      content: '';
      position: absolute;
      top: 32%;
      left: 20%;
      width: 60%;
      height: 50%;
      background: repeating-linear-gradient(
        to bottom,
        #ffffff,
        #ffffff 1.5px,
        transparent 1.5px,
        transparent 5px
      );
    }
  }

  .preview-header {
    left: 20%;
    width: 80%;

    /* 右侧头部工具栏小点 */
    &::after {
      content: '';
      position: absolute;
      top: 25%;
      right: 8%;
      width: 25%;
      height: 50%;
      background: repeating-linear-gradient(
        to right,
        #cbd5e1,
        #cbd5e1 3px,
        transparent 3px,
        transparent 7px
      );
    }
  }

  .preview-content {
    top: 14px;
    left: 24%;
  }
}

/* 2. 双列菜单布局 (two-column) */
.is-two-column {
  .preview-sider {
    /* 第一主列 (深色) */
    top: 0;
    width: 12%;
    border-radius: 4px 0 0 4px;

    &::before {
      content: '';
      position: absolute;
      top: 8%;
      left: 25%;
      width: 50%;
      height: 10%;
      background: #ffffff;
      border-radius: 50%;
    }

    &::after {
      content: '';
      position: absolute;
      top: 24%;
      left: 25%;
      width: 50%;
      height: 60%;
      background: repeating-linear-gradient(
        to bottom,
        #ffffff,
        #ffffff 1.5px,
        transparent 1.5px,
        transparent 5px
      );
    }
  }

  .preview-sider-sub {
    /* 第二辅列 (白色带点线) */
    top: 0;
    left: 12%;
    width: 16%;

    &::after {
      content: '';
      position: absolute;
      top: 15%;
      left: 20%;
      width: 60%;
      height: 70%;
      background: repeating-linear-gradient(
        to bottom,
        #cbd5e1,
        #cbd5e1 1.5px,
        transparent 1.5px,
        transparent 5px
      );
    }
  }

  .preview-header {
    left: 28%;
    width: 72%;

    &::after {
      content: '';
      position: absolute;
      top: 25%;
      right: 8%;
      width: 25%;
      height: 50%;
      background: repeating-linear-gradient(
        to right,
        #cbd5e1,
        #cbd5e1 3px,
        transparent 3px,
        transparent 7px
      );
    }
  }

  .preview-content {
    top: 14px;
    left: 32%;
  }
}

/* 3. 水平布局 (top) */
.is-top {
  .preview-header {
    left: 0;
    width: 100%;
    background: var(--ant-color-primary);
    border-bottom: 0;

    /* 最左边 Logo */
    &::before {
      content: '';
      position: absolute;
      top: 20%;
      left: 4%;
      width: 8%;
      height: 60%;
      background: #ffffff;
      border-radius: 1px;
    }

    /* 内部白色细块模拟顶部横向菜单 */
    &::after {
      content: '';
      position: absolute;
      top: 30%;
      left: 16%;
      width: 45%;
      height: 40%;
      background: repeating-linear-gradient(
        to right,
        #ffffff,
        #ffffff 6px,
        transparent 6px,
        transparent 11px
      );
      opacity: 0.85;
    }
  }

  .preview-content {
    top: 14px;
    left: 4px;
  }
}

/* 4. 混合垂直布局 (vertical-top) - 左白边，右顶蓝（左右结构，双列少一列） */
.is-vertical-top {
  .preview-header {
    left: 20%;
    width: 80%;
    z-index: 2;
    background: var(--ant-color-primary);
    border-bottom: 0;

    /* 内部白色细块模拟顶部横向菜单 */
    &::after {
      content: '';
      position: absolute;
      top: 30%;
      left: 8%;
      width: 45%;
      height: 40%;
      background: repeating-linear-gradient(
        to right,
        #ffffff,
        #ffffff 4px,
        transparent 4px,
        transparent 9px
      );
      opacity: 0.85;
    }
  }

  .preview-sider {
    /* 左侧侧边栏高 100% (白色带二级线) */
    top: 0;
    width: 20%;
    height: 100%;
    background: #ffffff;
    border-right: 1px solid var(--ant-color-border-secondary);
    border-radius: 4px 0 0 4px;

    &::after {
      content: '';
      position: absolute;
      top: 15%;
      left: 20%;
      width: 60%;
      height: 70%;
      background: repeating-linear-gradient(
        to bottom,
        #cbd5e1,
        #cbd5e1 1.5px,
        transparent 1.5px,
        transparent 5px
      );
    }
  }

  .preview-content {
    top: 14px;
    left: 24%;
  }
}

/* 底部标签与描述样式 */
.layout-name {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 8px;
  color: var(--ant-color-text);
  font-size: 12px;

  .question-icon {
    color: var(--ant-color-text-quaternary);
    font-size: 12px;
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: var(--ant-color-primary);
    }
  }
}

/* 主题颜色卡片网格面板（一排3列） */
.theme-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 4px;
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
  outline: none;

  &:hover {
    .theme-card {
      border-color: var(--theme-color);
      opacity: 0.9;
    }
  }

  &.is-active {
    .theme-card {
      border-color: var(--theme-color);
      box-shadow: 0 0 0 2px var(--theme-color-light);
    }

    .theme-color-pill {
      box-shadow: 0 0 0 4px var(--theme-color-light);
    }
  }
}

.theme-card {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 42px;
  border: 1px solid var(--ant-color-border-secondary);
  border-radius: 6px;
  background: #ffffff;
  transition: all 0.2s ease;
}

.theme-color-pill {
  display: block;
  width: 24px;
  height: 15px;
  border-radius: 4px;
  background-color: var(--theme-color);
  transition: all 0.2s ease;
}

.theme-label {
  display: block;
  margin-top: 6px;
  color: var(--ant-color-text-secondary);
  font-size: 12px;
  text-align: center;
}
</style>
