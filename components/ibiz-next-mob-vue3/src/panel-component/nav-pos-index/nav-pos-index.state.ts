import { INavViewMsg, PanelItemState } from '@ibiz-template/runtime';

/**
 * 导航占位状态
 *
 * @author lxm
 * @date 2023-02-07 06:04:27
 * @export
 * @class NavPosIndexState
 * @extends {PanelItemState}
 */
export class NavPosIndexState extends PanelItemState {
  /**
   * @description 当前导航视图标识
   * @exposedoc
   * @type {string}
   */
  currentKey: string = '';

  /**
   * @description 缓存的视图标识
   * @exposedoc
   * @type {string[]}
   */
  cacheKeys: string[] = ['RouterShell'];

  /**
   * @description 导航视图详细信息
   * @exposedoc
   * @type {INavViewMsg[]}
   */
  navViewMsgs: { [p: string]: INavViewMsg } = {};

  /**
   * @description 导航的视图的操作顺序
   * @exposedoc
   * @type {string[]}
   */
  operateSort: string[] = [];
}
