import { IApiPanelContainerState } from '../../../../interface';
import { PanelItemState } from '../panel/panel-item.state';

/**
 * @description 面板容器状态
 * @export
 * @class PanelContainerState
 * @extends {PanelItemState}
 * @implements {IPanelContainerState}
 */
export class PanelContainerState
  extends PanelItemState
  implements IApiPanelContainerState
{
  /**
   * @description 是否显示loading状态
   * @exposedoc
   * @type {boolean}
   * @memberof PanelContainerState
   */
  loading: boolean = false;
}
