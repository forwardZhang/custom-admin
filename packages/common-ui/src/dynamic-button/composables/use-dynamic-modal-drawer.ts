import type { ButtonProps, DrawerProps, ModalProps } from 'antdv-next';
import type { Component, Ref } from 'vue';

import { Drawer, Modal } from 'antdv-next';
import { cloneDeep } from 'lodash-es';
import { computed, defineComponent, h, readonly, shallowRef } from 'vue';

import { resolveDynamicButtonCancelReason } from '../utils/resolve-cancel-reason';
import { renderDynamicButtonFooter } from '../utils/render-footer';

import type {
  DynamicButtonActionContext,
  DynamicButtonCancelReason,
  DynamicButtonContentExpose,
  DynamicButtonLayerAction,
  DynamicButtonLayerLifecycle,
  DynamicButtonLayerSession,
  DynamicButtonPhase,
} from '../types';

/** Modal 和 Drawer 共同使用的容器类型。 */
export type DynamicButtonModalDrawerType = DynamicButtonLayerAction['type'];

/** Modal/Drawer 在内部渲染前归一化的共同属性。 */
interface DynamicButtonLayerContainerProps {
  [key: string]: unknown;
  cancelButtonProps?: ButtonProps;
  cancelText: ModalProps['cancelText'];
  closable?: DrawerProps['closable'] | ModalProps['closable'];
  keyboard?: boolean;
  mask?: DrawerProps['mask'] | ModalProps['mask'];
  maskClosable?: boolean;
  okButtonProps?: ButtonProps;
  okText: ModalProps['okText'];
  okType?: ModalProps['okType'];
}

/** useDynamicModalDrawer 对 DynamicButton 暴露的组件实例能力。 */
export interface DynamicButtonModalDrawerApi<TRecord, TValue> {
  /** 关闭动画结束前保持组件存在，确保离场动画能够完整播放。 */
  mounted: Readonly<Ref<boolean>>;
  /** 当前 Modal 或 Drawer 是否打开。 */
  opened: Readonly<Ref<boolean>>;
  /** 当前组件实例正在执行的异步步骤。 */
  phase: Readonly<Ref<DynamicButtonPhase | null>>;
  /** DynamicButton 通过 component :is 将它放进当前应用组件树。 */
  component: Component;
  /** 使用点击时捕获的稳定会话打开组件实例。 */
  open: (session: DynamicButtonLayerSession<TRecord, TValue>) => void;
}

/**
 * 使用同一套状态机创建 Modal 或 Drawer 组件实例。
 * 两种容器只在原生属性和关闭事件上分支，value、校验、提交、取消及清理流程全部复用。
 */
