import type { DynamicButtonCancelReason } from '../types';

/** 根据 Antdv 关闭事件识别关闭入口，供 Modal 和 Drawer 共用。 */
export function resolveDynamicButtonCancelReason(
  event: MouseEvent | KeyboardEvent,
): DynamicButtonCancelReason {
  if (event instanceof KeyboardEvent) return 'keyboard';

  const target = event.target;

  if (!(target instanceof Element)) return 'outside';
  if (target.closest('.ant-modal-close, .ant-drawer-close')) return 'close-icon';
  if (target.matches('.ant-modal-wrap, .ant-modal-mask, .ant-drawer-mask')) return 'mask';

  return 'outside';
}
