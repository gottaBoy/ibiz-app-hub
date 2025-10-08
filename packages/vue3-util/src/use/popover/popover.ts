import { createUUID } from 'qx-util';
import { onUnmounted, Ref, ref, watch } from 'vue';
import { listenJSEvent } from '@ibiz-template/core';
import { ControlController } from '@ibiz-template/runtime';
import { useUIStore } from '../../util';

/**
 * @description 管理部件popover层级
 * @export
 * @param {ControlController} controller
 */
export function useControlPopoverzIndex(controller: ControlController): void {
  const { zIndex } = useUIStore();
  controller.state.zIndex = zIndex.increment();

  onUnmounted(() => {
    zIndex.decrement();
  });
}

/**
 * 手动管理popover层级
 *
 * @export
 * @param {string} uuid
 * @param {string} zIndexClass
 */
export function usePopoverzIndex(): {
  popoverid: string;
  setPopoverZIndex: (zIndexClass: string) => void;
} {
  const popoverid = `popover_${createUUID()}`;

  const setPopoverZIndex = (zIndexClass: string) => {
    const { zIndex } = useUIStore();
    const transfer = document.getElementsByClassName(popoverid);
    const modalZIndex = zIndex.increment();
    if (transfer && transfer.length > 0 && zIndexClass) {
      for (let i = 0; i < transfer.length; i++) {
        (transfer[i] as HTMLElement).style.setProperty(
          zIndexClass,
          `${modalZIndex}`,
        );
      }
    }
  };
  return {
    popoverid,
    setPopoverZIndex,
  };
}

/**
 * 判断两个元素是否存在任意层级的共同祖先
 *
 * @param element1 第一个元素（允许为 null，表示未挂载的虚拟节点）
 * @param element2 第二个元素（允许为 null，表示未挂载的虚拟节点）
 * @returns 是否共享至少一个共同祖先（包括自身或父子关系）
 */
export function shareCommonAncestor(
  element1: Node | null,
  element2: Node | null,
): boolean {
  // 边界条件处理
  if (!element1 || !element2) return false;
  if (element1 === element2) return true; // 两个元素是同一个节点

  // 收集 element1 的所有祖先节点（包含自身）
  const ancestorsOfElement1 = new Set<Node>();
  let current: Node | null = element1;
  while (current) {
    ancestorsOfElement1.add(current);
    const parentNode: Node | null = current.parentNode;
    // 排除 body 和 html 节点
    if (
      parentNode &&
      (parentNode.nodeName === 'BODY' || parentNode.nodeName === 'HTML')
    ) {
      current = null;
    } else {
      current = parentNode;
    }
  }
  // 遍历 element2 的祖先链，检查是否存在交集
  current = element2;
  while (current) {
    if (ancestorsOfElement1.has(current)) {
      return true;
    }
    current = current.parentNode;
  }

  return false;
}

/**
 * 手动管理popover打开关闭状态
 *
 * @author tony001
 * @date 2025-02-27 16:02:17
 * @export
 * @param {Ref<unknown>} triggerRef
 * @param {(ele: IData) => Node} getElement
 * @return {*}  {{
 *   popoverVisible: Ref<boolean>;
 *   setPopoverVisible: (visible: boolean) => void;
 * }}
 */
export function usePopoverVisible(
  triggerRef: Ref<unknown>,
  getElement: (ele: IData) => Node,
): {
  popoverVisible: Ref<boolean>;
  setPopoverVisible: (visible: boolean) => void;
} {
  let cleanup: () => void | undefined;

  const popoverVisible = ref(false);

  const setPopoverVisible = (visible: boolean) => {
    popoverVisible.value = visible;
  };

  watch(
    () => triggerRef.value,
    newValue => {
      if (newValue && !cleanup) {
        cleanup = listenJSEvent(
          window,
          'click',
          (evt: MouseEvent) => {
            if (popoverVisible.value && triggerRef.value) {
              const result = shareCommonAncestor(
                getElement(triggerRef.value),
                evt.target as unknown as Node,
              );
              if (result) {
                popoverVisible.value = false;
              }
            }
          },
          { capture: true },
        );
      }
    },
    { immediate: true },
  );

  onUnmounted(() => {
    cleanup?.();
  });

  return {
    popoverVisible,
    setPopoverVisible,
  };
}
