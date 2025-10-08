import { registerPanelItemProvider } from '@ibiz-template/runtime';
import { App } from 'vue';
import { PanelItemPlugin } from './panel-item-plugin';
import { PanelItemPluginProvider } from './panel-item-plugin.provider';

export default {
  install(app: App): void {
    // 全局注册面板项插件组件
    app.component(PanelItemPlugin.name!, PanelItemPlugin);
    // 全局注册面板项插件适配器，CUSTOM是插件类型，R9PanelItemPluginId是插件标识
    registerPanelItemProvider(
      'CUSTOM_R9PanelItemPluginId',
      () => new PanelItemPluginProvider(),
    );
  },
};
