import type { PopconfirmProps } from 'antdv-next';
import type { Ref } from 'vue';

import { cloneDeep } from 'lodash-es';
import { computed, readonly, shallowRef } from 'vue';

import type {
  DynamicButtonActionContext,
  DynamicButtonCancelReason,
  DynamicButtonConfirmRender,
  DynamicButtonEmit,
  DynamicButtonPhase,
  DynamicButtonProps,
  DynamicButtonValue,
} from '../types';

/** Confirm 打开期间保存点击瞬间的配置、record、event 和 value。 */
interface DynamicButtonConfirmSession extends DynamicButtonActionContext {
  /** 本次确认使用的配置快照，避免打开后受外部 config 变化影响。 */
  render: DynamicButtonConfirmRender;
}

/** useDynamicConfirm 对 DynamicButton 暴露的受控确认框能力。 */
export interface DynamicButtonConfirmApi {
  /** 当前 Popconfirm 是否打开。 */
  opened: Readonly<Ref<boolean>>;
  /** 当前 Confirm 正在执行的异步步骤。 */
  phase: Readonly<Ref<DynamicButtonPhase | null>>;
  /** 合并内部 open、loading 和 disabled 后的 Popconfirm 属性。 */
  props: Readonly<Ref<PopconfirmProps>>;
  /** 加载默认值并打开 Popconfirm。 */
  open: (event: MouseEvent) => Promise<void>;
  /** 点击确认按钮后执行当前会话的 submit。 */
  submit: () => Promise<void>;
  /** 根据具体入口执行异步取消。 */
  cancel: (reason: DynamicButtonCancelReason) => Promise<void>;
  /** 接收 Popconfirm 自身发出的打开状态变化。 */
  handleOpenChange: (open: boolean) => void;
}

/**
 * 管理受控 Popconfirm 的完整会话。
 * 默认值、提交、取消和按钮 loading 都留在该 hook 内，DynamicButton 只负责行为分发。
 */
export function useDynamicConfirm(
  buttonProps: DynamicButtonProps,
  emit: DynamicButtonEmit,
  unavailable: Readonly<Ref<boolean>>,
): DynamicButtonConfirmApi {
  const opened = shallowRef(false);
  const phase = shallowRef<DynamicButtonPhase | null>(null);
  const session = shallowRef<DynamicButtonConfirmSession>();

  /** phase 变化会同步通知外部；null 明确表示本轮异步任务结束。 */
  function setPhase(
    nextPhase: DynamicButtonPhase | null,
    currentRecord = session.value?.record ?? buttonProps.record,
  ): void {
    if (phase.value === nextPhase) return;

    phase.value = nextPhase;
    emit('loading-change', {
      loading: nextPhase !== null,
      phase: nextPhase,
      type: 'confirm',
      record: currentRecord,
    });
  }

  /** value 使用深拷贝，避免业务 submit/cancel 修改当前确认会话。 */
  function createActionContext(
    record: DynamicButtonActionContext['record'],
    event: MouseEvent,
    value: DynamicButtonValue,
  ): DynamicButtonActionContext {
    return {
      record,
      event,
      value: cloneDeep(value),
    };
  }

  /** 只有提交或取消成功后才关闭受控 Popconfirm。 */
  function close(): void {
    const current = session.value;

    if (!current || !opened.value) return;

    opened.value = false;
    emit('open-change', { open: false, type: 'confirm', record: current.record });
    session.value = undefined;
  }

  /** 打开前获取默认值；失败时不显示没有准备好数据的确认框。 */
  async function open(event: MouseEvent): Promise<void> {
    const render = buttonProps.config.render;

    if (render.type !== 'confirm' || unavailable.value || phase.value !== null || opened.value) {
      return;
    }

    const record = buttonProps.record;
    let value: DynamicButtonValue;

    try {
      setPhase('load-default', record);
      value = render.getDefaultValue
        ? cloneDeep(await render.getDefaultValue({ record, event }))
        : undefined;
      session.value = { render, ...createActionContext(record, event, value) };
      opened.value = true;
      emit('open-change', { open: true, type: 'confirm', record });
    } catch (error) {
      emit('error', {
        type: 'confirm',
        phase: 'load-default',
        error,
        record,
        event,
        value: cloneDeep(value),
      });
    } finally {
      // 默认值成功或失败都必须恢复，否则外层按钮会一直保持 loading。
      setPhase(null, record);
    }
  }

  /** 提交失败时保持确认框打开，允许用户直接重试。 */
  async function submit(): Promise<void> {
    const current = session.value;

    if (!current || !opened.value || phase.value !== null) return;

    let succeeded = false;

    try {
      setPhase('submit', current.record);
      await current.render.submit(
        createActionContext(current.record, current.event, current.value),
      );
      succeeded = true;
      emit('success', {
        type: 'confirm',
        record: current.record,
        event: current.event,
        value: cloneDeep(current.value),
      });
    } catch (error) {
      emit('error', {
        type: 'confirm',
        phase: 'submit',
        error,
        record: current.record,
        event: current.event,
        value: cloneDeep(current.value),
      });
    } finally {
      setPhase(null, current.record);
    }

    if (succeeded) close();
  }

  /** 取消回调可以异步执行；失败时保持确认框打开并恢复取消按钮状态。 */
  async function cancel(reason: DynamicButtonCancelReason): Promise<void> {
    const current = session.value;

    if (!current || !opened.value || phase.value !== null) return;

    let succeeded = false;

    try {
      setPhase('cancel', current.record);
      await current.render.cancel?.({
        ...createActionContext(current.record, current.event, current.value),
        reason,
      });
      succeeded = true;
      emit('cancel', {
        type: 'confirm',
        reason,
        record: current.record,
        event: current.event,
        value: cloneDeep(current.value),
      });
    } catch (error) {
      emit('error', {
        type: 'confirm',
        phase: 'cancel',
        error,
        record: current.record,
        event: current.event,
        value: cloneDeep(current.value),
      });
    } finally {
      setPhase(null, current.record);
    }

    if (succeeded) close();
  }

  /** Popconfirm 的遮罩外关闭请求统一转换为 outside 取消。 */
  function handleOpenChange(open: boolean): void {
    if (!open && opened.value) void cancel('outside');
  }

  /**
   * open 和行为事件由 hook 接管；提交和取消阶段分别控制两个操作按钮，
   * 确保一个异步任务执行时不能启动另一个任务。
   */
  const props = computed<PopconfirmProps>(() => {
    const render = session.value?.render;
    const fallback =
      buttonProps.config.render.type === 'confirm' ? buttonProps.config.render : undefined;
    const configuredProps = (render?.props ?? fallback?.props ?? {}) as PopconfirmProps;
    const {
      open: _open,
      defaultOpen: _defaultOpen,
      disabled: _disabled,
      onOpenChange: _onOpenChange,
      'onUpdate:open': _onUpdateOpen,
      onConfirm: _onConfirm,
      onCancel: _onCancel,
      ...nativeProps
    } = configuredProps;

    return {
      ...nativeProps,
      open: opened.value,
      disabled: (unavailable.value || phase.value !== null) && !opened.value,
      okButtonProps: {
        ...nativeProps.okButtonProps,
        loading: phase.value === 'submit',
        disabled: phase.value === 'cancel',
      },
      cancelButtonProps: {
        ...nativeProps.cancelButtonProps,
        loading: phase.value === 'cancel',
        disabled: phase.value === 'submit',
      },
    };
  });

  return {
    opened: readonly(opened),
    phase: readonly(phase),
    props,
    open,
    submit,
    cancel,
    handleOpenChange,
  };
}
