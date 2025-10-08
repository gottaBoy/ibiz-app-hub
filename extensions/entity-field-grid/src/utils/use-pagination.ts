import {
  ControlVO,
  GridController,
  GridRowState,
  IMDControlController,
} from '@ibiz-template/runtime';
import { chunk } from 'lodash-es';

/**
 * 使用分页组件
 *
 * @author lxm
 * @date 2022-09-06 17:09:09
 * @export
 * @param {GridController} c
 * @returns {*}
 */
export function usePagination(c: IMDControlController): {
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onPageRefresh: () => void;
} {
  // 初始化表格项
  const initGridItems = () => {
    const controller = c as GridController;
    if (Array.isArray(controller.state.simpleData)) {
      controller.state.items =
        chunk(controller.state.simpleData, controller.state.size)[
          controller.state.curPage - 1
        ] || [];
      controller.state.rows = controller.state.items.map(item => {
        const row = new GridRowState(new ControlVO(item), controller);
        return row;
      });
    }
  };

  function onPageChange(page: number): void {
    if (!page || page === c.state.curPage) {
      return;
    }
    c.state.curPage = page;
    if (c.runMode === 'DESIGN') {
      initGridItems();
      return;
    }
    c.load();
  }

  function onPageSizeChange(size: number): void {
    if (!size || size === c.state.size) {
      return;
    }
    c.state.size = size;
    if (c.runMode === 'DESIGN') {
      initGridItems();
      return;
    }
    // 当page为第一页的时候切换size不会触发pageChange，需要自己触发加载
    if (c.state.curPage !== 1) {
      c.state.curPage = 1;
    }
    c.load();
  }

  function onPageRefresh(): void {
    c.load();
  }
  return { onPageChange, onPageSizeChange, onPageRefresh };
}
