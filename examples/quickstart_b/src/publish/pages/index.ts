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
    case 'master_child_appb_view3':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-child-appb-view-3/master-child-appb-view-3.vue'
          ),
      );
    case 'master_child_appb_view5':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-child-appb-view-5/master-child-appb-view-5.vue'
          ),
      );
    case 'master_child_appb_view':
      return defineAsyncComponent(
        () =>
          import('./master/master-child-appb-view/master-child-appb-view.vue'),
      );
    case 'welcome_appb':
      return defineAsyncComponent(
        () => import('./about/welcome-appb/welcome-appb.vue'),
      );
    case 'master_child_appb_view2':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-child-appb-view-2/master-child-appb-view-2.vue'
          ),
      );
    case 'master_child_appb_view4':
      return defineAsyncComponent(
        () =>
          import(
            './master/master-child-appb-view-4/master-child-appb-view-4.vue'
          ),
      );
    case 'admin_appb':
      return defineAsyncComponent(() => import('./admin-appb/admin-appb.vue'));
    default:
      throw new Error(`无法找到视图模型：${name}`);
  }
}
