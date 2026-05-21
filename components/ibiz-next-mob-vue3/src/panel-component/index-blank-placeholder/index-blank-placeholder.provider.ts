import {
  IPanelItemProvider,
  PanelController,
  PanelItemController,
} from '@ibiz-template/runtime';
import { IPanelContainer } from '@ibiz/model-core';
import { IndexBlankPlaceholderController } from './index-blank-placeholder.controller';

/**
 * 首页空白占位适配器
 *
 * @export
 * @class IndexBlankPlaceholderProvider
 * @implements {IPanelItemProvider}
 */
export class IndexBlankPlaceholderProvider implements IPanelItemProvider {
  component: string = 'IBizIndexBlankPlaceholder';

  async createController(
    panelItem: IPanelContainer,
    panel: PanelController,
    parent: PanelItemController | undefined,
  ): Promise<IndexBlankPlaceholderController> {
    const c = new IndexBlankPlaceholderController(panelItem, panel, parent);
    await c.init();
    return c;
  }
}
