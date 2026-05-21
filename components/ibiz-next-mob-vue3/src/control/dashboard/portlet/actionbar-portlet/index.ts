import { registerPortletProvider } from '@ibiz-template/runtime';
import { withInstall } from '@ibiz-template/vue3-util';
import { App } from 'vue';
import { ActionBarPortlet } from './actionbar-portlet';
import { ActionBarPortletProvider } from './actionbar-portlet.provider';

export * from './actionbar-portlet';

export const IBizActionBarPortlet = withInstall(
  ActionBarPortlet,
  function (v: App) {
    v.component(ActionBarPortlet.name, ActionBarPortlet);
    registerPortletProvider('ACTIONBAR', () => new ActionBarPortletProvider());
  },
);

export default IBizActionBarPortlet;
