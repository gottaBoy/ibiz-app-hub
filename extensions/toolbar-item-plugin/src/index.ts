import { App } from 'vue';
import { registerToolbarItemProvider } from '@ibiz-template/runtime';
import { ToolbarItemPlugin } from './toolbar-item-plugin';
import { ToolbarItemPluginProvider } from './toolbar-item-plugin.provider';

export default {
  install(app: App): void {
    // 全局注册工具栏项插件组件
    app.component(ToolbarItemPlugin.name!, ToolbarItemPlugin);
    // 全局注册工具栏项插件适配器，TOOLBAR_ITEM是插件类型，R9ToolbarItemPluginId是插件标识
    registerToolbarItemProvider(
      'TOOLBAR_ITEM_R9ToolbarItemPluginId',
      () => new ToolbarItemPluginProvider(),
    );
  },
};
