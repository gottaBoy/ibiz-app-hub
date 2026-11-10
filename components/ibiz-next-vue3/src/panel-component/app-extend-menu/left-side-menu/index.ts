import { registerPanelItemProvider } from '@ibiz-template/runtime';
import { App } from 'vue';
import { LeftSideMenu } from './left-side-menu';
import { LeftSideMenuProvider } from './left-side-menu.provider';

export default {
  install(app: App): void {
    // 注册组件
    app.component(LeftSideMenu.name!, LeftSideMenu);
    registerPanelItemProvider(
      'RAWITEM_LEFT_SIDE_MENU',
      () => new LeftSideMenuProvider(),
    );
    // Keep the historical key for models generated with the old prefix.
    registerPanelItemProvider(
      'RAWITEM_PREDEFINE_LEFT_SIDE_MENU',
      () => new LeftSideMenuProvider(),
    );
  },
};
