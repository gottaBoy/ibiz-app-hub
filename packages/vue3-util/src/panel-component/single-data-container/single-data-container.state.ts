import { PanelContainerState } from '@ibiz-template/runtime';

/**
 * @description 单项数据容器状态
 * @export
 * @class SingleDataContainerState
 * @extends {PanelContainerState}
 */
export class SingleDataContainerState extends PanelContainerState {
  /**
   * @description 单项数据容器数据
   * @exposedoc
   * @type {IData}
   * @memberof SingleDataContainerState
   */
  data: IData = {};
}
