import { IButtonContainerState, PanelItemState } from '@ibiz-template/runtime';

/**
 * 面板按钮组状态
 *
 * @export
 * @class PanelButtonListState
 * @extends {PanelItemState}
 */
export class PanelButtonListState extends PanelItemState {
  /**
   * @description 按钮组状态
   * @exposedoc
   * @type {IButtonContainerState}
   * @memberof PanelButtonListState
   */
  buttonsState!: IButtonContainerState;
}
