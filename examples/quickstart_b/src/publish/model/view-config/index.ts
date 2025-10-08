import { IViewConfig } from '@ibiz-template/runtime';
import master_child_appb_view3 from './master-child-appb-view-3';
import master_child_appb_view5 from './master-child-appb-view-5';
import master_child_appb_view from './master-child-appb-view';
import welcome_appb from './welcome-appb';
import master_child_appb_view2 from './master-child-appb-view-2';
import master_child_appb_view4 from './master-child-appb-view-4';
import admin_appb from './admin-appb';

export async function initViewConfig(): Promise<void> {
  ibiz.hub.config.view.set(
    'web.master_child_appb_view3',
    master_child_appb_view3 as IViewConfig,
  );
  ibiz.hub.config.view.set(
    'web.master_child_appb_view5',
    master_child_appb_view5 as IViewConfig,
  );
  ibiz.hub.config.view.set(
    'web.master_child_appb_view',
    master_child_appb_view as IViewConfig,
  );
  ibiz.hub.config.view.set('web.welcome_appb', welcome_appb as IViewConfig);
  ibiz.hub.config.view.set(
    'web.master_child_appb_view2',
    master_child_appb_view2 as IViewConfig,
  );
  ibiz.hub.config.view.set(
    'web.master_child_appb_view4',
    master_child_appb_view4 as IViewConfig,
  );
  ibiz.hub.config.view.set('web.admin_appb', admin_appb as IViewConfig);
}
