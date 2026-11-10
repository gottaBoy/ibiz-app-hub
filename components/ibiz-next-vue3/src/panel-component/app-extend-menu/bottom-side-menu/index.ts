import { registerPanelItemProvider } from '@ibiz-template/runtime';
import { App } from 'vue';
import { BottomSideMenu } from './bottom-side-menu';
import { BottomSideMenuProvider } from './bottom-side-menu.provider';

export default {
  install(app: App): void {
    // 注册组件
    app.component(BottomSideMenu.name!, BottomSideMenu);
    registerPanelItemProvider(
      'RAWITEM_BOTTOM_SIDE_MENU',
      () => new BottomSideMenuProvider(),
    );
    // Keep the historical key for models generated with the old prefix.
    registerPanelItemProvider(
      'RAWITEM_PREDEFINE_BOTTOM_SIDE_MENU',
      () => new BottomSideMenuProvider(),
    );
  },
};
