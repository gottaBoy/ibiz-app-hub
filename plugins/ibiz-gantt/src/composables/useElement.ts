import Variables from '@/constants/vars';
import useStore from '@/store';
import useParam from './useParam';

export default () => {
  const { $param } = useParam();
  const { tableHeaderRef, ganttHeaderRef, ganttBodyRef, ganttRef } = useStore();

  function getMaxHeaderHeight() {
    return Math.max(
      tableHeaderRef.value?.clientHeight ?? 0,
      ganttHeaderRef.value?.clientHeight ?? 0,
      Variables.default.headerHeight,
    );
  }

  function updateHeaderHeight() {
    if (!$param.headerHeight) return;

    const maxHeight = getMaxHeaderHeight();
    if ($param.headerHeight !== maxHeight) {
      $param.headerHeight = maxHeight;
    }
  }

  function linkLineMouseenter(_e: any): void {
    // 用于处理移入链接线后，增加该线的显示层级
    const linkElement = _e.currentTarget;
    const container = _e.target?.closest('.xg-gantt-body-line-wrap');
    if (linkElement && container?.contains(linkElement)) {
      // 检查当前元素是否已经是最后一个子元素
      if (linkElement !== container.lastElementChild) {
        // 将元素移动到容器最后
        container.appendChild(linkElement);
      }
    }
  }

  return {
    tableHeaderRef,
    ganttHeaderRef,
    ganttBodyRef,
    ganttRef,
    getMaxHeaderHeight,
    updateHeaderHeight,
    linkLineMouseenter,
  };
};
