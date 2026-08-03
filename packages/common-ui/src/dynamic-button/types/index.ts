import type { ButtonProps, DrawerProps, ModalProps, PopconfirmProps } from 'antdv-next';
import type { Component, VNodeChild } from 'vue';

/** 同时兼容同步返回值和 Promise 返回值。 */
export type Awaitable<T> = T | Promise<T>;

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
export interface DynamicButtonRecordContext<TRecord = void> {
  /** 当前列表行或其他业务数据；调用方没有传 record 时为 undefined。 */
  record: TRecord | undefined;
}

/** getDefaultValue 执行时收到的参数。 */
export interface DynamicButtonLoadContext<
  TRecord = void,
> extends DynamicButtonRecordContext<TRecord> {
  /** 最初点击 DynamicButton 时的鼠标事件。 */
  event: MouseEvent;
}

/** 用户触发提交行为时的完整参数。 */
export interface DynamicButtonActionContext<
  TRecord = void,
  TValue = void,
> extends DynamicButtonLoadContext<TRecord> {
  /** getDefaultValue 或内容组件产生的数据；没有配置 getDefaultValue 时为 undefined。 */
  value: TValue | undefined;
}

/** 自定义底部扩展内容渲染时收到的参数。 */
export interface DynamicButtonFooterContext<
  TRecord = void,
  TValue = void,
> extends DynamicButtonActionContext<TRecord, TValue> {
  /** 当前异步阶段，可用于控制扩展按钮的 loading 或 disabled。 */
  phase: DynamicButtonPhase | null;
}

/** 取消 Modal、Drawer 或 Confirm 时的参数。 */
export interface DynamicButtonCancelContext<
  TRecord = void,
  TValue = void,
> extends DynamicButtonActionContext<TRecord, TValue> {
  /** 触发取消的具体入口。 */
  reason: DynamicButtonCancelReason;
}

/** 点击后直接执行业务方法。 */
export interface DynamicButtonClickAction<TRecord = void, TValue = void> {
  /** 直接执行点击行为。 */
  type: 'click';
  /** 提交前获取自定义数据。 */
  getDefaultValue?: (context: DynamicButtonLoadContext<TRecord>) => Awaitable<TValue>;
  /** 执行最终业务提交。 */
  submit: (context: DynamicButtonActionContext<TRecord, TValue>) => Awaitable<void>;
}

/** DynamicButton 允许配置的 Popconfirm 原生属性；打开状态与行为事件由组件接管。 */
export type DynamicButtonConfirmProps = Omit<
  PopconfirmProps,
  'open' | 'defaultOpen' | 'disabled' | 'onOpenChange' | 'onUpdate:open' | 'onConfirm' | 'onCancel'
>;

/** 使用 Popconfirm 进行二次确认。 */
export interface DynamicButtonConfirmAction<TRecord = void, TValue = void> {
  /** 打开二次确认气泡。 */
  type: 'confirm';
  /** 透传给 Antdv Popconfirm 的原生属性。 */
  confirmProps?: DynamicButtonConfirmProps;
  /** 打开确认框前获取自定义数据。 */
  getDefaultValue?: (context: DynamicButtonLoadContext<TRecord>) => Awaitable<TValue>;
  /** 点击确认按钮后执行。 */
  submit: (context: DynamicButtonActionContext<TRecord, TValue>) => Awaitable<void>;
  /** 点击取消或关闭确认框后执行。 */
  cancel?: (context: DynamicButtonCancelContext<TRecord, TValue>) => Awaitable<void>;
}

/** Modal 中由 DynamicButton 接管、调用方不能覆盖的字段。 */
type DynamicButtonControlledModalProp =
  | 'open'
  | 'confirmLoading'
  | 'destroyOnHidden'
  | 'footer'
  | 'onOk'
  | 'onCancel'
  | 'afterOpenChange';

/** DynamicButton 允许配置的 Modal 原生属性。 */
export type DynamicButtonModalProps = Omit<ModalProps, DynamicButtonControlledModalProp>;

