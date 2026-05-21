import { PanelContainerState } from '@ibiz-template/runtime';

/**
 * 分页面板状态
 *
 * @author tony001
 * @date 2024-05-12 14:05:01
 * @export
 * @class PanelTabPanelState
 * @extends {PanelContainerState}
 */
export class PanelTabPanelState extends PanelContainerState {
  /**
   * @description 当前激活分页
   * @exposedoc
   * @type {string}
   * @memberof PanelTabPanelState
   */
  activeTab: string = '';
}
