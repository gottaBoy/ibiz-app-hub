import { registerPanelItemProvider } from '@ibiz-template/runtime';
import { App } from 'vue';
import { TopSideMenu } from './top-side-menu';
import { TopSideMenuProvider } from './top-side-menu.provider';

export default {
  install(app: App): void {
    // 注册组件
    app.component(TopSideMenu.name!, TopSideMenu);
    registerPanelItemProvider(
      'RAWITEM_TOP_SIDE_MENU',
      () => new TopSideMenuProvider(),
    );
    // Keep the historical key for models generated with the old prefix.
    registerPanelItemProvider(
      'RAWITEM_PREDEFINE_TOP_SIDE_MENU',
      () => new TopSideMenuProvider(),
    );
  },
};
