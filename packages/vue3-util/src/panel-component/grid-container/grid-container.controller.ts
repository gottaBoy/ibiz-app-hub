import { PanelContainerController } from '@ibiz-template/runtime';
import { IPanelContainer } from '@ibiz/model-core';
import { GridContainerState } from './grid-container.state';

/**
 * 面板栅格容器控制器
 *
 * @export
 * @class GridContainerController
 * @extends {PanelContainerController}
 */
export class GridContainerController extends PanelContainerController<IPanelContainer> {
  /**
   * @description  面板栅格容器状态
   * @exposedoc
   * @type {GridContainerState}
   * @memberof GridContainerController
   */
  declare state: GridContainerState;

  protected createState(): GridContainerState {
    return new GridContainerState(this.parent?.state);
  }
}
