import 'vue';
import { IApiAppHubService } from '@ibiz-template/runtime';
import { AppHooks } from '@ibiz-template/vue3-util';
import { runApp } from '@ibiz-template/vue3-components';
import VueTextFormat from 'vue-text-format';
import gridLayout from 'vue-grid-layout';
import UserRegister from './user-register';
import ComponentsRegister from './components';
import { StaticAuthGuard } from './guard';
import { userRoutes } from './router';
import '@/publish/sys.css';

AppHooks.appResorceInited.tap((ctx: IApiAppHubService) => {
  ctx.microAppConfigCenter.registerMicroApps([
    {
      name: 'quickstart_b',
      entry: 'https://open.ibizlab.cn/quickstart-b',
      baseUrl: '40304a61a33787c9d63e46e7ea080e92__web__web',
      pluginBaseUrl: './plugins',
    },
    {
      name: 'quickstart_c',
      entry: 'https://open.ibizlab.cn/quickstart-c',
      baseUrl: 'e6d8a24ed14573deb406211a9dc80c2e__web__web',
      pluginBaseUrl: './plugins',
    },
  ]);
});
runApp([VueTextFormat, gridLayout, ComponentsRegister, UserRegister], {
  getAuthGuard: () => new StaticAuthGuard(),
  userRoutes,
});
