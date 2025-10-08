/* eslint-disable @typescript-eslint/no-unused-vars */
import { App } from 'vue';
import './replace-default-demo.scss';
// import { registerControlProvider } from '@ibiz-template/runtime';
// import { ReplaceDefaultDemo } from './replace-default-demo';
// import { ReplaceDefaultDemoProvider } from './replace-default-demo.provider';

export default {
  install(app: App, params: IParams = {}): void {
    // // 全局注册表格插件组件
    // app.component(ReplaceDefaultDemo.name!, ReplaceDefaultDemo);
    // console.log('全局注册表格插件组件输入参数--------', params);
    // // 全局替换默认
    // if (params.replaceglobal && params.replaceglobal === 'true') {
    //   registerControlProvider('GRID', () => new ReplaceDefaultDemoProvider());
    // }
    // // 全局注册表格插件适配器，GRID_RENDER是插件类型，REPLACE_DEFAULT_DEMO是插件标识
    // registerControlProvider(
    //   'GRID_RENDER_REPLACE_DEFAULT_DEMO',
    //   () => new ReplaceDefaultDemoProvider(),
    // );
  },
};
