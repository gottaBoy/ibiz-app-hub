import { IPanelContainer } from '@ibiz/model-core';
import {
  PanelContainerController,
  ViewLayoutPanelController,
} from '@ibiz-template/runtime';

/**
 * @description 面板滚动容器控制器
 * @export
 * @class ScrollContainerController
 * @extends {PanelContainerController<IPanelContainer>}
 */
export class ScrollContainerController extends PanelContainerController<IPanelContainer> {
  /**
   * @description 视图布局面板部件控制器
   * @exposedoc
   * @export
   * @type {ViewLayoutPanelController}
   * @memberof ScrollContainerController
   */
  declare panel: ViewLayoutPanelController;

  protected async onInit(): Promise<void> {
    await super.onInit();
    // 滚动容器高宽默认占满
    this.state.layout.width = '100%';
    this.state.layout.height = '100%';
  }
}
