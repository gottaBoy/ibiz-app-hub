import {
  IDashboardController,
  IPortletContainerController,
  IPortletProvider,
  ActionBarPortletController,
} from '@ibiz-template/runtime';
import { IDBToolbarPortlet } from '@ibiz/model-core';

export class ActionBarPortletProvider implements IPortletProvider {
  component: string = 'IBizActionBarPortlet';

  async createController(
    portletModel: IDBToolbarPortlet,
    dashboard: IDashboardController,
    parent?: IPortletContainerController,
  ): Promise<ActionBarPortletController> {
    const c = new ActionBarPortletController(portletModel, dashboard, parent);
    await c.init();
    return c;
  }
}
