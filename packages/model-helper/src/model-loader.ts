import { ModelLoaderProvider } from '@ibiz-template/runtime';
import {
  IApplication,
  IAppView,
  IAppDataEntity,
  IAppBIScheme,
  IAppBICube,
  IAppBIReport,
  ISubAppRef,
  IAppCodeList,
} from '@ibiz/model-core';
import { ModelHelper } from './model-helper';

/**
 * 模型加载适配器
 *
 * @author chitanda
 * @date 2023-04-17 23:04:44
 * @export
 * @class ModelLoader
 * @implements {ModelLoaderProvider}
 */
export class ModelLoader implements ModelLoaderProvider {
  constructor(protected helper: ModelHelper) {}

  initApp(id?: string): Promise<boolean> {
    return this.helper.initApp(id);
  }

  getApp(id?: string): Promise<IApplication> {
    return this.helper.getAppModel(id);
  }

  getSubAppRef(appId: string): Promise<ISubAppRef | undefined> {
    return this.helper.getSubAppRef(appId);
  }

  getAppView(appId: string, codeName: string): Promise<IAppView> {
    return this.helper.getAppViewModel(codeName, appId);
  }

  getAppDataEntity(appId: string, id: string): Promise<IAppDataEntity> {
    return this.helper.getAppDataEntityModel(id, appId);
  }

  getAppDataEntityByCodeName(
    appId: string,
    codeName: string,
  ): Promise<IAppDataEntity> {
    return this.helper.getAppDataEntityModel(codeName, appId, false);
  }

  getAppStyle(appId: string): Promise<string | null> {
    return this.helper.getAppStyle(appId);
  }

  loadAppView(
    appId: string,
    viewId: string,
    params: IParams,
  ): Promise<IAppView> {
    return this.helper.loadAppViewModel(viewId, params, appId);
  }

  getAppBISchemes(appId: string, ids: string[]): Promise<IAppBIScheme[]> {
    return this.helper.getAppBISchemes(appId, ids);
  }

  getAppAppBICubes(appId: string, ids: string[]): Promise<IAppBICube[]> {
    return this.helper.getAppAppBICubes(appId, ids);
  }

  getAppBIReports(appId: string, ids: string[]): Promise<IAppBIReport[]> {
    return this.helper.getAppBIReports(appId, ids);
  }

  translationModelToDsl(
    data: IData,
    type: 'APP' | 'VIEW' | 'CTRL' | 'APPENTITY' | 'APPBIREPORT',
  ): Promise<IModel | undefined> {
    return this.helper.translationModelToDsl(data, type);
  }

  mergeSubAppCodeList(codeList: IAppCodeList): void {
    this.helper.mergeSubAppCodeList(codeList);
  }
}
