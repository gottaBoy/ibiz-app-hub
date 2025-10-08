/* eslint-disable no-useless-return */
import {
  IAppCodeList,
  IAppDataEntity,
  IAppView,
  IApplication,
  IAppLan,
  ISubAppRef,
  IAppBIScheme,
  IAppBICube,
  IAppBIReport,
} from '@ibiz/model-core';
import { DSLHelper, calcUniqueTag } from '@ibiz/rt-model-api';
import { ModelUtil } from './model-util';
import { ModelLoader } from './model-loader';
import { MergeSubModelHelper, plural } from './utils';

/**
 * 模型加载工具类
 *
 * @author chitanda
 * @date 2023-04-16 17:04:46
 * @export
 * @class ModelHelper
 */
export class ModelHelper {
  /**
   * dsl解析包
   *
   * @author tony001
   * @date 2024-09-26 16:09:49
   * @protected
   */
  protected dsl = new DSLHelper();

  /**
   * 子应用模型合并对象
   *
   * @author tony001
   * @date 2024-09-26 16:09:51
   * @protected
   */
  protected merge = new MergeSubModelHelper();

  /**
   * 当前子应用清单
   *
   * @author chitanda
   * @date 2023-12-06 15:12:30
   * @protected
   * @type {ISubAppRef[]}
   */
  protected subAppRefs: ISubAppRef[] = [];

  /**
   * 模型获取工具类缓存
   *
   * @author chitanda
   * @date 2023-04-16 17:04:56
   * @protected
   * @type {Map<string, ModelUtil>}
   */
  protected cache: Map<string, ModelUtil> = new Map();

  /**
   * Creates an instance of ModelHelper.
   * @author chitanda
   * @date 2024-01-08 10:01:20
   * @param {(url: string, params?: IParams) => Promise<IModel>} getModel 模型加载方法
   * @param {string} defaultAppId 默认应用标识
   * @param {string} appContext 应用级上下文参数
   * @param {boolean} [permission=true] 是否启用权限
   */
  constructor(
    protected getModel: (url: string, params?: IParams) => Promise<IModel>,
    protected defaultAppId: string,
    protected appContext: IParams,
    protected permission: boolean = true,
  ) {
    ibiz.hub.registerModelLoaderProvider(new ModelLoader(this));
  }

  /**
   * 初始化应用内容
   *
   * @author chitanda
   * @date 2023-12-06 17:12:51
   * @param {string} [id]
   * @return {*}  {Promise<boolean>}
   */
  async initApp(id?: string): Promise<boolean> {
    await this.initToHub(id);
    return true;
  }

  /**
   * 初始化具体应用模型工具类
   *
   * @author chitanda
   * @date 2023-04-16 17:04:41
   * @param {string} modelTag
   * @param {string} [appId=this.defaultAppId]
   * @return {*}  {Promise<void>}
   */
  async initModelUtil(
    modelTag: string,
    appId: string = this.defaultAppId,
  ): Promise<void> {
    const modelUtil = new ModelUtil(
      appId,
      modelTag,
      this.getModel,
      this.defaultAppId === appId,
      this.appContext,
      this.permission,
    );
    await modelUtil.init();
    this.cache.set(appId, modelUtil);
  }

