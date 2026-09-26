import {
  IPanelItemProvider,
  PanelController,
  PanelItemController,
} from '@ibiz-template/runtime';
import { IPanelContainer } from '@ibiz/model-core';
import { PanelContainerGroupController } from './panel-container-group.controller';

/**
 * 面板分组容器适配器
 *
 * @author lxm
 * @date 2022-09-19 22:09:03
 * @export
 * @class PanelContainerGroupProvider
 * @implements {EditorProvider}
 */
export class PanelContainerGroupProvider implements IPanelItemProvider {
  component: string = 'IBizPanelContainerGroup';

  async createController(
    panelItem: IPanelContainer,
    panel: PanelController,
    parent: PanelItemController | undefined,
  ): Promise<PanelItemController> {
    const c = new PanelContainerGroupController(panelItem, panel, parent);
    await c.init();
    return c;
  }
}
