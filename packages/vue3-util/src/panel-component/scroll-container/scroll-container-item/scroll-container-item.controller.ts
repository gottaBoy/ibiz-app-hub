import { IPanelContainer } from '@ibiz/model-core';
import {
  PanelContainerController,
  ViewLayoutPanelController,
} from '@ibiz-template/runtime';

/**
 * @description 面板滚动容器项控制器
 * @export
 * @class ScrollContainerItemController
 * @extends {PanelContainerController<IPanelContainer>}
 */
export class ScrollContainerItemController extends PanelContainerController<IPanelContainer> {
  /**
   * @description 视图布局面板部件控制器
   * @exposedoc
   * @type {ViewLayoutPanelController}
   * @memberof ScrollContainerItemController
   */
  declare panel: ViewLayoutPanelController;
}
