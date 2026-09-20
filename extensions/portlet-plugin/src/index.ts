import { App } from 'vue';
import { registerPortletProvider } from '@ibiz-template/runtime';
import { PortletPlugin } from './portlet-plugin';
import { PortletPluginProvider } from './portlet-plugin.provider';
import { registerPortletLocale } from './locale';

export default {
  install(app: App): void {
    registerPortletLocale();
    // 全局注册门户部件插件组件
    app.component(PortletPlugin.name!, PortletPlugin);
    // 全局注册门户部件插件适配器，PORTLET_CUSTOM是插件类型，R9PortletPluginId是插件标识
    registerPortletProvider(
      'PORTLET_CUSTOM_R9PortletPluginId',
      () => new PortletPluginProvider(),
    );
  },
};
