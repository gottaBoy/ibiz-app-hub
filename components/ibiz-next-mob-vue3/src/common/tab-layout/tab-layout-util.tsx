/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { PropType } from 'vue';
import { ISysImage } from '@ibiz/model-core';

/**
 * 分页项数据接口
 * @interface ITabItemData
 */
interface ITabItemData {
  /** 唯一标识 */
  id: string;
  /** 显示文本 */
  text?: string;
  /** 图标资源信息 */
  icon?: ISysImage;
  /** 计数器数值 */
  counter: string | number | null;
  /** 是否隐藏 */
  isHidden?: boolean;
}

/**
 * 分页布局模式类型定义
 * @export
 */
export type LayoutMode =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'flow'
  | 'flow_noheader'
  | 'top_dropdownlist';

/**
 * 分页布局组件通用props
 * @export
 * @return {*}  {IData}
 */
export const layoutProps = {
  // 分页绘制数据集合
  tabPages: {
    type: Array as PropType<ITabItemData[]>,
    default: () => [],
  },
  // 分页标识激活名称
  activeName: {
    type: String,
    default: '',
  },
  // 布局模式
  layoutMode: {
    type: String as PropType<LayoutMode>,
    default: 'top',
  },
};

/**
 * 分页布局组件通用emits
 * @export
 * @return {*}
 */
export const layoutEmits = {
  /**
   * @description 分页标识变更事件
   */
  tabChange: (_tabTag: string) => true,
};

/**
 * 分页布局组件绘制通用方法
 * @export
 */
export function useLayoutRender(
  emit: (event: 'tabChange', _tabTag: string) => void,
): {
  onTabChange: (_tabTag: string) => void;
} {
  const onTabChange = (_tabTag: string) => {
    emit('tabChange', _tabTag);
  };
  return { onTabChange };
}
