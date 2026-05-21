import {
  IPanelItemProvider,
  PanelController,
  PanelItemController,
} from '@ibiz-template/runtime';
import { IPanelContainer } from '@ibiz/model-core';
import { SplitContainerController } from './split-container.controller';

/**
 * 分割面板容器适配器
 *
 * @author zhanghengfeng
 * @date 2023-08-22 17:08:20
 * @export
 * @class SplitContainerProvider
 * @implements {IPanelItemProvider}
 */
export class SplitContainerProvider implements IPanelItemProvider {
  component: string = 'IBizSplitContainer';

  async createController(
    panelItem: IPanelContainer,
    panel: PanelController,
    parent: PanelItemController | undefined,
  ): Promise<SplitContainerController> {
    const c = new SplitContainerController(panelItem, panel, parent);
    await c.init();
    return c;
  }
}
