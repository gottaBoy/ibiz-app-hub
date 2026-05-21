import {
  PanelController,
  IPanelItemProvider,
  PanelItemController,
} from '@ibiz-template/runtime';
import { IPanelItem } from '@ibiz/model-core';
import { ThemeTogglingController } from './theme-toggling.controller';

/**
 * @description 主题切换适配器
 * @export
 * @class ThemeTogglingProvider
 * @implements {IPanelItemProvider}
 */
export class ThemeTogglingProvider implements IPanelItemProvider {
  component: string = 'IBizThemeToggling';

  async createController(
    panelItem: IPanelItem,
    panel: PanelController,
    parent: PanelItemController | undefined,
  ): Promise<ThemeTogglingController> {
    const c = new ThemeTogglingController(panelItem, panel, parent);
    await c.init();
    return c;
  }
}
