import { App } from 'vue';
import { registerControlProvider } from '@ibiz-template/runtime';
import { ControlPlugin } from './control-plugin';
import { ControlPluginProvider } from './control-plugin.provider';
import { registerControlLocale } from './locale';

export default {
  install(app: App): void {
    registerControlLocale();
    // 全局注册部件插件组件
    app.component(ControlPlugin.name!, ControlPlugin);
    // 全局注册部件插件适配器，CUSTOM是插件类型，R9ControlPluginId是插件标识
    registerControlProvider(
      'CUSTOM_R9ControlPluginId',
      () => new ControlPluginProvider(),
    );
  },
};
