import { registerPortletProvider } from '@ibiz-template/runtime';
import { withInstall } from '@ibiz-template/vue3-util';
import { App } from 'vue';
import { ChartPortlet } from './chart-portlet';
import { ChartPortletProvider } from './chart-portlet.provider';

export * from './chart-portlet';

export const IBizChartPortlet = withInstall(ChartPortlet, function (v: App) {
  v.component(ChartPortlet.name, ChartPortlet);
  registerPortletProvider('CHART', () => new ChartPortletProvider());
});

export default IBizChartPortlet;
