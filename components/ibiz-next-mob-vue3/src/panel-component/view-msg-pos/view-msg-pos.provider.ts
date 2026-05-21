import {
  IPanelItemProvider,
  PanelController,
  PanelItemController,
} from '@ibiz-template/runtime';
import { IPanelItem } from '@ibiz/model-core';
import { ViewMsgPosController } from './view-msg-pos.controller';

/**
 * 预置视图消息适配器
 *
 * @author zk
 * @date 2024-01-25 02:01:01
 * @export
 * @class ViewMessageProvider
 * @implements {IPanelItemProvider}
 */
export class ViewMsgPosProvider implements IPanelItemProvider {
  component: string = 'IBizViewMsgPos';

  async createController(
    panelItem: IPanelItem,
    panel: PanelController,
    parent: PanelItemController | undefined,
  ): Promise<ViewMsgPosController> {
    const c = new ViewMsgPosController(panelItem, panel, parent);
    await c.init();
    return c;
  }
}
