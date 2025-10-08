import { App } from 'vue';
import { registerUILogicNodeProvider } from '@ibiz-template/runtime';
import { UiLogicNodePluginProvider } from './ui-logic-node-plugin.provider';

export default {
  install(_app: App): void {
    // 全局注册界面逻辑节点插件适配器，UILOGICNODE是插件类型，R9UILogicPluginId是插件标识
    registerUILogicNodeProvider(
      'UILOGICNODE_R9UILogicPluginId',
      () => new UiLogicNodePluginProvider(),
    );
  },
};
