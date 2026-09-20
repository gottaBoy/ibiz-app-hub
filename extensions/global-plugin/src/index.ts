import { App } from 'vue';
// import { IViewController } from '@ibiz-template/runtime';
// import { GridViewEngine } from './grid-view-engine';
import { registerGlobalPluginLocale } from './locale';
import './index.scss';

export default {
  install(_app: App): void {
    registerGlobalPluginLocale();
    // 替换标准的表格视图引擎
    // ibiz.engine.register(
    //   'VIEW_GridView',
    //   (c: IViewController) => new GridViewEngine(c),
    // );
  },
};
