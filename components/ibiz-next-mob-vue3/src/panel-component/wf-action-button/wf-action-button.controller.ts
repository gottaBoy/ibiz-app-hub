import {
  PanelItemController,
  ViewLayoutPanelController,
} from '@ibiz-template/runtime';
import { IPanelButton } from '@ibiz/model-core';
import { WFActionButtonState } from './wf-action-button.state';

/**
 * 面板按钮控制器
 *
 * @export
 * @class WFActionButtonController
 * @extends {PanelItemController<IPanelButton>}
 */
export class WFActionButtonController extends PanelItemController<IPanelButton> {
  declare state: WFActionButtonState;

  protected createState(): WFActionButtonState {
    return new WFActionButtonState(this.parent?.state);
  }

  /**
   * @description 面板控制器
   * @exposedoc
   * @type {ViewLayoutPanelController}
   * @memberof WFActionButtonController
   */
  declare panel: ViewLayoutPanelController;

  /**
   * @description 工作流动态按钮
   * @exposedoc
   * @readonly
   * @type {IData[]}
   * @memberof WFActionButtonController
   */
  get wfButtons(): IData[] {
    return this.state.wfButtons;
  }

  /**
   * 初始化wf按钮
   *
   * @author zk
   * @date 2023-11-09 11:11:50
   * @param {IData[]} items
   * @memberof WFActionButtonController
   */
  initWFButtons(items: IData[]): void {
    this.state.wfButtons = items;
  }
}
