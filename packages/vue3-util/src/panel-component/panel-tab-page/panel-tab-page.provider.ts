import {
  IPanelItemProvider,
  PanelContainerController,
  PanelController,
  PanelItemController,
} from '@ibiz-template/runtime';
import { IPanelItem } from '@ibiz/model-core';

/**
 * 面板分页适配器
 *
 * @export
 * @class PanelTabPageController
 * @implements {IPanelItemProvider}
 */
export class PanelTabPageProvider implements IPanelItemProvider {
  component: string = 'IBizPanelTabPage';

  async createController(
    panelItem: IPanelItem,
    panel: PanelController,
    parent: PanelItemController | undefined,
  ): Promise<PanelContainerController> {
    const c = new PanelContainerController(panelItem, panel, parent);
    await c.init();
    return c;
  }
}
