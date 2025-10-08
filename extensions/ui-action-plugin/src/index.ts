import { App } from 'vue';
import { registerUIActionProvider } from '@ibiz-template/runtime';
import { UiActionPluginProvider } from './ui-action-plugin.provider';

export default {
  install(_app: App): void {
    // 全局注册界面行为插件适配器，DEUIACTION是插件类型，R9ActionPluginId是插件标识
    registerUIActionProvider(
      'DEUIACTION_R9ActionPluginId',
      () => new UiActionPluginProvider(),
    );
  },
};