  /**
   * 初始化模型至Hub中
   *
   * @author chitanda
   * @date 2023-04-17 14:04:55
   * @protected
   * @param {(string | IObject)} [appId]
   * @return {*}  {Promise<void>}
   */
  protected async initToHub(appId?: string | IObject): Promise<void> {
    const id: string = this.calcAppId(appId);
    const app = ibiz.hub.getApp(id);
    const modelUtil = this.getModelUtil(appId);
    const appSourceModel = await modelUtil.getAppModel();
    // 将引用的视图注册到 hub 清单中，只有主应用才会注册。子应用的注册由主应用在初始化子应用时搞定
    if (appSourceModel.getAllPSAppViews && appId === ibiz.env.appId) {
      const appViews = appSourceModel.getAllPSAppViews as IModel[];
      appViews.forEach(appView => {
        ibiz.hub.setAppView(appView.id, appSourceModel.id, appView.priority);
        if (appView.defaultPage === true) {
          ibiz.hub.defaultPage = appView;
        }
      });
    }
    // 将引用插件注册到 hub 清单中
    if (appSourceModel.getAllPSAppPFPluginRefs && appId === ibiz.env.appId) {
      const appPFPluginRefs =
        appSourceModel.getAllPSAppPFPluginRefs as IModel[];
      appPFPluginRefs.forEach(appPFPluginRef => {
        ibiz.hub.setPlugin(this.dsl.appPFPluginRef(appPFPluginRef));
      });
    }
    // 当前主应用的默认首页作为应用首页
    if (appSourceModel.getDefaultPSAppIndexView && appId === ibiz.env.appId) {
      const view = appSourceModel.getDefaultPSAppIndexView as IModel;
      const name = view.path.split('/').pop().replace('.json', '');
      ibiz.hub.defaultAppIndexViewName = name;
      if (!ibiz.env.AppTitle) {
        if (appSourceModel.caption) {
          ibiz.env.AppTitle = appSourceModel.caption;
        } else {
          const views = appSourceModel.cache.getPSAppViews;
          const indexView = views.find(
            (viewItem: IModel) => viewItem.dynaModelFilePath === view.path,
          );
          if (indexView) {
            ibiz.env.AppTitle = indexView.caption;
          }
        }
      }
    }
    if (appSourceModel.getAllPSAppCodeLists) {
      const codeLists = appSourceModel.getAllPSAppCodeLists as IAppCodeList[];
      codeLists.forEach(codeList => {
        app.codeList.setCodeList(
          this.dsl.appCodeList(codeList) as IAppCodeList,
        );
      });
    }
    if (appSourceModel.getAllPSAppDataEntities) {
      const dataEntities = appSourceModel.getAllPSAppDataEntities as IModel[];
      dataEntities.forEach(dataEntity => {
        app.deName2DeCodeName.set(dataEntity.name, dataEntity.codeName);
      });
    }
    if (appSourceModel.getAllPSAppBISchemes) {
      const allAppBISchemes = appSourceModel.getAllPSAppBISchemes as IModel[];
      allAppBISchemes.forEach(biScheme => {
        app.appBISchemeMap.set(calcUniqueTag(biScheme) as string, biScheme);
      });
    }
    // 模型扩展标准视图布局面板
    const subViewRefs = app.model.appSubViewTypeRefs || [];
    subViewRefs.forEach(item => {
      if (item.replaceDefault) {
        ibiz.util.layoutPanel.register(
          `${item.viewType}_DEFAULT`,
          item.viewLayoutPanel!,
        );
      }
    });
    // 子应用模型相关处理
    {
      const { subAppRefs = [] } = app.model;
      const { getAllPSSubAppRefs = [] } = appSourceModel;
      for (let i = 0; i < subAppRefs.length; i++) {
        const subApp = subAppRefs[i];
        const sourceSubApp = getAllPSSubAppRefs[i];
        // 控制插件应用访问权限、通过应用样式参数SUBAPPACCESSKEY定义权限标识
        if (subApp.accessKey) {
          const mianApp = await ibiz.hub.getApp(ibiz.env.appId);
          await mianApp.authority.init();
          const permitted = mianApp.authority.calcByResCode(subApp.accessKey);
          if (permitted) {
            await this.initSubApp(app, subApp, sourceSubApp);
          }
        } else {
          await this.initSubApp(app, subApp, sourceSubApp);
        }
      }
    }
  }

  /**
   * 递归填充指定应用标识
   *
   * @author tony001
   * @date 2024-09-09 15:09:20
   * @protected
   * @param {IModel} model
   * @param {string} appId
   */
  protected deepFillSubAppId(model: IModel, appId: string): void {
    model.appId = appId;
    const keys = Object.keys(model);
    keys.forEach(key => {
      const value = model[key];
      if (value && typeof value === 'object') {
        if (Array.isArray(value)) {
          value.forEach(item => {
            if (item && typeof item === 'object') {
              this.deepFillSubAppId(item, appId);
            }
          });
        } else {
          this.deepFillSubAppId(value, appId);
        }
      }
    });
  }

