import type { ButtonProps, ModalProps } from 'antdv-next';
import type { Component, VNode, VNodeChild } from 'vue';

import { Button } from 'antdv-next';
import { h } from 'vue';

/** render function 创建底部按钮时需要的稳定配置。 */
export interface DynamicButtonFooterOptions {
  /** 确定按钮文案。 */
  okText?: ModalProps['okText'];
  /** 取消按钮文案。 */
  cancelText?: ModalProps['cancelText'];
  /** 调用方配置的确定按钮属性。 */
  okButtonProps?: ButtonProps;
  /** 调用方配置的取消按钮属性。 */
  cancelButtonProps?: ButtonProps;
  /** 渲染在取消和确定按钮前的自定义内容。 */
  extra?: VNodeChild;
  /** 校验和提交阶段的 loading。 */
  submitLoading: boolean;
  /** 异步取消阶段的 loading。 */
  cancelLoading: boolean;
  /** 点击确定按钮。 */
  onSubmit: () => void;
  /** 点击取消按钮。 */
  onCancel: () => void;
}

/**
 * 使用 render function 创建 Modal/Drawer 共用 footer。
 * 内部 loading 和 disabled 最后覆盖，防止用户 props 绕过并发保护。
 */
export function renderDynamicButtonFooter(options: DynamicButtonFooterOptions): VNode {
  return h(
    'div',
    {
      class: 'dynamic-button-layer-footer flex items-center justify-end gap-2',
    },
    [
      options.extra,
      h(
        Button as Component,
        {
          ...options.cancelButtonProps,
          disabled: options.submitLoading,
          loading: options.cancelLoading,
          onClick: options.onCancel,
        },
        { default: () => resolveFooterContent(options.cancelText) },
      ),
      h(
        Button as Component,
        {
          type: 'primary',
          ...options.okButtonProps,
          disabled: options.cancelLoading,
          loading: options.submitLoading,
          onClick: options.onSubmit,
        },
        { default: () => resolveFooterContent(options.okText) },
      ),
    ],
  );
}

/** Antdv 文案可以是 VNode，也可以是返回 VNode 的函数。 */
function resolveFooterContent(content: ModalProps['okText']): VNodeChild {
  return typeof content === 'function' ? content() : content;
}
