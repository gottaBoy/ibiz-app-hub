import {
  IDashboardController,
  IPortletContainerController,
  IPortletProvider,
  RawItemPortletController,
} from '@ibiz-template/runtime';
import { IDBRawItemPortletPart } from '@ibiz/model-core';

export class RawItemPortletProvider implements IPortletProvider {
  component: string = 'IBizRawItemPortlet';

  async createController(
    portletModel: IDBRawItemPortletPart,
    dashboard: IDashboardController,
    parent?: IPortletContainerController,
  ): Promise<RawItemPortletController> {
    const c = new RawItemPortletController(portletModel, dashboard, parent);
    await c.init();
    return c;
  }
}