  /**
   * 初始化子应用相关内容
   *
   * @author chitanda
   * @date 2023-12-06 15:12:23
   * @protected
   * @param {IApplication} app
   * @param {ISubAppRef} subApp
   * @return {*}  {Promise<void>}
   */
  protected async initSubApp(
    app: IApplication,
    subApp: ISubAppRef,
    sourceSubApp: IModel,
  ): Promise<void> {
    this.subAppRefs.push(subApp);
    // 设置视图到hub中
    const viewIds = subApp.appViewIds || [];
    const views = sourceSubApp.getAllPSAppViews || [];
    viewIds.forEach((id, index) => {
      const view = views[index];
      ibiz.hub.setAppView(id, subApp.id, view.priority);
    });
    // 子应用插件引用注册到hub中
    const appPFPluginRefs = sourceSubApp.getAllPSAppPFPluginRefs || [];
    appPFPluginRefs.forEach((appPFPluginRef: IModel) => {
      const appPluginRef = this.dsl.appPFPluginRef(appPFPluginRef);
      appPluginRef.appId = subApp.id;
      ibiz.hub.setPlugin(appPluginRef, subApp.id);
    });
    // 设置DrCtrl到hub中
    const drCtrlIds = subApp.dedrcontrolIds || [];
    const drCtrls = this.dsl.controls(sourceSubApp.getAllPSDEDRControls || []);
    drCtrlIds.forEach((id, index) => {
      const drCtrl = drCtrls[index];
      ibiz.hub.registerSubAppDrControls(subApp.id || ibiz.env.appId, drCtrl);
    });
    // 设置界面行为组到hub中
    const appDEUIActionGroupIds = subApp.appDEUIActionGroupIds || [];
    const appDEUIActionGroups = sourceSubApp.getAllPSAppDEUIActionGroups || [];
    appDEUIActionGroupIds.forEach((id, index) => {
      const appDEUIActionGroup = appDEUIActionGroups[index];
      this.deepFillSubAppId(appDEUIActionGroup, subApp.id as string);
      ibiz.hub.registerSubAppDEUIActionGroups(
        subApp.id || ibiz.env.appId,
        this.dsl.uiActionGroups(appDEUIActionGroup),
      );
    });
    // 设置菜单模型到hub中
    const appMenuModelIds = subApp.appMenuModelIds || [];
    const appMenuModels = sourceSubApp.getAllPSAppMenuModels || [];
    appMenuModelIds.forEach((id, index) => {
      const appMenuModel = appMenuModels[index];
      this.deepFillSubAppId(appMenuModel, subApp.id as string);
      ibiz.hub.registerSubAppMenuModels(
        subApp.id || ibiz.env.appId,
        this.dsl.control(appMenuModel),
      );
    });
    // 设置部件模型到hub中
    const controlIds = subApp.controlIds || [];
    const appControls = sourceSubApp.getAllPSControls || [];
    controlIds.forEach((id, index) => {
      const appControl = appControls[index];
      this.deepFillSubAppId(appControl, subApp.id as string);
      ibiz.hub.registerSubAppControls(
        subApp.id || ibiz.env.appId,
        this.dsl.control(appControl),
      );
    });
    // 实现子应用借助主应用独立打开,srfembsubapp的值为ref三段式的第一段哈希值，条件触发手动加载目标子应用
    if (
      this.appContext.srfembsubapp &&
      subApp.id &&
      subApp.id.startsWith(this.appContext.srfembsubapp)
    ) {
      await ibiz.hub.createApp(subApp.id);
    }
  }

  /**
   * 获取应用模型
   *
   * @author chitanda
   * @date 2023-04-16 17:04:13
   * @param {(string | IObject)} [appId]
   * @return {*}  {Promise<IApplication>}
   */
  async getAppModel(appId?: string | IObject): Promise<IApplication> {
    const id: string = this.calcAppId(appId);
    if (!this.cache.has(id)) {
      const data = ibiz.appData || {};
      await this.initModelUtil(data.dynamodeltag, id);
    }
    const model = await this.getModelUtil(appId).getAppModel();
    const app = this.dsl.application(model) as IApplication;
    // 设置应用原始模型到hub中
    ibiz.hub.setAppSourceModel(app.appId, model);
    // 实现子应用借助主应用独立打开,条件触发修改hub默认首页为子应用首页
    if (
      this.appContext.srfembsubapp &&
      appId &&
      appId.startsWith(this.appContext.srfembsubapp)
    ) {
      if (model.getDefaultPSAppIndexView) {
        const view = model.getDefaultPSAppIndexView as IModel;
        const name = view.path.split('/').pop().replace('.json', '');
        ibiz.hub.defaultAppIndexViewName = name;
        if (!ibiz.env.AppTitle) {
          if (model.caption) {
            ibiz.env.AppTitle = model.caption;
          } else {
            const views = model.cache.getPSAppViews;
            const indexView = views.find(
              (viewItem: IModel) => viewItem.dynaModelFilePath === view.path,
            );
            if (indexView) {
              ibiz.env.AppTitle = indexView.caption;
            }
          }
        }
      }
    }
    return app;
  }

