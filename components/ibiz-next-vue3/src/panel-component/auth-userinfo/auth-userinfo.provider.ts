import {
  IPanelItemProvider,
  PanelController,
  PanelItemController,
} from '@ibiz-template/runtime';
import { IPanelItem } from '@ibiz/model-core';
import { AuthUserinfoController } from './auth-userinfo.controller';

/**
 * 用户信息适配器
 *
 * @author lxm
 * @date 2022-09-19 22:09:03
 * @export
 * @class AuthUserinfoProvider
 * @implements {EditorProvider}
 */
export class AuthUserinfoProvider implements IPanelItemProvider {
  component: string = 'IBizAuthUserinfo';

  async createController(
    panelItem: IPanelItem,
    panel: PanelController,
    parent: PanelItemController | undefined,
  ): Promise<AuthUserinfoController> {
    const c = new AuthUserinfoController(panelItem, panel, parent);
    await c.init();
    return c;
  }
}
