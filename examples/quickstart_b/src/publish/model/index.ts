import { CodeListService } from '@ibiz-template/runtime';
import {
  IAppCodeList,
  IAppDataEntity,
  IApplication,
  IAppView,
} from '@ibiz/model-core';

export async function registerCodeList(
  codeListService: CodeListService,
): Promise<void> {
  const setCodeList = (model: IData) => {
    codeListService.setCodeList(model as IAppCodeList);
  };
}

export async function getAppDataEntityModel(
  name: string,
): Promise<IAppDataEntity> {
  const _name = name.toLowerCase();
  switch (_name) {
    case 'web.about':
    case 'about':
      return import('./entities/about').then(
        m => m.default as unknown as IAppDataEntity,
      );
    case 'web.master':
    case 'master':
      return import('./entities/master').then(
        m => m.default as unknown as IAppDataEntity,
      );
    default:
      throw new Error(`无法找到实体模型：${name}`);
  }
}
export async function getAppViewModel(name: string): Promise<IAppView> {
  const _name = name.toLowerCase();
  switch (_name) {
    case 'master_child_appb_view3':
      return import('./views/master-child-appb-view-3').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_child_appb_view5':
      return import('./views/master-child-appb-view-5').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_child_appb_view':
      return import('./views/master-child-appb-view').then(
        m => m.default as unknown as IAppView,
      );
    case 'welcome_appb':
      return import('./views/welcome-appb').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_child_appb_view2':
      return import('./views/master-child-appb-view-2').then(
        m => m.default as unknown as IAppView,
      );
    case 'master_child_appb_view4':
      return import('./views/master-child-appb-view-4').then(
        m => m.default as unknown as IAppView,
      );
    case 'admin_appb':
      return import('./views/admin-appb').then(
        m => m.default as unknown as IAppView,
      );
    default:
      throw new Error(`无法找到视图模型：${name}`);
  }
}

export async function getAppModel(): Promise<IApplication> {
  ibiz.hub.defaultAppIndexViewName = 'admin_appb';
  return import('./app/app').then(m => {
    const app = m.default as IData;
    // 设置应用原始模型到hub中
    ibiz.hub.setAppSourceModel(app.appId, app);
    app.appUtils?.forEach((util: IData) => {
      util.appId = app.appId;
    });
    // app.appId = undefined;
    return app as IApplication;
  });
}
