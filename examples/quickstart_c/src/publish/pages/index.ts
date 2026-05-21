/* eslint-disable prettier/prettier */
import { Component, defineAsyncComponent } from 'vue';

function calcAppViewId(tag: string): string {
  let id = '';
  if (tag.indexOf('.') !== -1) {
    const ids = tag.split('.');
    id = ids[ids.length - 1];
  } else {
    id = tag.toLowerCase();
  }
  return id;
}

export async function getAppViewComponent(
  name: string,
  appId: string,
): Promise<Component> {
  const _name = calcAppViewId(name).toLowerCase();
  // 子应用视图
  if (appId !== ibiz.env.appId) {
    return defineAsyncComponent(
      () => import('../../components/sub-app-view/sub-app-view.vue'),
    );
  }
  switch (_name) {
    case 'master_child_appc_view2':
      return defineAsyncComponent(
        () =>
          import('./master/master-child-appc-view-2/master-child-appc-view-2.vue'),
      );
    case 'welcome_appc':
      return defineAsyncComponent(
        () => import('./about/welcome-appc/welcome-appc.vue'),
      );
    case 'master_child_appc_view':
      return defineAsyncComponent(
        () =>
          import('./master/master-child-appc-view/master-child-appc-view.vue'),
      );
    case 'master_child_appc_view3':
      return defineAsyncComponent(
        () =>
          import('./master/master-child-appc-view-3/master-child-appc-view-3.vue'),
      );
    case 'admin_appc':
      return defineAsyncComponent(() => import('./admin-appc/admin-appc.vue'));
    default:
      throw new Error(`无法找到视图模型：${name}`);
  }
}
