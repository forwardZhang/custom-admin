export interface AttachGuard {
  /** 当前是否已有宿主组件挂载。 */
  readonly attached: boolean;
  attach(): void;
  detach(): void;
}

/**
 * 单挂载不变量。
 * 一个 State 实例只应被一个组件挂载；同时挂载两个时，命令式 API 只会作用于最后一个宿主。
 * 这在开发期几乎总是误用（同一次 Hook 调用返回的组件被渲染了两次），所以 warn 一次。
 */
export function createAttachGuard(label: string): AttachGuard {
  let attachedCount = 0;
  let warned = false;

  return {
    get attached() {
      return attachedCount > 0;
    },
    attach() {
      attachedCount += 1;

      if (attachedCount > 1 && !warned && import.meta.env.DEV) {
        warned = true;
        console.warn(
          `[${label}] 同一个实例被挂载了多次，命令式 API 只会作用于最后挂载的那个组件。`,
        );
      }
    },
    detach() {
      attachedCount = Math.max(0, attachedCount - 1);
    },
  };
}
