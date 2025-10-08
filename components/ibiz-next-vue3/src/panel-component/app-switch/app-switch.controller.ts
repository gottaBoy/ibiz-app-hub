/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { notNilEmpty } from 'qx-util';
import {
  IApiMicroApp,
  IViewController,
  PanelItemController,
  UtilService,
} from '@ibiz-template/runtime';
import { IAppIndexView, IPanelRawItem } from '@ibiz/model-core';
import { route2routePath, routePath2string } from '@ibiz-template/vue3-util';
import { Router } from 'vue-router';
import { AppSwitchState } from './app-switch.state';

/**
 * @description 应用切换器控制器
 * @export
 * @class AppSwitchController
 * @extends {PanelItemController<IPanelRawItem>}
 */
export class AppSwitchController extends PanelItemController<IPanelRawItem> {
  /**
   * @description 状态对象
   * @type {AppSwitchState}
   * @memberof AppSwitchController
   */
  declare state: AppSwitchState;

  /**
   * @description 自定义补充参数
   * @protected
   * @type {IData}
   * @memberof AppSwitchController
   */
  protected rawItemParams: IData = {};

  /**
   * @description 应用功能组件服务
   * @protected
   * @type {(UtilService | undefined)}
   * @memberof AppSwitchController
   */
  protected util: UtilService | undefined;

  /**
   * @description 数据来源
   * @type {('UTIL' | 'REFAPP')} 功能组件服务 | 引用子应用集
   * @memberof AppSwitchController
   */
  public sourceType: 'UTIL' | 'REFAPP' = 'REFAPP';

  /**
   * @description 获取当前视图
   * @readonly
   * @type {IViewController}
   * @memberof AppSwitchController
   */
  get view(): IViewController {
    return this.panel.view;
  }

  /**
   * @description 上下文对象
   * @readonly
   * @type {IContext}
   * @memberof AppSwitchController
   */
  get context(): IContext {
    return this.panel.context;
  }

  /**
   * @description 创建状态对象
   * @protected
   * @returns {*}  {AppSwitchState}
   * @memberof AppSwitchController
   */
  protected createState(): AppSwitchState {
    return new AppSwitchState(this.parent?.state);
  }

  /**
   * @description  初始化
   * @protected
   * @returns {*}  {Promise<void>}
   * @memberof AppSwitchController
   */
  protected async onInit(): Promise<void> {
    await super.onInit();
    this.handleRawItemParams();
    this.state.visible = (this.view.model as IAppIndexView).appSwitchMode === 1;
    if (!this.state.visible) return;
    this.state.items = await this.loadAllApps();
    this.initActiveMicroAppId();
  }

  /**
   * @description 处理自定义补充参数
   * @protected
   * @memberof AppSwitchController
   */
  protected handleRawItemParams(): void {
    let params = {};
    const rawItemParams = this.model.rawItem?.rawItemParams;
    if (notNilEmpty(rawItemParams)) {
      params = rawItemParams!.reduce((param: IData, item) => {
        param[item.key!.toLowerCase()] = item.value;
        return param;
      }, {});
    }
    Object.assign(this.rawItemParams, params);
    this.sourceType = this.rawItemParams.sourcetype || 'REFAPP';
  }

  /**
   * @description 加载所有应用
   * @exposedoc
   * @public
   * @returns {*}  {Promise<IApiMicroApp[]>}
   * @memberof AppSwitchController
   */
  public async loadAllApps(): Promise<IApiMicroApp[]> {
    if (this.sourceType === 'UTIL') {
      return this.loadAppsWithUtil();
    }
    return this.loadAppsWithRefApp();
  }

  /**
   * @description 初始化当前激活的应用标识
   * @protected
   * @memberof AppSwitchController
   */
  protected initActiveMicroAppId(): void {
    if (this.view && this.state.items.length > 0) {
      const activeMicroApp = this.state.items.find(
        item => item.indexViewName === this.view.model.codeName?.toLowerCase(),
      );
      if (activeMicroApp) {
        this.setActiveMicroAppId(activeMicroApp.id);
      }
    }
  }

  /**
   * @description 设置当前激活的应用标识
   * @exposedoc
   * @param {string} key
   * @memberof AppSwitchController
   */
  public setActiveMicroAppId(key: string): void {
    ibiz.hub.activeMicroAppId = key;
    this.state.activeMicroAppId = key;
  }

  /**
   * @description 加载应用(功能组件方式)
   * @protected
   * @returns {*}  {Promise<IApiMicroApp[]>}
   * @memberof AppSwitchController
   */
  protected async loadAppsWithUtil(): Promise<IApiMicroApp[]> {
    const result: IApiMicroApp[] = [];
    if (!this.util) {
      // 获取默认应用功能组件
      const app = ibiz.hub.getApp(ibiz.env.appId);
      const hubAppUtil = app.getAppUtil('HUBAPP', 'CUSTOM');
      if (!hubAppUtil) {
        return result;
      }
      this.util = new UtilService(hubAppUtil);
    }
    const data = await this.util.load('', this.context, this.panel.params);
    if (!data || data.length === 0) {
      return result;
    }
    const defaultAppModel = ibiz.hub.getAppSourceModel(ibiz.env.appId);
    const allPSSubAppRefs = defaultAppModel.getAllPSSubAppRefs;
    for (let i = 0; i < data.length; i++) {
      // 识别子应用标识应当识别简略模式，而非全路径
      if (
        data[i].id !== ibiz.env.appId &&
        !/^[0-9a-zA-Z]+__[0-9a-zA-Z]+__[0-9a-zA-Z]+$/.test(data[i].id)
      ) {
        const targetSubAppRef = allPSSubAppRefs.find((subAppRef: IModel) => {
          return subAppRef.id.endsWith(data[i].id);
        });
        if (targetSubAppRef) {
          data[i].id = targetSubAppRef.id;
        }
      }
      result.push({
        // 应用标识@首页视图标识
        id: `${data[i].id}@${data[i].indexViewName.toLowerCase()}`,
        dataId: data[i].dataId,
        caption: data[i].caption,
        indexViewName: data[i].indexViewName.toLowerCase(),
        order: data[i].order,
      });
    }
    return result.sort((a, b) => a.order - b.order);
  }

