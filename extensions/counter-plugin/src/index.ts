import { App } from 'vue';
import { registerAppCounterProvider } from '@ibiz-template/runtime';
import { CounterPluginProvider } from './counter-plugin.provider';

export default {
  install(_app: App): void {
    // 全局注册计数器插件适配器, APPCOUNTER是插件类型，R9CounterPluginId是插件标识
    registerAppCounterProvider(
      'APPCOUNTER_R9CounterPluginId',
      () => new CounterPluginProvider(),
    );
  },
};
