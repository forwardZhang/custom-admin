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
  DynamicButtonLayerLifecycle,
  DynamicButtonLayerRender,
  DynamicButtonLayerSession,
  DynamicButtonPhase,
  DynamicButtonValue,
} from '../types';

/** Modal 和 Drawer 共同使用的容器类型。 */
export type DynamicButtonModalDrawerType = DynamicButtonLayerRender['type'];

/** useDynamicModalDrawer 对 DynamicButton 暴露的组件实例能力。 */
export interface DynamicButtonModalDrawerApi {
  /** 关闭动画结束前保持组件存在，确保离场动画能够完整播放。 */
  mounted: Readonly<Ref<boolean>>;
  /** 当前 Modal 或 Drawer 是否打开。 */
  opened: Readonly<Ref<boolean>>;
  /** 当前组件实例正在执行的异步步骤。 */
  phase: Readonly<Ref<DynamicButtonPhase | null>>;
  /** DynamicButton 通过 component :is 将它放进当前应用组件树。 */
  component: Component;
  /** 使用点击时捕获的稳定会话打开组件实例。 */
  open: (session: DynamicButtonLayerSession) => void;
}

/**
 * 使用同一套状态机创建 Modal 或 Drawer 组件实例。
 * 两种容器只在原生属性和关闭事件上分支，value、校验、提交、取消及清理流程全部复用。
 */
export function useDynamicModalDrawer(
  type: DynamicButtonModalDrawerType,
  lifecycle: DynamicButtonLayerLifecycle,
): DynamicButtonModalDrawerApi {
  const mounted = shallowRef(false);
  const opened = shallowRef(false);
  const phase = shallowRef<DynamicButtonPhase | null>(null);
  const session = shallowRef<DynamicButtonLayerSession>();
  const value = shallowRef<DynamicButtonValue>();
  const contentRef = shallowRef<DynamicButtonContentExpose>();
  const busy = computed(() => phase.value !== null);

  /** phase 同时决定 footer loading、关闭保护和错误阶段。 */
  function setPhase(nextPhase: DynamicButtonPhase | null): void {
    const current = session.value;

    if (!current || phase.value === nextPhase) return;
    phase.value = nextPhase;
    lifecycle.onPhaseChange(nextPhase, current);
  }

  /** 为 submit/cancel 创建当前值快照，避免回调修改组件实例的内部数据。 */
  function createActionContext(current: DynamicButtonLayerSession): DynamicButtonActionContext {
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
  function updateValue(nextValue: DynamicButtonValue): void {
    value.value = cloneDeep(nextValue);
  }

  /** 保存内容组件暴露的实例，提交时按需调用 validate。 */
  function setContentRef(instance: unknown): void {
    contentRef.value = instance as DynamicButtonContentExpose | undefined;
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
      if (validatedValue !== undefined) updateValue(validatedValue);

      failedPhase = 'submit';
      setPhase('submit');
      await current.render.submit(createActionContext(current));
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
      await current.render.cancel?.({ ...createActionContext(current), reason });
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
  function handleAfterOpenChange(open: boolean, current: DynamicButtonLayerSession): void {
    if (open || opened.value || session.value !== current) return;

    mounted.value = false;
    session.value = undefined;
    value.value = undefined;
    contentRef.value = undefined;
  }

  /** Modal 和 Drawer 共用 footer，只有 Modal 需要额外兼容 okType。 */
  function renderFooter(render: DynamicButtonLayerRender) {
    if (render.type === 'modal') {
      // props 必须在判别分支内读取，TypeScript 才能保留 Modal 专属属性类型。
      const containerProps = render.props ?? {};
      const configuredOkButton = containerProps.okButtonProps ?? {};
      const danger = containerProps.okType === 'danger' || configuredOkButton.danger;
      const okButtonProps = {
        ...configuredOkButton,
        type:
          containerProps.okType === 'danger'
            ? 'primary'
            : (containerProps.okType ?? configuredOkButton.type),
        danger,
      };

      return renderDynamicButtonFooter({
        okText: containerProps.okText,
        cancelText: containerProps.cancelText,
        okButtonProps,
        cancelButtonProps: containerProps.cancelButtonProps,
        submitLoading: phase.value === 'validate' || phase.value === 'submit',
        cancelLoading: phase.value === 'cancel',
        onSubmit: () => void submit(),
        onCancel: () => void cancel('cancel-button'),
      });
    }

    // Drawer 没有原生 footer 按钮配置，这些字段来自 DynamicButton 的扩展属性。
    const containerProps = render.props ?? {};
    return renderDynamicButtonFooter({
      okText: containerProps.okText,
      cancelText: containerProps.cancelText,
      okButtonProps: containerProps.okButtonProps,
      cancelButtonProps: containerProps.cancelButtonProps,
      submitLoading: phase.value === 'validate' || phase.value === 'submit',
      cancelLoading: phase.value === 'cancel',
      onSubmit: () => void submit(),
      onCancel: () => void cancel('cancel-button'),
    });
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

        if (!current || current.render.type !== type) return null;

        const render = current.render;
        const slots = {
          default: () =>
            h(render.component, {
              // 调用方属性先展开，内部字段始终使用当前点击会话，避免 record 被覆盖。
              ...current.componentProps,
              record: current.record,
              modelValue: value.value,
              'onUpdate:modelValue': updateValue,
              ref: setContentRef,
            }),
          footer: () => renderFooter(render),
        };

        if (render.type === 'modal') {
          const modalProps = render.props ?? {};
          const configuredMask = modalProps.mask;
          const controlledMask =
            busy.value && configuredMask && typeof configuredMask === 'object'
              ? { ...configuredMask, closable: false }
              : configuredMask;

          return h(
            Modal as Component,
            {
              ...modalProps,
              open: opened.value,
              destroyOnHidden: true,
              closable: busy.value ? false : modalProps.closable,
              keyboard: busy.value ? false : modalProps.keyboard,
              mask: controlledMask,
              maskClosable: busy.value ? false : modalProps.maskClosable,
              onCancel: (event: MouseEvent | KeyboardEvent) => {
                void cancel(resolveDynamicButtonCancelReason(event));
              },
              onAfterOpenChange: (open: boolean) => handleAfterOpenChange(open, current),
            },
            slots,
          );
        }

        // Drawer 的 footer 扩展字段只服务于 DynamicButton，不能透传给原生 Drawer。
        const { okText, cancelText, okButtonProps, cancelButtonProps, ...drawerProps } =
          render.props ?? {};
        const configuredMask = drawerProps.mask;
        const controlledMask =
          busy.value && configuredMask && typeof configuredMask === 'object'
            ? { ...configuredMask, closable: false }
            : configuredMask;

        return h(
          Drawer as Component,
          {
            ...drawerProps,
            open: opened.value,
            destroyOnHidden: true,
            closable: busy.value ? false : drawerProps.closable,
            keyboard: busy.value ? false : drawerProps.keyboard,
            mask: controlledMask,
            maskClosable: busy.value ? false : drawerProps.maskClosable,
            onClose: (event: MouseEvent | KeyboardEvent) => {
              void cancel(resolveDynamicButtonCancelReason(event));
            },
            onAfterOpenChange: (open: boolean) => handleAfterOpenChange(open, current),
          },
          slots,
        );
      };
    },
  });

  /** 使用点击瞬间捕获的稳定会话打开对应的 Modal 或 Drawer 组件实例。 */
  function open(nextSession: DynamicButtonLayerSession): void {
    if (nextSession.render.type !== type || opened.value || busy.value) return;

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
