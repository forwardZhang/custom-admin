import type { ButtonProps, DrawerProps, ModalProps, PopconfirmProps } from 'antdv-next';
import type { Component, VNodeChild } from 'vue';

/** 同时兼容同步返回值和 Promise 返回值。 */
export type Awaitable<T> = T | Promise<T>;

/** 列表行或调用方传入的其他业务数据。 */
export type DynamicButtonRecord = Record<string, unknown>;

/** 默认值、表单值或其他自定义数据。 */
export type DynamicButtonValue = unknown;

/** DynamicButton 支持的行为类型。 */
export type DynamicButtonType = 'click' | 'confirm' | 'modal' | 'drawer';

/** DynamicButton 当前可能执行的异步步骤。 */
export type DynamicButtonPhase = 'load-default' | 'validate' | 'submit' | 'cancel';

/** 用户关闭确认框或弹层的来源。 */
export type DynamicButtonCancelReason =
  | 'cancel-button'
  | 'close-icon'
  | 'mask'
  | 'keyboard'
  | 'outside';

/** label 和 disabled 动态函数收到的对象参数。 */
export interface DynamicButtonRecordContext {
  /** 当前列表行或其他业务数据。 */
  record: DynamicButtonRecord | undefined;
}

/** getDefaultValue 执行时收到的参数。 */
export interface DynamicButtonLoadContext extends DynamicButtonRecordContext {
  /** 最初点击 DynamicButton 时的鼠标事件。 */
  event: MouseEvent;
}

/** 用户触发提交行为时的完整参数。 */
export interface DynamicButtonActionContext extends DynamicButtonLoadContext {
  /** getDefaultValue 或内容组件产生的数据。 */
  value: DynamicButtonValue;
}

/** 取消 Modal、Drawer 或 Confirm 时的参数。 */
export interface DynamicButtonCancelContext extends DynamicButtonActionContext {
  /** 触发取消的具体入口。 */
  reason: DynamicButtonCancelReason;
}

/** 点击后直接执行业务方法。 */
export interface DynamicButtonClickRender {
  /** 直接执行点击行为。 */
  type: 'click';
  /** 提交前获取自定义数据。 */
  getDefaultValue?: (context: DynamicButtonLoadContext) => Awaitable<DynamicButtonValue>;
  /** 执行最终业务提交。 */
  submit: (context: DynamicButtonActionContext) => Awaitable<void>;
}

/** 使用 Popconfirm 进行二次确认。 */
export interface DynamicButtonConfirmRender {
  /** 打开二次确认气泡。 */
  type: 'confirm';
  /** Popconfirm 原生配置；打开状态和行为事件由 DynamicButton 接管。 */
  props?: Omit<
    PopconfirmProps,
    | 'open'
    | 'defaultOpen'
    | 'disabled'
    | 'onOpenChange'
    | 'onUpdate:open'
    | 'onConfirm'
    | 'onCancel'
  >;
  /** 打开确认框前获取自定义数据。 */
  getDefaultValue?: (context: DynamicButtonLoadContext) => Awaitable<DynamicButtonValue>;
  /** 点击确认按钮后执行。 */
  submit: (context: DynamicButtonActionContext) => Awaitable<void>;
  /** 点击取消或关闭确认框后执行。 */
  cancel?: (context: DynamicButtonCancelContext) => Awaitable<void>;
}

/** Modal 中由 DynamicButton 接管、调用方不能覆盖的字段。 */
type DynamicButtonControlledModalProp =
  | 'open'
  | 'confirmLoading'
  | 'destroyOnHidden'
  | 'onOk'
  | 'onCancel'
  | 'afterOpenChange';

/** DynamicButton 允许配置的 Modal 原生属性。 */
export type DynamicButtonModalProps = Omit<ModalProps, DynamicButtonControlledModalProp>;

/** Drawer 底部操作区由 DynamicButton 补充的属性。 */
export interface DynamicButtonDrawerFooterProps {
  /** 确定按钮文案，默认为“确定”。 */
  okText?: ModalProps['okText'];
  /** 取消按钮文案，默认为“取消”。 */
  cancelText?: ModalProps['cancelText'];
  /** 确定按钮原生属性。 */
  okButtonProps?: ButtonProps;
  /** 取消按钮原生属性。 */
  cancelButtonProps?: ButtonProps;
}

/** Drawer 中由 DynamicButton 接管、调用方不能覆盖的字段。 */
type DynamicButtonControlledDrawerProp =
  | 'open'
  | 'destroyOnHidden'
  | 'onClose'
  | 'afterOpenChange'
  | 'footer';

/** DynamicButton 允许配置的 Drawer 属性和底部按钮属性。 */
export type DynamicButtonDrawerProps = Omit<DrawerProps, DynamicButtonControlledDrawerProp> &
  DynamicButtonDrawerFooterProps;

/** Modal 和 Drawer 共同使用的内容及行为配置。 */
export interface DynamicButtonLayerCommon {
  /** 弹层中渲染的业务组件。 */
  component: Component;
  /** 额外传给业务组件的属性；函数形式可读取当前 record 和默认 value。 */
  componentProps?:
    | Record<string, unknown>
    | ((context: DynamicButtonActionContext) => Record<string, unknown>);
  /** 打开弹层前获取初始值。 */
  getDefaultValue?: (context: DynamicButtonLoadContext) => Awaitable<DynamicButtonValue>;
  /** 内容组件校验通过后执行提交。 */
  submit: (context: DynamicButtonActionContext) => Awaitable<void>;
  /** 用户主动关闭弹层时执行。 */
  cancel?: (context: DynamicButtonCancelContext) => Awaitable<void>;
}

