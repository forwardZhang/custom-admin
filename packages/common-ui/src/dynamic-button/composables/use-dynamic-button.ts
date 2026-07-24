import type { ButtonProps } from 'antdv-next';

import { cloneDeep } from 'lodash-es';
import { computed, shallowRef } from 'vue';

import { useDynamicConfirm } from './use-dynamic-confirm';
import { useDynamicModalDrawer } from './use-dynamic-modal-drawer';
import { resolveDynamicButtonDisabled, resolveDynamicButtonLabel } from '../utils/resolve-config';

import type {
  DynamicButtonActionContext,
  DynamicButtonCancelReason,
  DynamicButtonEmit,
  DynamicButtonLayerLifecycle,
  DynamicButtonLayerRender,
  DynamicButtonLayerSession,
  DynamicButtonPhase,
  DynamicButtonProps,
  DynamicButtonType,
  DynamicButtonValue,
} from '../types';

/**
 * 调度 click、confirm、modal、drawer 四种行为。
 * phase 只表示当前异步步骤，并据此决定 loading 应显示在外层按钮还是弹层按钮。
 */
export function useDynamicButton(props: DynamicButtonProps, emit: DynamicButtonEmit) {
  const localPhase = shallowRef<DynamicButtonPhase | null>(null);

  /**
   * 只在当前按钮确实使用 Modal 或 Drawer 时创建弹层生命周期。
   * click/confirm 不调用本函数，避免为普通按钮额外创建一组回调对象。
   */
  function createLayerLifecycle(): DynamicButtonLayerLifecycle {
    return {
      onPhaseChange(phase, session) {
        emit('loading-change', {
          loading: phase !== null,
          phase,
          type: session.render.type,
          record: session.record,
        });
      },
      onOpenChange(open, session) {
        emit('open-change', {
          open,
          type: session.render.type,
          record: session.record,
        });
      },
      onSuccess(session, value) {
        emit('success', {
          type: session.render.type,
          record: session.record,
          event: session.event,
          value,
        });
      },
      onError(error, phase, session, value) {
        emit('error', {
          type: session.render.type,
          phase,
          error,
          record: session.record,
          event: session.event,
          value,
        });
      },
      onCancel(reason, session, value) {
        emit('cancel', {
          type: session.render.type,
          reason,
          record: session.record,
          event: session.event,
          value,
        });
      },
    };
  }

  /**
   * render.type 是当前 DynamicButton 实例的结构类型，初始化时只创建匹配的组件实例：
   * click/confirm 不创建弹层，modal 只创建 Modal，drawer 只创建 Drawer。
   * 如果业务运行时需要切换 type，应使用 :key="config.render.type" 重建按钮实例。
   */
  const initialRenderType = props.config.render.type;
  const layer =
    initialRenderType === 'modal' || initialRenderType === 'drawer'
      ? useDynamicModalDrawer(initialRenderType, createLayerLifecycle())
      : undefined;

  /** label/disabled 的动态函数统一接收 { record } 对象。 */
  const label = computed(() => resolveDynamicButtonLabel(props.config.label, props.record));
  const businessDisabled = computed(() =>
    resolveDynamicButtonDisabled(props.config.disabled, props.record),
  );

  /** config.props.loading 可能是 boolean，也可能包含 delay/icon。 */
  const externalLoading = computed(() => props.config.props?.loading);

  /**
   * Confirm 初始化前先计算其他来源的不可用状态，供 Popconfirm 控制自身 disabled。
   * 这里只排除 Confirm 自己的 opened/phase，避免两个 computed 相互依赖。
   */
  const unavailableWithoutConfirm = computed(
    () =>
      localPhase.value !== null ||
      (layer?.phase.value ?? null) !== null ||
      (layer?.opened.value ?? false) ||
      businessDisabled.value ||
      Boolean(props.config.props?.disabled) ||
      Boolean(externalLoading.value),
  );

  /** 只有 confirm 类型才创建受控确认框会话，其他按钮不承担这部分状态开销。 */
  const confirm =
    initialRenderType === 'confirm'
      ? useDynamicConfirm(props, emit, unavailableWithoutConfirm)
      : undefined;

  /** 当前是否有默认值、提交、校验或取消任务正在执行。 */
  const isExecuting = computed(
    () =>
      localPhase.value !== null ||
      (layer?.phase.value ?? null) !== null ||
      (confirm?.phase.value ?? null) !== null,
  );

  /**
   * 外层按钮只承担默认值加载，以及 click 类型的提交 loading。
   * Confirm/Modal/Drawer 打开后，提交和取消 loading 转移到对应操作按钮。
   */
  const internalButtonLoading = computed(
    () =>
      localPhase.value === 'load-default' ||
      (initialRenderType === 'click' && localPhase.value === 'submit') ||
      confirm?.phase.value === 'load-default',
  );

  const loading = computed<ButtonProps['loading']>(() =>
    internalButtonLoading.value ? true : externalLoading.value,
  );

  /** Confirm 自己的打开和执行状态最后合并，防止确认期间再次触发外层按钮。 */
  const disabled = computed(
    () =>
      unavailableWithoutConfirm.value ||
      (confirm?.phase.value ?? null) !== null ||
      (confirm?.opened.value ?? false),
  );

  /** render.type 是结构配置，运行时切换时应通过 key 重建当前按钮实例。 */
  const isConfirm = initialRenderType === 'confirm';

  /** phase 每次变化都会报告具体阶段；null 明确表示当前没有异步任务。 */
  function setLocalPhase(
    nextPhase: DynamicButtonPhase | null,
    type: DynamicButtonType,
    record = props.record,
  ): void {
    if (localPhase.value === nextPhase) return;

    localPhase.value = nextPhase;
    emit('loading-change', {
      loading: nextPhase !== null,
      phase: nextPhase,
      type,
      record,
    });
  }

  /** 生成提交上下文，value 深拷贝用于隔离组件内部状态。 */
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

  /** click 类型在外层按钮内完成默认值加载和提交。 */
  async function runClick(event: MouseEvent): Promise<void> {
    const render = props.config.render;

    if (render.type !== 'click' || isExecuting.value || layer?.opened.value) return;

    const record = props.record;
    let value: DynamicButtonValue;
    let failedPhase: DynamicButtonPhase = 'submit';

    try {
      if (render.getDefaultValue) {
        failedPhase = 'load-default';
        setLocalPhase('load-default', render.type, record);
        value = cloneDeep(await render.getDefaultValue({ record, event }));
      }

      failedPhase = 'submit';
      setLocalPhase('submit', render.type, record);
      await render.submit(createActionContext(record, event, value));
      emit('success', { type: render.type, record, event, value: cloneDeep(value) });
    } catch (error) {
      emit('error', {
        type: render.type,
        phase: failedPhase,
        error,
        record,
        event,
        value: cloneDeep(value),
      });
    } finally {
      // 所有异常路径都必须恢复为 null，否则按钮会永久保持禁用。
      setLocalPhase(null, render.type, record);
    }
  }

  /**
   * Modal/Drawer 打开前解析默认值和 componentProps。
   * 解析完成后把同一份 record 快照交给内容组件、submit 和 cancel。
   */
  async function openLayer(render: DynamicButtonLayerRender, event: MouseEvent): Promise<void> {
    // 类型与初始化时不一致说明调用方在原实例上切换了结构类型，此时必须重建实例。
    if (!layer || render.type !== initialRenderType || isExecuting.value || layer.opened.value) {
      return;
    }

    const record = props.record;
    let value: DynamicButtonValue;

    try {
      setLocalPhase('load-default', render.type, record);
      value = render.getDefaultValue
        ? cloneDeep(await render.getDefaultValue({ record, event }))
        : undefined;

      const context = createActionContext(record, event, value);
      const componentProps =
        typeof render.componentProps === 'function'
          ? render.componentProps(context)
          : (render.componentProps ?? {});
      const session: DynamicButtonLayerSession = {
        ...context,
        render,
        componentProps,
      };

      // layer 已在 setup 时根据 render.type 精确选择，这里不再初始化另一套弹层状态。
      layer.open(session);
    } catch (error) {
      emit('error', {
        type: render.type,
        phase: 'load-default',
        error,
        record,
        event,
        value: cloneDeep(value),
      });
    } finally {
      setLocalPhase(null, render.type, record);
    }
  }

  /** 基础按钮统一入口会根据 render.type 分发具体行为。 */
  function handleClick(event: MouseEvent): void {
    if (disabled.value) return;

    const render = props.config.render;

    if (render.type === 'click') {
      void runClick(event);
      return;
    }

    if (render.type === 'confirm') {
      void confirm?.open(event);
      return;
    }

    void openLayer(render, event);
  }

  /** 将模板事件转交给 Confirm hook，普通按钮调用时不会产生行为。 */
  function handleConfirmOpenChange(open: boolean): void {
    confirm?.handleOpenChange(open);
  }

  /** 提交和取消包装函数保持模板 API 稳定，具体状态机位于 useDynamicConfirm。 */
  function submitConfirm(): void {
    void confirm?.submit();
  }

  function cancelConfirm(reason: DynamicButtonCancelReason): void {
    void confirm?.cancel(reason);
  }

  return {
    label,
    disabled,
    loading,
    isConfirm,
    // 非 Confirm 类型直接返回普通值，不额外创建用于占位的 computed。
    confirmOpened: confirm?.opened ?? false,
    confirmProps: confirm?.props ?? {},
    // 非弹层类型同样不创建占位 computed，组件实例只在需要时存在。
    layerMounted: layer?.mounted ?? false,
    layerComponent: layer?.component,
    handleClick,
    handleConfirmOpenChange,
    submitConfirm,
    cancelConfirm,
  };
}
