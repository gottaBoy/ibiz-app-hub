import { registerPortletProvider } from '@ibiz-template/runtime';
import { withInstall } from '@ibiz-template/vue3-util';
import { App } from 'vue';
import { HtmlPortlet } from './html-portlet';
import { HtmlPortletProvider } from './html-portlet.provider';

export * from './html-portlet';

export const IBizHtmlPortlet = withInstall(HtmlPortlet, function (v: App) {
  v.component(HtmlPortlet.name, HtmlPortlet);
  registerPortletProvider('HTML', () => new HtmlPortletProvider());
});

export default IBizHtmlPortlet;