  /**
   * 获取子应用引用模型
   *
   * @author tony001
   * @date 2024-06-23 15:06:31
   * @param {string} appId
   * @return {*}  {(Promise<ISubAppRef | undefined>)}
   */
  async getSubAppRef(appId: string): Promise<ISubAppRef | undefined> {
    return this.subAppRefs.find(subApp => {
      return subApp.appId === appId;
    });
  }

  /**
   * 获取应用全局样式
   *
   * @author chitanda
   * @date 2023-09-06 10:09:48
   * @param {(string | IObject)} [appId]
   * @return {*}  {(Promise<string | null>)}
   */
  getAppStyle(appId?: string | IObject): Promise<string | null> {
    return this.getModelUtil(appId).getAppStyle();
  }

  /**
   * 根据应用实体 codeName 获取应用实体模型
   *
   * @author chitanda
   * @date 2023-04-16 18:04:33
   * @param {string} name
   * @param {(string | IObject)} [appId]
   * @param {boolean} [isId]
   * @return {*}  {Promise<IAppDataEntity>}
   */
  async getAppDataEntityModel(
    name: string,
    appId?: string | IObject,
    isId?: boolean,
  ): Promise<IAppDataEntity> {
    const util = this.getModelUtil(appId);
    const model = await util.getAppDataEntityModel(name, isId, true);
    const dsl = this.dsl.appDataEntity(model) as IAppDataEntity;
    const list = await util.servicePathUtil.calcRequestPaths(dsl.id!);
    dsl.requestPaths = list;
    dsl.codeName2 = plural(dsl.codeName!.toLowerCase());
    dsl.defullTag = calcUniqueTag(
      model.getPSDataEntity,
      false,
      false,
    ) as string;
    if (dsl.deapicodeName) {
      if (!dsl.deapicodeName2) {
        dsl.deapicodeName2 = plural(dsl.deapicodeName);
      }
      const { engineVer } = (await util.getAppModel()) as IApplication;
      if (!engineVer || engineVer < 240) {
        dsl.deapicodeName2 = dsl.deapicodeName2!.toLowerCase();
      }
    }

    return dsl;
  }

  /**
   * 计算应用视图需要合并的子应用模型
   *
   * @author chitanda
   * @date 2023-12-06 16:12:25
   * @protected
   * @param {IAppView} view
   */
  protected calcAppViewSubAppModel(view: IAppView): void {
    const controls = view.controls
      ? view.controls
      : view.viewLayoutPanel?.controls;

    // 合并主菜单
    this.merge.mergeAppMainMenu(view, controls, this.subAppRefs);
    // 合并扩展菜单
    this.merge.mergeSubAppExtendedMenu(view, controls, this.subAppRefs);
    // 合并DrCtrl
    this.merge.mergeSubAppDRCtrl(view, controls, this.subAppRefs);
    // 合并工具栏界面行为组
    this.merge.mergeSubAppToolbarActionGroup(view, controls, this.subAppRefs);
    // 合并上下文菜单（树视图部件）
    this.merge.mergeSubAppTreeContextMenuActionGroup(
      view,
      controls,
      this.subAppRefs,
    );
    // 合并表单界面行为组（按钮组）
    this.merge.mergeSubAppFormActionGroup(view, controls, this.subAppRefs);
    // 合并表格列界面行为组
    this.merge.mergeSubAppGridCloumnActionGroup(
      view,
      controls,
      this.subAppRefs,
    );
    // 合并树视图部件
    this.merge.mergeSubAppTreeView(view, controls, this.subAppRefs);
    // 合并子应用表单部件
    this.merge.mergeSubAppForm(view, controls, this.subAppRefs);
  }

