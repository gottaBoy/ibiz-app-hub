import { App } from 'vue';
import { registerDEMethodProvider } from '@ibiz-template/runtime';
import { DeActionPluginProvider } from './de-action-plugin.provider';

export default {
  install(_app: App): void {
    // 全局注册实体行为插件适配器, DEMETHOD是插件类型，R9DeActionPluginId是插件标识
    registerDEMethodProvider(
      'DEMETHOD_R9DeActionPluginId',
      () => new DeActionPluginProvider(),
    );
  },
};
