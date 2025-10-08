import { toRaw } from 'vue';
import useStore from '@/store';
import { type MoveSliderData } from '@/typings/data';
import { type LinkProps } from '@/typings/link';

export default () => {
  const { rootEmit } = useStore();

  const toRowData = (data?: any) => {
    return { ...toRaw(data) };
  };

  
  /**
   * 左侧表格头宽度拖动
   *
   * @param {*} column
   */
  function EmitHeaderDragend(index: number,width:number) {
    rootEmit.value?.('header-dragend', index,width);
  }

  /**
   * 点击行事件
   * @param row 该行的原始数据
   */
  function EmitRowClick(row: any) {
    rootEmit.value?.('row-click', toRowData(row));
  }

  /**
   * 双击行事件
   * @param row 该行的原始数据
   */
  function EmitRowDblClick(row: any) {
    rootEmit.value?.('row-dbl-click', toRowData(row));
  }

  /**
   * 选择行事件 checkbox
   * @param state 选择状态
   * @param list 该行的原始数据
   */
  function EmitRowChecked(state: boolean, data: any, list: any[] = []) {
    rootEmit.value?.('row-checked', state, toRowData(data), [
      toRowData(data),
      ...list.map(item => toRowData(item)),
    ]);
  }

  /**
   * 移动滑块事件
   * @param data 移动的所有原始数据集合（时间已被更新）。每一行包含旧时间
   */
  function EmitMoveSlider(data: MoveSliderData[]) {
    rootEmit.value?.(
      'move-slider',
      data.map(item => {
        return {
          row: toRowData(item.row),
          old: item.old,
        };
      }),
    );
  }

  /**
   * 添加连线事件
   */
  function EmitAddLink(
    link: LinkProps,
    data: { from: any; to: any; relationType: any },
    cb: (_link: LinkProps) => void,
  ) {
    rootEmit.value?.(
      'add-link',
      link,
      {
        from: toRowData(data.from),
        to: toRowData(data.to),
        relationType: data.relationType,
      },
      cb,
    );
  }

  /**
   * 点击连线事件
   */
  function EmitClickLink(link: LinkProps | null, _event?: MouseEvent) {
    rootEmit.value?.('click-link', link ? toRowData(link) : null, _event);
  }

  /**
   * 日期不存在当前组件中事件
   */
  function EmitNoDateError(date: Date) {
    rootEmit.value?.('no-date-error', date);
  }

  /**
   * 节点展开事件
   */
  function EmitNodeExpand(row: any) {
    rootEmit.value?.('node-expand', toRowData(row));
  }

  /**
   * 节点关闭事件
   */
  function EmitNodeCollapse(row: any) {
    rootEmit.value?.('node-collapse', toRowData(row));
  }

  /**
   * 拖拽改变
   */
  function EmitNodeDrop(draggingNode: any, dropNode: any, type: string) {
    rootEmit.value?.(
      'node-drop',
      toRowData(draggingNode),
      toRowData(dropNode),
      type,
    );
  }

  /**
   * 预加载表格值
   */
  function EmitVirtualTableChange(inView: any) {
    rootEmit.value?.('virtual-table-change', inView);
  }

  /**
   * 甘特图全屏改变事件
   */
  function EmitFullscreenChange(fullScreen: boolean) {
    rootEmit.value?.('fullscreen-change', fullScreen);
  }

  return {
    EmitRowClick,
    EmitRowDblClick,
    EmitRowChecked,
    EmitMoveSlider,
    EmitAddLink,
    EmitClickLink,
    EmitNoDateError,
    EmitNodeExpand,
    EmitNodeCollapse,
    EmitNodeDrop,
    EmitVirtualTableChange,
    EmitHeaderDragend,
    EmitFullscreenChange,
  };
};
