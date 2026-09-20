import { App } from 'vue';
import { registerAcItemProvider } from '@ibiz-template/runtime';
import { AcItemPlugin } from './ac-item-plugin';
import { AcItemPluginProvider } from './ac-item-plugin.provider';
import { registerAcItemLocale } from './locale';

export default {
  install(app: App): void {
    registerAcItemLocale();
    // 全局注册自填列表项插件组件
    app.component(AcItemPlugin.name!, AcItemPlugin);
    // 全局注册自填列表项插件适配器，AC_ITEM是插件类型，R9AcItemPluginId是插件标识
    registerAcItemProvider(
      'AC_ITEM_R9AcItemPluginId',
      () => new AcItemPluginProvider(),
    );
  },
};
