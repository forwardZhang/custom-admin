import type { Ref, ShallowRef } from 'vue';

import { useResizeObserver } from '@vueuse/core';
import { nextTick, watch } from 'vue';

interface UseDynamicTableFillEffectOptions {
  /** 是否处于撑满模式。 */
  fill: Ref<boolean>;
  /** 组件根节点，其底边决定表格可用高度。 */
  rootRef: Readonly<ShallowRef<HTMLElement | null>>;
  /** 底层 Table 的根节点（.ant-table-wrapper）。 */
  getTableElement: () => HTMLElement | undefined;
  /** 量出的表体高度，写回 State 后作为官方 scroll.y 传给 Table。 */
  scrollY: Ref<number | undefined>;
}

/** 表体最小高度，容器过矮时也保证还能看到一两行。 */
const MIN_BODY_HEIGHT = 80;

/** 表体元素由底层 Table 渲染，这里只读它的高度，不改它的样式。 */
const TABLE_BODY_SELECTOR = '.ant-table-body';

/**
 * 撑满模式的 DOM 测量：把容器剩余高度换算成官方 scroll.y（像素）。
 *
 * 只依赖 Table 的公开 scroll API，不覆盖组件内部样式。
 * 首帧还没有表体时先按可用高度兜底，让 Table 进入固定表头结构，
 * ResizeObserver 随即拿到表头/分页高度并在同一帧内修正，之后保持收敛。
 */
export function useDynamicTableFillEffect({
  fill,
  rootRef,
  getTableElement,
  scrollY,
}: UseDynamicTableFillEffectOptions) {
  function measure(): void {
    const root = rootRef.value;
    const tableElement = getTableElement();
    if (!fill.value || !root || !tableElement) return;

    // 根节点底边到 Table 顶边的距离，已经扣掉工具栏与其间距。
    // getBoundingClientRect 拿的是边框盒，下内边距不属于表格可用高度：
    // 放大模式下根节点自带留白，不扣掉会把分页顶出可视区。
    const paddingBottom = Number.parseFloat(getComputedStyle(root).paddingBottom) || 0;
    const available =
      root.getBoundingClientRect().bottom -
      paddingBottom -
      tableElement.getBoundingClientRect().top;
    const bodyElement = tableElement.querySelector<HTMLElement>(TABLE_BODY_SELECTOR);
    // 表头、分页、横向滚动条等表体之外的高度；与 scroll.y 无关，因此测量能收敛。
    const chrome = bodyElement ? tableElement.offsetHeight - bodyElement.offsetHeight : 0;

    scrollY.value = Math.max(Math.round(available - chrome), MIN_BODY_HEIGHT);
  }

  // 容器高度变化（窗口缩放、搜索区展开收起）与表格自身高度变化（表头换行、分页出现）都要重算。
  useResizeObserver([rootRef, () => getTableElement() ?? null], measure);

  watch(
    fill,
    (value) => {
      if (!value) {
        scrollY.value = undefined;
        return;
      }
      void nextTick(measure);
    },
    { immediate: true },
  );
}
