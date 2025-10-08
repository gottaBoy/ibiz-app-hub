import {
  IDashboardController,
  IPortletContainerController,
  IPortletProvider,
} from '@ibiz-template/runtime';
import { IDBPortletPart } from '@ibiz/model-core';
import { PortletPluginController } from './portlet-plugin.controller';

export class PortletPluginProvider implements IPortletProvider {
  component: string = 'IBizPortletPlugin';

  async createController(
    portletModel: IDBPortletPart,
    dashboard: IDashboardController,
    parent?: IPortletContainerController,
  ): Promise<PortletPluginController> {
    const c = new PortletPluginController(portletModel, dashboard, parent);
    await c.init();
    return c;
  }
}
