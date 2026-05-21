import { IPanelItem } from '@ibiz/model-core';
import {
  IPanelItemProvider,
  PanelController,
  PanelItemController,
} from '@ibiz-template/runtime';
import { SettingContainerController } from './setting-container.controller';

export class SettingContainerProvider implements IPanelItemProvider {
  component: string = 'IBizSettingContainer';

  async createController(
    panelItem: IPanelItem,
    panel: PanelController,
    parent: PanelItemController | undefined,
  ): Promise<SettingContainerController> {
    const c = new SettingContainerController(panelItem, panel, parent);
    await c.init();
    return c;
  }
}