export function useDynamicModalDrawer<TRecord, TValue>(
  type: DynamicButtonModalDrawerType,
  lifecycle: DynamicButtonLayerLifecycle<TRecord, TValue>,
): DynamicButtonModalDrawerApi<TRecord, TValue> {
  const mounted = shallowRef(false);
  const opened = shallowRef(false);
  const phase = shallowRef<DynamicButtonPhase | null>(null);
  const session = shallowRef<DynamicButtonLayerSession<TRecord, TValue>>();
  const value = shallowRef<TValue>();
  const contentRef = shallowRef<DynamicButtonContentExpose<TValue>>();
  const busy = computed(() => phase.value !== null);

  /** phase 同时决定 footer loading、关闭保护和错误阶段。 */
  function setPhase(nextPhase: DynamicButtonPhase | null): void {
    const current = session.value;

    if (!current || phase.value === nextPhase) return;
    phase.value = nextPhase;
    lifecycle.onPhaseChange(nextPhase, current);
  }

  /** 为 submit/cancel 创建当前值快照，避免回调修改组件实例的内部数据。 */
  function createActionContext(
    current: DynamicButtonLayerSession<TRecord, TValue>,
  ): DynamicButtonActionContext<TRecord, TValue> {
    return {
      record: current.record,
      event: current.event,
      value: cloneDeep(value.value),
    };
  }

  /** 成功提交后使用内部关闭，避免把成功流程误判成业务取消。 */
  function closeInternal(): void {
    const current = session.value;

    if (!current || !opened.value) return;
    opened.value = false;
    lifecycle.onOpenChange(false, current);
  }

  /** 内容组件通过标准 v-model 更新当前编辑值。 */
  function updateValue(nextValue: TValue | undefined): void {
    value.value = cloneDeep(nextValue);
  }

  /** validate 返回 void 时表示沿用当前 v-model 值，不做替换。 */
  function isReplacementValue(validated: TValue | void | undefined): validated is TValue {
    return validated !== undefined;
  }

  /** 保存内容组件暴露的实例，提交时按需调用 validate。 */
  function setContentRef(instance: unknown): void {
    contentRef.value = instance as DynamicButtonContentExpose<TValue> | undefined;
  }

  /**
   * validate 与 submit 连续执行且中间不清空 phase，
   * 确定按钮会持续显示 loading，不会在两个阶段之间闪烁。
   */
  async function submit(): Promise<void> {
    const current = session.value;

    if (!current || !opened.value || busy.value) return;

    let failedPhase: DynamicButtonPhase = 'validate';
    let succeeded = false;

    try {
      setPhase('validate');
      const validatedValue = await contentRef.value?.validate?.();

      // validate 返回新值时，用它替换 v-model 当前值并作为最终提交数据。
      if (isReplacementValue(validatedValue)) updateValue(validatedValue);

      failedPhase = 'submit';
      setPhase('submit');
      await current.action.submit(createActionContext(current));
      succeeded = true;
      lifecycle.onSuccess(current, cloneDeep(value.value));
    } catch (error) {
      lifecycle.onError(error, failedPhase, current, cloneDeep(value.value));
    } finally {
      // 任意异常都必须恢复 phase，否则 footer 会永久保持 loading 和禁用状态。
      setPhase(null);
    }

    if (succeeded) closeInternal();
  }

  /** 所有主动关闭入口都先等待业务 cancel；回调失败时保持组件打开。 */
  async function cancel(reason: DynamicButtonCancelReason): Promise<void> {
    const current = session.value;

    if (!current || !opened.value || busy.value) return;

    let succeeded = false;

    try {
      setPhase('cancel');
      await current.action.cancel?.({ ...createActionContext(current), reason });
      succeeded = true;
      lifecycle.onCancel(reason, current, cloneDeep(value.value));
    } catch (error) {
      lifecycle.onError(error, 'cancel', current, cloneDeep(value.value));
    } finally {
      setPhase(null);
    }

    if (succeeded) closeInternal();
  }

  /** 关闭动画完成后卸载组件，并释放本次会话保存的 record、value 和内容引用。 */
  function handleAfterOpenChange(
    open: boolean,
    current: DynamicButtonLayerSession<TRecord, TValue>,
  ): void {
    if (open || opened.value || session.value !== current) return;

    mounted.value = false;
    session.value = undefined;
    value.value = undefined;
    contentRef.value = undefined;
  }

  /**
   * 组件实例仍由 DynamicButton 的 component :is 渲染在当前组件树内，
   * 因此 Modal/Drawer Teleport 后依然能够自然继承主题、locale 和 inject。
   */
  const ModalDrawerComponent = defineComponent({
    name: type === 'modal' ? 'DynamicButtonModalComponent' : 'DynamicButtonDrawerComponent',
    setup() {
      return () => {
        const current = session.value;

        if (!current || current.action.type !== type) return null;

        const action = current.action;
        // 两种容器的透传属性分别声明，取值时按 type 收窄，避免混用彼此的原生属性。
        const configuredProps = action.type === 'modal' ? action.modalProps : action.drawerProps;
        const containerProps = {
          ...configuredProps,
          okText: configuredProps?.okText ?? '提交',
          cancelText: configuredProps?.cancelText ?? '取消',
        } as DynamicButtonLayerContainerProps;
        // 底部按钮由 DynamicButton 接管，不再透传给容器本身。
        const { okText, cancelText, okButtonProps, cancelButtonProps, ...layerProps } =
          containerProps;
        const configuredOkButton = okButtonProps ?? {};
        const LayerComponent = action.type === 'modal' ? Modal : Drawer;
        const handleClose = (event: MouseEvent | KeyboardEvent) => {
          void cancel(resolveDynamicButtonCancelReason(event));
        };
        const configuredMask = layerProps.mask;
        const controlledMask =
          busy.value && configuredMask && typeof configuredMask === 'object'
            ? { ...configuredMask, closable: false }
            : configuredMask;

        return h(
          LayerComponent as Component,
          {
            ...layerProps,
            open: opened.value,
            destroyOnHidden: true,
            closable: busy.value ? false : layerProps.closable,
            keyboard: busy.value ? false : layerProps.keyboard,
            mask: controlledMask,
            maskClosable: busy.value ? false : layerProps.maskClosable,
            ...(action.type === 'modal' ? { onCancel: handleClose } : { onClose: handleClose }),
            onAfterOpenChange: (open: boolean) => handleAfterOpenChange(open, current),
          },
          {
            default: () =>
              h(action.component, {
                // 调用方属性先展开，内部字段始终使用当前点击会话，避免 record 被覆盖。
                ...current.componentProps,
                record: current.record,
                modelValue: value.value,
                'onUpdate:modelValue': updateValue,
                ref: setContentRef,
              }),
            footer: () =>
              renderDynamicButtonFooter({
                okText,
                cancelText,
                okButtonProps: {
                  ...configuredOkButton,
                  type: 'primary',
                },
                cancelButtonProps,
                extra: action.footerExtra?.({
                  ...createActionContext(current),
                  phase: phase.value,
                }),
                submitLoading: phase.value === 'validate' || phase.value === 'submit',
                cancelLoading: phase.value === 'cancel',
                onSubmit: () => submit(),
                onCancel: () => cancel('cancel-button'),
              }),
          },
        );
      };
    },
  });

  /** 使用点击瞬间捕获的稳定会话打开对应的 Modal 或 Drawer 组件实例。 */
  function open(nextSession: DynamicButtonLayerSession<TRecord, TValue>): void {
    if (nextSession.action.type !== type || opened.value || busy.value) return;

    session.value = nextSession;
    value.value = cloneDeep(nextSession.value);
    // mounted 先开启，组件会在当前树中以 open=true 完成首次渲染。
    mounted.value = true;
    opened.value = true;
    lifecycle.onOpenChange(true, nextSession);
  }

  return {
    mounted: readonly(mounted),
    opened: readonly(opened),
    phase: readonly(phase),
    component: ModalDrawerComponent,
    open,
  };
}
