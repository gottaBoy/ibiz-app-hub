import {
  IPanelItemProvider,
  PanelController,
  PanelItemController,
} from '@ibiz-template/runtime';
import { IPanelItem } from '@ibiz/model-core';
import { PanelItemPluginController } from './panel-item-plugin.controller';

export class PanelItemPluginProvider implements IPanelItemProvider {
  component: string = 'IBizPanelItemPlugin';

  async createController(
    panelItem: IPanelItem,
    panel: PanelController,
    parent: PanelItemController | undefined,
  ): Promise<PanelItemPluginController> {
    const c = new PanelItemPluginController(panelItem, panel, parent);
    await c.init();
    return c;
  }
}