/** Drawer 底部操作区由 DynamicButton 补充的属性。 */
export interface DynamicButtonDrawerFooterProps {
  /** 确定按钮文案，默认为“提交”。 */
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
export interface DynamicButtonLayerCommon<TRecord = void, TValue = void> {
  /** 弹层中渲染的业务组件。 */
  component: Component;
  /** 额外传给业务组件的属性；函数形式可读取当前 record 和默认 value。 */
  componentProps?:
    | Record<string, unknown>
    | ((context: DynamicButtonActionContext<TRecord, TValue>) => Record<string, unknown>);
  /** 打开弹层前获取初始值。 */
  getDefaultValue?: (context: DynamicButtonLoadContext<TRecord>) => Awaitable<TValue>;
  /** 内容组件校验通过后执行提交。 */
  submit: (context: DynamicButtonActionContext<TRecord, TValue>) => Awaitable<void>;
  /** 用户主动关闭弹层时执行。 */
  cancel?: (context: DynamicButtonCancelContext<TRecord, TValue>) => Awaitable<void>;
  /** 在取消和确定按钮前渲染额外操作。 */
  footerExtra?: (context: DynamicButtonFooterContext<TRecord, TValue>) => VNodeChild;
}

/** Modal 和 Drawer 共用一个公共类型，同时保留各自透传属性的类型收窄。 */
export type DynamicButtonLayerAction<TRecord = void, TValue = void> = DynamicButtonLayerCommon<
  TRecord,
  TValue
> &
  (
    | {
        /** 使用 Modal 作为内容容器。 */
        type: 'modal';
        /** 透传给 Antdv Modal 的原生属性。 */
        modalProps?: DynamicButtonModalProps;
      }
    | {
        /** 使用 Drawer 作为内容容器。 */
        type: 'drawer';
        /** 透传给 Antdv Drawer 的原生属性和底部按钮属性。 */
        drawerProps?: DynamicButtonDrawerProps;
      }
  );

/** DynamicButton 支持的全部行为。 */
export type DynamicButtonAction<TRecord = void, TValue = void> =
  | DynamicButtonClickAction<TRecord, TValue>
  | DynamicButtonConfirmAction<TRecord, TValue>
  | DynamicButtonLayerAction<TRecord, TValue>;

/** 行为成功完成时的扁平参数。 */
export interface DynamicButtonSuccessPayload<
  TRecord = void,
  TValue = void,
> extends DynamicButtonActionContext<TRecord, TValue> {
  /** 本次成功的行为类型。 */
  type: DynamicButtonType;
}

/** 任意异步阶段失败时的扁平参数。 */
export interface DynamicButtonErrorPayload<
  TRecord = void,
  TValue = void,
> extends DynamicButtonActionContext<TRecord, TValue> {
  /** 发生错误的行为类型。 */
  type: DynamicButtonType;
  /** 发生错误的具体执行阶段。 */
  phase: DynamicButtonPhase;
  /** 原始异常对象。 */
  error: unknown;
}

/** 用户取消 Confirm、Modal 或 Drawer 时的扁平参数。 */
export interface DynamicButtonCancelPayload<
  TRecord = void,
  TValue = void,
> extends DynamicButtonCancelContext<TRecord, TValue> {
  /** 被取消的行为类型。 */
  type: Exclude<DynamicButtonType, 'click'>;
}

/** 内部异步步骤变化时的参数。 */
export interface DynamicButtonLoadingPayload<
  TRecord = void,
> extends DynamicButtonRecordContext<TRecord> {
  /** 当前是否有异步步骤正在执行。 */
  loading: boolean;
  /** 当前步骤；null 表示没有异步任务。 */
  phase: DynamicButtonPhase | null;
  /** 当前行为类型。 */
  type: DynamicButtonType;
}

/** Confirm、Modal、Drawer 打开状态变化时的参数。 */
export interface DynamicButtonOpenPayload<
  TRecord = void,
> extends DynamicButtonRecordContext<TRecord> {
  /** 当前是否打开。 */
  open: boolean;
  /** 发生变化的容器类型。 */
  type: Exclude<DynamicButtonType, 'click'>;
}

/**
 * 按钮生命周期回调。
 * 按钮通常渲染在表格单元格里，配置本身就是唯一入口，因此回调随配置传入而不走 emits。
 */
export interface DynamicButtonHandlers<TRecord = void, TValue = void> {
  /** 行为成功完成。 */
  onSuccess?: (payload: DynamicButtonSuccessPayload<TRecord, TValue>) => void;
  /** 任意异步阶段执行失败。 */
  onError?: (payload: DynamicButtonErrorPayload<TRecord, TValue>) => void;
  /** 用户取消 Confirm、Modal 或 Drawer。 */
  onCancel?: (payload: DynamicButtonCancelPayload<TRecord, TValue>) => void;
  /** 内部异步步骤变化。 */
  onLoadingChange?: (payload: DynamicButtonLoadingPayload<TRecord>) => void;
  /** Confirm、Modal 或 Drawer 打开状态变化。 */
  onOpenChange?: (payload: DynamicButtonOpenPayload<TRecord>) => void;
}

/** 按钮完整配置。 */
export interface DynamicButtonConfig<TRecord = void, TValue = void> extends DynamicButtonHandlers<
  TRecord,
  TValue
> {
  /** 按钮文案；函数形式使用对象参数，方便以后扩展上下文字段。 */
  label: VNodeChild | ((context: DynamicButtonRecordContext<TRecord>) => VNodeChild);
  /** 按钮图标组件，例如 EditOutlined。 */
  icon?: Component;
  /** 是否禁用按钮；函数形式可以根据当前 record 动态计算。 */
  disabled?: boolean | ((context: DynamicButtonRecordContext<TRecord>) => boolean);
  /** 透传给 Antdv Button 的原生属性。 */
  buttonProps?: ButtonProps;
  /** 按钮点击后的具体行为。 */
  action: DynamicButtonAction<TRecord, TValue>;
}

/** DynamicButton 对外只开放 config 和 record 两个属性。 */
export interface DynamicButtonProps<TRecord = void, TValue = void> {
  /** 按钮外观和行为配置。 */
  config: DynamicButtonConfig<TRecord, TValue>;
  /** 当前列表行或其他业务上下文数据。 */
  record?: TRecord;
}

/** 弹层内容组件可以按需暴露的校验能力。 */
export interface DynamicButtonContentExpose<TValue = void> {
  /** 校验当前内容；返回新值时会替换当前 v-model 值。 */
  validate?: () => Awaitable<TValue | void>;
}

/** DynamicButton 的命令式 API：只开放主动触发入口。 */
export interface DynamicButtonApi {
  /** 主动触发按钮行为；不传事件时会创建一个程序化点击事件。 */
  trigger: (event?: MouseEvent) => void;
}

/** composables 向当前配置分发生命周期回调时使用的统一函数类型。 */
export type DynamicButtonDispatch<TRecord = void, TValue = void> = <
  EventName extends keyof DynamicButtonHandlers<TRecord, TValue>,
>(
  event: EventName,
  payload: Parameters<NonNullable<DynamicButtonHandlers<TRecord, TValue>[EventName]>>[0],
) => void;

/** hooks 打开 Modal 或 Drawer 时使用的内部会话。 */
export interface DynamicButtonLayerSession<
  TRecord = void,
  TValue = void,
> extends DynamicButtonActionContext<TRecord, TValue> {
  /** 弹层行为配置的稳定快照。 */
  action: DynamicButtonLayerAction<TRecord, TValue>;
  /** 已解析的业务组件额外属性。 */
  componentProps: Record<string, unknown>;
}

/** hooks 将内部生命周期统一回传给 DynamicButton。 */
export interface DynamicButtonLayerLifecycle<TRecord = void, TValue = void> {
  /** 异步步骤变化；null 表示本轮任务结束。 */
  onPhaseChange: (
    phase: DynamicButtonPhase | null,
    session: DynamicButtonLayerSession<TRecord, TValue>,
  ) => void;
  /** 弹层打开状态变化。 */
  onOpenChange: (open: boolean, session: DynamicButtonLayerSession<TRecord, TValue>) => void;
  /** 弹层提交成功。 */
  onSuccess: (
    session: DynamicButtonLayerSession<TRecord, TValue>,
    value: TValue | undefined,
  ) => void;
  /** 弹层校验、提交或取消失败。 */
  onError: (
    error: unknown,
    phase: DynamicButtonPhase,
    session: DynamicButtonLayerSession<TRecord, TValue>,
    value: TValue | undefined,
  ) => void;
  /** 弹层取消成功。 */
  onCancel: (
    reason: DynamicButtonCancelReason,
    session: DynamicButtonLayerSession<TRecord, TValue>,
    value: TValue | undefined,
  ) => void;
}
