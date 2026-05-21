import {
  IDashboardController,
  IPortletContainerController,
  IPortletProvider,
  ChartPortletController,
} from '@ibiz-template/runtime';
import { IDBChartPortlet } from '@ibiz/model-core';

export class ChartPortletProvider implements IPortletProvider {
  component: string = 'IBizChartPortlet';

  async createController(
    portletModel: IDBChartPortlet,
    dashboard: IDashboardController,
    parent?: IPortletContainerController,
  ): Promise<ChartPortletController> {
    const c = new ChartPortletController(portletModel, dashboard, parent);
    await c.init();
    return c;
  }
}
