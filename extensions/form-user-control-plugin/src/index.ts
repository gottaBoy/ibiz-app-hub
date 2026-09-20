import { App } from 'vue';
import { registerFormDetailProvider } from '@ibiz-template/runtime';
import { FormUserControlPlugin } from './form-user-control-plugin';
import { FormUserControlPluginProvider } from './form-user-control-plugin.provider';
import { registerFormUserControlLocale } from './locale';

export default {
  install(app: App): void {
    registerFormUserControlLocale();
    // 全局注册表单成员插件组件
    app.component(FormUserControlPlugin.name!, FormUserControlPlugin);
    // 全局注册表单成员插件适配器，FORM_USERCONTROL是插件类型，R9FormDetailPluginId是插件标识
    registerFormDetailProvider(
      'FORM_USERCONTROL_R9FormDetailPluginId',
      () => new FormUserControlPluginProvider(),
    );
  },
};
