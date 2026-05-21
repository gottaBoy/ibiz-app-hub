import { registerPortletProvider } from '@ibiz-template/runtime';
import { withInstall } from '@ibiz-template/vue3-util';
import { App } from 'vue';
import { RawItemPortlet } from './rawitem-portlet';
import { RawItemPortletProvider } from './rawitem-portlet.provider';

export * from './rawitem-portlet';

export const IBizRawItemPortlet = withInstall(
  RawItemPortlet,
  function (v: App) {
    v.component(RawItemPortlet.name, RawItemPortlet);
    registerPortletProvider('RAWITEM', () => new RawItemPortletProvider());
  },
);

export default IBizRawItemPortlet;
