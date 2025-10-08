import {
  IPanelItemProvider,
  PanelController,
  PanelItemController,
} from '@ibiz-template/runtime';
import { IPanelItem } from '@ibiz/model-core';
import { PanelIndexViewSearchController } from './panel-index-view-search.controller';

/**
 * 面板首页搜索适配器
 *
 * @export
 * @class PanelIndexViewSearchProvider
 * @implements {IPanelItemProvider}
 */
export class PanelIndexViewSearchProvider implements IPanelItemProvider {
  component: string = 'IBizPanelIndexViewSearch';

  async createController(
    panelItem: IPanelItem,
    panel: PanelController,
    parent: PanelItemController | undefined,
  ): Promise<PanelIndexViewSearchController> {
    const c = new PanelIndexViewSearchController(panelItem, panel, parent);
    await c.init();
    return c;
  }
}
