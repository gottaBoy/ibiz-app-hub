import { IViewConfig } from '@ibiz-template/runtime';
import master_child_appc_view2 from './master-child-appc-view-2';
import welcome_appc from './welcome-appc';
import master_child_appc_view from './master-child-appc-view';
import master_child_appc_view3 from './master-child-appc-view-3';
import admin_appc from './admin-appc';

export async function initViewConfig(): Promise<void> {
  ibiz.hub.config.view.set(
    'web.master_child_appc_view2',
    master_child_appc_view2 as IViewConfig,
  );
  ibiz.hub.config.view.set('web.welcome_appc', welcome_appc as IViewConfig);
  ibiz.hub.config.view.set(
    'web.master_child_appc_view',
    master_child_appc_view as IViewConfig,
  );
  ibiz.hub.config.view.set(
    'web.master_child_appc_view3',
    master_child_appc_view3 as IViewConfig,
  );
  ibiz.hub.config.view.set('web.admin_appc', admin_appc as IViewConfig);
}