  /**
   * @description 加载应用(引用应用集方式)
   * @protected
   * @returns {*}  {Promise<IApiMicroApp[]>}
   * @memberof AppSwitchController
   */
  protected async loadAppsWithRefApp(): Promise<IApiMicroApp[]> {
    const result: IApiMicroApp[] = [];
    const defaultApp = ibiz.hub.getApp();
    if (!defaultApp) {
      return result;
    }

    // 组装主应用所有首页视图
    const defaultAppModel = ibiz.hub.getAppSourceModel(defaultApp.appId);
    const allAppIndexViews = defaultAppModel.cache?.getPSAppViews?.filter(
      (appView: IModel) => {
        return appView.viewType === 'APPINDEXVIEW';
      },
    );
    if (allAppIndexViews && allAppIndexViews.length > 0) {
      for (let i = 0; i < allAppIndexViews.length; i++) {
        const appIndexView = allAppIndexViews[i];
        result.push({
          // 应用标识@首页视图标识
          id: `${appIndexView.appId}@${appIndexView.codeName.toLowerCase()}`,
          caption: appIndexView.title || appIndexView.caption,
          indexViewName: appIndexView.codeName.toLowerCase(),
          order: 100 * (i + 1),
        });
      }
    }

    // 组装主应用所有首页视图
    const allSubAppRefs = defaultAppModel.getAllPSSubAppRefs;
    if (!allSubAppRefs || allSubAppRefs.length === 0) {
      return result;
    }
    for (let i = 0; i < allSubAppRefs.length; i++) {
      const subAppRef = allSubAppRefs[i];
      if (subAppRef.appMode && subAppRef.appMode === 'CLOUDHUBSUBAPP') {
        const subApp = await ibiz.hub.getAppAsync(subAppRef.id);
        const subAppModel = ibiz.hub.getAppSourceModel(subApp.appId);
        const allSubAppIndexViews = subAppModel.cache?.getPSAppViews?.filter(
          (appView: IModel) => {
            return appView.viewType === 'APPINDEXVIEW';
          },
        );
        if (allSubAppIndexViews && allSubAppIndexViews.length > 0) {
          for (let j = 0; j < allSubAppIndexViews.length; j++) {
            const subAppIndexView = allSubAppIndexViews[j];
            result.push({
              // 应用标识@首页视图标识
              id: `${
                subAppIndexView.appId
              }@${subAppIndexView.codeName.toLowerCase()}`,
              caption: subAppIndexView.title || subAppIndexView.caption,
              indexViewName: subAppIndexView.codeName.toLowerCase(),
              order: 100 * (result.length + 1),
            });
          }
        }
      }
    }
    return result.sort((a, b) => a.order - b.order);
  }

  /**
   * @description 切换应用
   * @exposedoc
   * @param {string} key
   * @param {Router} router
   * @returns {*}  {Promise<void>}
   * @memberof AppSwitchController
   */
  public async switchMicroApp(key: string, router: Router): Promise<void> {
    // 应用标识等于当前激活应用标识则不做处理
    if (key === this.state.activeMicroAppId) {
      return;
    }
    // 非当前默认应用，需加载目标应用
    let tempKey = key;
    if (key.indexOf('@') !== -1) {
      tempKey = key.split('@')[0];
    }
    if (tempKey !== ibiz.env.appId) {
      await ibiz.hub.getAppAsync(tempKey);
    }
    const targetAppModel = ibiz.hub.getAppSourceModel(tempKey);
    const defaultApp = ibiz.hub.getApp();
    // 切换为主应用时优先获取环境参数中AppTitle
    if (defaultApp.model.appId === tempKey && window.Environment.AppTitle) {
      ibiz.env.AppTitle = window.Environment.AppTitle;
    } else if (targetAppModel.getDefaultPSAppIndexView) {
      // 设置目标应用应用标题
      const view = targetAppModel.getDefaultPSAppIndexView as IModel;
      if (targetAppModel.caption) {
        ibiz.env.AppTitle = targetAppModel.caption;
      } else {
        const views = targetAppModel.cache.getPSAppViews;
        const indexView = views.find(
          (viewItem: IModel) => viewItem.dynaModelFilePath === view.path,
        );
        if (indexView) {
          ibiz.env.AppTitle = indexView.caption;
        }
      }
    }

    // 设置当前激活应用标识
    this.setActiveMicroAppId(key);

    // 跳转目标应用
    const currentIndex = this.state.items.findIndex(item => item.id === key);
    const routePath = route2routePath((router as any).currentRoute.value);
    routePath.pathNodes = routePath.pathNodes.slice(0, 1);
    routePath.pathNodes[0].viewName =
      this.state.items[currentIndex].indexViewName!;
    const url = routePath2string(routePath);
    router.push(url);
  }
}