  /**
   * 根据应用视图 codeName 获取应用视图模型
   *
   * @author chitanda
   * @date 2023-04-16 17:04:38
   * @param {string} name
   * @param {(string | IObject)} [appId]
   * @return {*}  {Promise<IAppView>}
   */
  async getAppViewModel(
    name: string,
    appId?: string | IObject,
  ): Promise<IAppView> {
    const model = await this.getModelUtil(appId).getAppViewModel(name);
    const dsl = this.dsl.appView(model) as IAppView;
    this.calcAppViewSubAppModel(dsl);
    return dsl;
  }

  /**
   * 根据路径和参数加载应用视图模型，主要用于后台根据运行时参数重新计算视图模型
   *
   * @author chitanda
   * @date 2024-01-08 10:01:43
   * @param {string} viewId
   * @param {IParams} [params]
   * @param {string} [appId]
   * @return {*}  {Promise<IAppView>}
   */
  async loadAppViewModel(
    viewId: string,
    params?: IParams,
    appId?: string,
  ): Promise<IAppView> {
    const model = await this.getModelUtil(appId).getAppViewModel(
      viewId,
      params,
      true,
    );
    const dsl = this.dsl.appView(model) as IAppView;
    this.calcAppViewSubAppModel(dsl);
    return dsl;
  }

  /**
   * 获取应用多语言模型
   *
   * @author chitanda
   * @date 2023-08-24 21:08:17
   * @param {string} language
   * @param {(string | IObject)} [appId]
   * @return {*}  {Promise<IAppLan>}
   */
  async getPSAppLang(
    language: string,
    appId?: string | IObject,
  ): Promise<IAppLan> {
    const model = await this.getModelUtil(appId).getPSAppLang(language);
    return this.dsl.appLan(model) as IAppLan;
  }

  /**
   * 获取应用智能报表体系集合
   *
   * @author tony001
   * @date 2024-06-04 15:06:46
   * @param {string} appId 应用标识
   * @param {string[]} ids 智能报表体系标识集合
   * @return {*}  {Promise<IAppBIScheme[]>}
   */
  async getAppBISchemes(
    appId: string,
    ids: string[] = [],
  ): Promise<IAppBIScheme[]> {
    const tag: string = this.calcAppId(appId);
    const app = ibiz.hub.getApp(tag);
    const modelUtil = this.getModelUtil(appId);
    const appBISchemes: IAppBIScheme[] = [];
    if (ids.length === 0) {
      ids = app.model.appBISchemeIds || [];
    }
    if (ids.length > 0) {
      const sourceModel: IModel[] = ids.map(id => {
        return app.appBISchemeMap.get(id) as IModel;
      });
      const models = await modelUtil.getAppBISchemeModel(sourceModel);
      if (models && models.length > 0) {
        for (let i = 0; i < models.length; i++) {
          const model = models[i];
          if (model.getPSAppBICubes?.length > 0) {
            for (let m = 0; m < model.getPSAppBICubes.length; m++) {
              app.appBICubeMap.set(
                calcUniqueTag(model.getPSAppBICubes[m]) as string,
                model.getPSAppBICubes[m],
              );
            }
          }
          if (model.getPSAppBIReports?.length > 0) {
            for (let n = 0; n < model.getPSAppBIReports.length; n++) {
              app.appBIReportMap.set(
                calcUniqueTag(model.getPSAppBIReports[n]) as string,
                model.getPSAppBIReports[n],
              );
            }
          }
          appBISchemes.push(this.dsl.appBIScheme(model) as IAppBIScheme);
        }
      }
    }
    return appBISchemes;
  }

  /**
   * 获取应用智能报表立方体集合
   *
   * @author tony001
   * @date 2024-06-04 16:06:19
   * @param {string} appId 应用标识
   * @param {string[]} [ids=[]] 立方体数据标识集合
   * @return {*}  {Promise<IAppBICube[]>}
   */
  async getAppAppBICubes(
    appId: string,
    ids: string[] = [],
  ): Promise<IAppBICube[]> {
    const tag: string = this.calcAppId(appId);
    const app = ibiz.hub.getApp(tag);
    const modelUtil = this.getModelUtil(appId);
    const appBICubes: IAppBICube[] = [];
    if (ids.length === 0) {
      return appBICubes;
    }
    if (ids.length > 0) {
      const sourceModel: IModel[] = [];
      const noExistIds: string[] = [];
      ids.forEach(id => {
        const tempCube = app.appBICubeMap.get(id);
        if (tempCube) {
          sourceModel.push(tempCube);
        } else {
          noExistIds.push(id);
        }
      });
      if (noExistIds.length > 0) {
        await this.getAppBISchemes(appId);
        noExistIds.forEach(id => {
          const tempCube = app.appBICubeMap.get(id);
          if (tempCube) {
            sourceModel.push(tempCube);
          }
        });
      }
      const models = await modelUtil.getAppAppBICubes(sourceModel);
      if (models && models.length > 0) {
        for (let i = 0; i < models.length; i++) {
          const model = models[i];
          appBICubes.push(this.dsl.appBICube(model) as IAppBIScheme);
        }
      }
    }
    return appBICubes;
  }

