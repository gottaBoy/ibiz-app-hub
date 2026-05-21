import {
  IDashboardController,
  IPortletContainerController,
  IPortletProvider,
  HtmlPortletController,
} from '@ibiz-template/runtime';
import { IDBHtmlPortletPart } from '@ibiz/model-core';

export class HtmlPortletProvider implements IPortletProvider {
  component: string = 'IBizHtmlPortlet';

  async createController(
    portletModel: IDBHtmlPortletPart,
    dashboard: IDashboardController,
    parent?: IPortletContainerController,
  ): Promise<HtmlPortletController> {
    const c = new HtmlPortletController(portletModel, dashboard, parent);
    await c.init();
    return c;
  }
}