/** Modal 和 Drawer 共用一个公共类型，同时保留各自 props 的类型收窄。 */
export type DynamicButtonLayerRender = DynamicButtonLayerCommon &
  (
    | {
        /** 使用 Modal 作为内容容器。 */
        type: 'modal';
        /** Modal 原生属性。 */
        props?: DynamicButtonModalProps;
      }
    | {
        /** 使用 Drawer 作为内容容器。 */
        type: 'drawer';
        /** Drawer 原生属性和底部按钮属性。 */
        props?: DynamicButtonDrawerProps;
      }
  );

/** DynamicButton 支持的全部行为。 */
export type DynamicButtonRender =
  | DynamicButtonClickRender
  | DynamicButtonConfirmRender
  | DynamicButtonLayerRender;

/** 按钮完整配置。 */
export interface DynamicButtonConfig {
  /** 按钮文案；函数形式使用对象参数，方便以后扩展上下文字段。 */
  label: VNodeChild | ((context: DynamicButtonRecordContext) => VNodeChild);
  /** 按钮图标组件，例如 EditOutlined。 */
  icon?: Component;
  /** 是否禁用按钮；函数形式可以根据当前 record 动态计算。 */
  disabled?: boolean | ((context: DynamicButtonRecordContext) => boolean);
  /** 透传给 Antdv Button 的原生属性。 */
  props?: ButtonProps;
  /** 按钮点击后的具体行为。 */
  render: DynamicButtonRender;
}

/** DynamicButton 对外只开放 config 和 record 两个属性。 */
export interface DynamicButtonProps {
  /** 按钮外观和行为配置。 */
  config: DynamicButtonConfig;
  /** 当前列表行或其他业务上下文数据。 */
  record?: DynamicButtonRecord;
}

/** 弹层内容组件可以按需暴露的校验能力。 */
export interface DynamicButtonContentExpose {
  /** 校验当前内容；返回新值时会替换当前 v-model 值。 */
  validate?: () => Awaitable<DynamicButtonValue | void>;
}

/** DynamicButton 成功事件的扁平参数。 */
export interface DynamicButtonSuccessPayload extends DynamicButtonActionContext {
  /** 本次成功的行为类型。 */
  type: DynamicButtonType;
}

/** DynamicButton 错误事件的扁平参数。 */
export interface DynamicButtonErrorPayload extends DynamicButtonActionContext {
  /** 发生错误的行为类型。 */
  type: DynamicButtonType;
  /** 发生错误的具体执行阶段。 */
  phase: DynamicButtonPhase;
  /** 原始异常对象。 */
  error: unknown;
}

/** DynamicButton 取消事件的扁平参数。 */
export interface DynamicButtonCancelPayload extends DynamicButtonCancelContext {
  /** 被取消的行为类型。 */
  type: Exclude<DynamicButtonType, 'click'>;
}

/** DynamicButton loading 变化事件的参数。 */
export interface DynamicButtonLoadingPayload extends DynamicButtonRecordContext {
  /** 当前是否有异步步骤正在执行。 */
  loading: boolean;
  /** 当前步骤；null 表示没有异步任务。 */
  phase: DynamicButtonPhase | null;
  /** 当前行为类型。 */
  type: DynamicButtonType;
}

/** Confirm、Modal、Drawer 打开状态变化事件的参数。 */
export interface DynamicButtonOpenPayload extends DynamicButtonRecordContext {
  /** 当前是否打开。 */
  open: boolean;
  /** 发生变化的容器类型。 */
  type: Exclude<DynamicButtonType, 'click'>;
}

/** DynamicButton 对外发出的全部事件。 */
export interface DynamicButtonEmits {
  /** 行为成功完成。 */
  success: [payload: DynamicButtonSuccessPayload];
  /** 任意异步阶段执行失败。 */
  error: [payload: DynamicButtonErrorPayload];
  /** 用户取消 Confirm、Modal 或 Drawer。 */
  cancel: [payload: DynamicButtonCancelPayload];
  /** 内部异步步骤变化。 */
  'loading-change': [payload: DynamicButtonLoadingPayload];
  /** Confirm、Modal 或 Drawer 打开状态变化。 */
  'open-change': [payload: DynamicButtonOpenPayload];
}

/** hooks 调用 SFC defineEmits 时使用的统一函数类型。 */
export type DynamicButtonEmit = <EventName extends keyof DynamicButtonEmits>(
  event: EventName,
  ...args: DynamicButtonEmits[EventName]
) => void;

/** hooks 打开 Modal 或 Drawer 时使用的内部会话。 */
export interface DynamicButtonLayerSession extends DynamicButtonActionContext {
  /** 弹层行为配置的稳定快照。 */
  render: DynamicButtonLayerRender;
  /** 已解析的业务组件额外属性。 */
  componentProps: Record<string, unknown>;
}

/** hooks 将内部生命周期统一回传给 DynamicButton。 */
export interface DynamicButtonLayerLifecycle {
  /** 异步步骤变化；null 表示本轮任务结束。 */
  onPhaseChange: (phase: DynamicButtonPhase | null, session: DynamicButtonLayerSession) => void;
  /** 弹层打开状态变化。 */
  onOpenChange: (open: boolean, session: DynamicButtonLayerSession) => void;
  /** 弹层提交成功。 */
  onSuccess: (session: DynamicButtonLayerSession, value: DynamicButtonValue) => void;
  /** 弹层校验、提交或取消失败。 */
  onError: (
    error: unknown,
    phase: DynamicButtonPhase,
    session: DynamicButtonLayerSession,
    value: DynamicButtonValue,
  ) => void;
  /** 弹层取消成功。 */
  onCancel: (
    reason: DynamicButtonCancelReason,
    session: DynamicButtonLayerSession,
    value: DynamicButtonValue,
  ) => void;
}
