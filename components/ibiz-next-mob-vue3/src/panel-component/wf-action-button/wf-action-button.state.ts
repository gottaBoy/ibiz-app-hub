import { PanelItemState } from '@ibiz-template/runtime';

/**
 * 面板按钮状态
 *
 * @author lxm
 * @date 2023-02-07 06:04:27
 * @export
 * @class PanelButtonState
 * @extends {PanelItemState}
 */
export class WFActionButtonState extends PanelItemState {
  /**
   * @description 工作流按钮数组
   * @exposedoc
   * @type {IData[]}
   * @memberof WFActionButtonState
   */
  wfButtons: IData[] = [];
}