  /**
   * 获取应用智能报表集合
   *
   * @author tony001
   * @date 2024-06-04 16:06:39
   * @param {string} appId 应用标识
   * @param {string[]} [ids=[]] 报表数据标识集合
   * @return {*}  {Promise<IAppBIReport[]>}
   */
  async getAppBIReports(
    appId: string,
    ids: string[] = [],
  ): Promise<IAppBIReport[]> {
    const tag: string = this.calcAppId(appId);
    const app = ibiz.hub.getApp(tag);
    const modelUtil = this.getModelUtil(appId);
    const appBIReports: IAppBIReport[] = [];
    if (ids.length === 0) {
      return appBIReports;
    }
    if (ids.length > 0) {
      const sourceModel: IModel[] = [];
      const noExistIds: string[] = [];
      ids.forEach(id => {
        const tempReport = app.appBIReportMap.get(id);
        if (tempReport) {
          sourceModel.push(tempReport);
        } else {
          noExistIds.push(id);
        }
      });
      if (noExistIds.length > 0) {
        await this.getAppBISchemes(appId);
        noExistIds.forEach(id => {
          const tempReport = app.appBIReportMap.get(id);
          if (tempReport) {
            sourceModel.push(tempReport);
          }
        });
      }
      const models = await modelUtil.getAppBIReports(sourceModel);
      if (models && models.length > 0) {
        for (let i = 0; i < models.length; i++) {
          const model = models[i];
          appBIReports.push(this.dsl.appBIReport(model) as IAppBIScheme);
        }
      }
    }
    return appBIReports;
  }

  /**
   * 原始模型转化为dsl对象
   *
   * @author tony001
   * @date 2024-06-27 17:06:54
   * @param {ModelObject} data
   * @param {('APP' | 'VIEW' | 'CTRL' | 'APPENTITY' | 'APPBIREPORT')} type
   * @return {*}  {(Promise<IData | undefined>)}
   */
  async translationModelToDsl(
    data: ModelObject,
    type: 'APP' | 'VIEW' | 'CTRL' | 'APPENTITY' | 'APPBIREPORT',
  ): Promise<IData | undefined> {
    switch (type) {
      case 'APP':
        return this.dsl.application(data);
      case 'VIEW':
        return this.dsl.appView(data);
      case 'CTRL':
        return this.dsl.control(data);
      case 'APPENTITY':
        return this.dsl.appDataEntity(data);
      case 'APPBIREPORT':
        return this.dsl.appBIReport(data);
      default:
        break;
    }
  }

  /**
   * 获取对应模型工具类
   *
   * @author chitanda
   * @date 2023-04-16 18:04:08
   * @protected
   * @param {(IObject | string)} context
   * @return {*}  {ModelUtil}
   */
  protected getModelUtil(
    context: IObject | string = this.defaultAppId,
  ): ModelUtil {
    const appId: string = this.calcAppId(context);
    if (this.cache.has(appId)) {
      return this.cache.get(appId)!;
    }
    throw new Error(ibiz.i18n.t('modelHelper.noInitialized', { appId }));
  }

  /**
   * 计算应用标识
   *
   * @author chitanda
   * @date 2023-04-16 17:04:19
   * @protected
   * @param {(IObject | string)} [data=this.defaultAppId]
   * @return {*}  {string}
   */
  protected calcAppId(data: IObject | string = this.defaultAppId): string {
    let appId: string;
    if (typeof data === 'string') {
      appId = data;
    } else {
      appId = (data as { appId: string }).appId;
    }
    return appId;
  }
}
