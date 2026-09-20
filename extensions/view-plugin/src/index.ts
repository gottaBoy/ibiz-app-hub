import { App } from 'vue';
import { registerViewProvider } from '@ibiz-template/runtime';
import { ViewPlugin } from './view-plugin';
import { ViewPluginProvider } from './view-plugin.provider';
import { registerViewPluginLocale } from './locale';

export default {
  install(app: App): void {
    registerViewPluginLocale();
    // 全局注册视图插件组件
    app.component(ViewPlugin.name!, ViewPlugin);
    // 全局注册视图插件适配器，VIEW_CUSTOM是插件类型，R9ViewPluginId是插件标识
    registerViewProvider(
      'VIEW_CUSTOM_R9ViewPluginId',
      () => new ViewPluginProvider(),
    );
  },
};

export {
  normalizeViewPluginLocale,
  registerViewPluginLocale,
  viewPluginEn,
  viewPluginLocale,
  viewPluginT,
  viewPluginZhCN,
} from './locale';
