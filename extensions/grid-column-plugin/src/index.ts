import { App } from 'vue';
import { registerGridColumnProvider } from '@ibiz-template/runtime';
import { GridColumnPlugin } from './grid-column-plugin';
import { GridColumnPluginProvider } from './grid-column-plugin.provider';

export default {
  install(app: App): void {
    // 全局注册表格列插件组件
    app.component(GridColumnPlugin.name!, GridColumnPlugin);
    // 全局注册表格列插件适配器，GRID_COLRENDER是插件类型，R9GridColumnPluginId是插件标识
    registerGridColumnProvider(
      'GRID_COLRENDER_R9GridColumnPluginId',
      () => new GridColumnPluginProvider(),
    );
  },
};
