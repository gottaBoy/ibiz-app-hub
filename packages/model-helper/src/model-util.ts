import { calcUniqueTag } from '@ibiz/rt-model-api';
import { IAppDERS } from '@ibiz/model-core';
import { isEmpty } from 'ramda';
import {
  formatPath,
  mergeModel,
  resolveAppLangKey,
  ServicePathUtil,
} from './utils';
import { PSSysApp } from './model/PSSYSAPP';

/**
 * 全动模型处理工具类,每个App一个实例
 *
 * @author chitanda
 * @date 2023-04-16 17:04:06
 * @export
 * @class ModelUtil
 */
export class ModelUtil {
  /**
   * 模型缓存
   *
   * @author chitanda
   * @date 2023-04-16 17:04:40
   * @protected
   * @type {Map<string, IModel>}
   */
  protected modelCache: Map<string, IModel> = new Map();

  /**
   * 应用模型
   *
   * @author chitanda
   * @date 2023-04-16 17:04:17
   * @protected
   * @type {IModel}
   */
  protected appModel!: IModel;

  /**
   * 服务路径计算工具类
   *
   * @author chitanda
   * @date 2023-04-22 12:04:15
   * @type {ServicePathUtil}
   */
  servicePathUtil!: ServicePathUtil;

  /**
   * Creates an instance of GlobalModel.
   *
   * @author chitanda
   * @date 2023-04-13 21:04:21
   * @param {string}appId 应用标识
   * @param {string} modelTag
   * @param {(url: string, params?: IParams) => Promise<IModel>} get 模型加载方法
   * @param {boolean} hub 是否为 hub 应用基座
   * @param {IParams} appContext 应用级上下文参数
   */
  constructor(
    protected appId: string,
    protected modelTag: string,
    protected get: (url: string, params?: IParams) => Promise<IModel>,
    protected hub: boolean,
    protected appContext: IParams,
    protected permission: boolean = true,
  ) {}

  /**
   * 在使用前需要初始化，来进行异步加载
   *
   * @author chitanda
   * @date 2023-04-16 17:04:35
   * @return {*}  {Promise<void>}
   */
  async init(): Promise<void> {
    await this.getAppModel();
    await this.specialHandling();
    // 填充缓存模型
    {
      const { cache } = this.appModel;
      if (cache) {
        const views = cache.getPSAppViews;
        if (views) {
          views.forEach((item: IModel) => {
            item.path = item.dynaModelFilePath;
            const appPath = this.calcAppPath(item.path);
            this.modelCache.set(appPath, item);
          });
          if (this.appModel.getAllPSAppViews == null) {
            this.appModel.getAllPSAppViews = views;
          } else {
            this.appModel.getAllPSAppViews.push(...views);
          }
        }
      }
    }
    const allDataEntities = (this.appModel.getAllPSAppDataEntities ||
      []) as IModel[];
    allDataEntities.forEach(item => {
      item.id = calcUniqueTag(item, false);
    });
    const allViews = (this.appModel.getAllPSAppViews || []) as IModel[];
    allViews.forEach(item => {
      item.id = calcUniqueTag(item, false);
    });
    const allAppDERSs = (this.appModel.getAllPSAppDERSs || []) as IModel[];
    allAppDERSs.forEach(item => {
      const major = item.getMajorPSAppDataEntity;
      const minor = item.getMinorPSAppDataEntity;
      item.majorAppDataEntityId = calcUniqueTag(major, false);
      item.minorAppDataEntityId = calcUniqueTag(minor, false);
    });
    this.servicePathUtil = new ServicePathUtil(
      allDataEntities,
      allAppDERSs as IAppDERS[],
      this,
    );
    if (
      this.appModel.getAllPSAppLans &&
      this.appModel.getAllPSAppLans.length > 0
    ) {
      ibiz.env.isEnableMultiLan = true;
    } else {
      ibiz.env.isEnableMultiLan = false;
    }
  }

  /**
   * 特殊处理应用模型
   *
   * @author chitanda
   * @date 2023-09-21 15:09:07
   * @protected
   * @return {*}  {Promise<void>}
   */
  protected async specialHandling(): Promise<void> {
    // 特殊处理预置全局界面行为，附加一些特殊的模板预置模型
    if (this.appModel.getAllPSAppDEUIActions) {
      mergeModel(
        this.appModel.getAllPSAppDEUIActions,
        PSSysApp.getAllPSAppDEUIActions,
        'codeName',
      );
    }
  }

  /**
   * 获取应用模型
   *
   * @author chitanda
   * @date 2023-04-16 17:04:21
   * @return {*}  {Promise<IModel>}
   */
  async getAppModel(): Promise<IModel> {
    if (!this.appModel) {
      let appPath: string = '/PSSYSAPP.json';
      if (this.hub && ibiz.env.hub) {
        appPath = `/PSSYSAPP.hub.json`;
      }
      if (this.permission === false) {
        appPath = `/simple/PSSYSAPP.simple.json`;
      }
      this.appModel = await this.getModel(appPath);
      this.appModel.id = this.appId;
    }
    return this.appModel;
  }

  /**
   * 加载应用模型全局样式
   *
   * @author chitanda
   * @date 2023-09-06 10:09:11
   * @return {*}  {(Promise<string | null>)}
   */
  async getAppStyle(): Promise<string | null> {
    let style: string = '';
    try {
      let stylePath: string = '/PSSYSAPP.json.css';
      if (this.hub && ibiz.env.hub) {
        stylePath = `/PSSYSAPP.hubsubapp.json.css`;
      }
      if (this.permission === false) {
        stylePath = `/simple/PSSYSAPP.simple.json.css`;
      }
      style = await this.getStyleModel(stylePath);
      if (style) {
        return style;
      }
    } catch (error) {
      // 忽略样式加载异常
      ibiz.log.error(error);
    }
    return null;
  }

  /**
   * 根据应用实体 codeName 或者 id 获取应用实体模型
   *
   * @author chitanda
   * @date 2023-04-16 18:04:45
   * @param {string} tag
   * @param {boolean} [isId=true]
   * @param {boolean} [ignoreCase=false]
   * @return {*}  {Promise<IModel>}
   */
  async getAppDataEntityModel(
    tag: string,
    isId: boolean = true,
    ignoreCase: boolean = false,
  ): Promise<IModel> {
    const allDataEntities = this.appModel.getAllPSAppDataEntities as IModel[];
    if (allDataEntities && allDataEntities.length > 0) {
      const lowerTag = tag.toLowerCase();
      let dataEntity: IModel | undefined;
      if (isId) {
        dataEntity = allDataEntities.find(v => {
          if (ignoreCase) {
            return v.id.toLowerCase() === lowerTag;
          }
          return v.id === tag;
        });
      } else {
        dataEntity = allDataEntities.find(v => {
          if (ignoreCase) {
            return v.codeName.toLowerCase() === lowerTag;
          }
          return v.codeName === tag;
        });
      }
      if (dataEntity) {
        return this.getModel(dataEntity.path);
      }
    }

    throw new Error(
      ibiz.i18n.t('modelHelper.noFoundEntity', { appId: this.appId, tag }),
    );
  }

  /**
   * 根据应用视图 id 获取应用视图模型,如果给了 params 则每次都会重新加载模型
   *
   * @author chitanda
   * @date 2024-01-15 12:01:36
   * @param {string} tag
   * @param {IParams} [params]
   * @param {boolean} [isDynamic]
   * @return {*}  {Promise<IModel>}
   */
  async getAppViewModel(
    tag: string,
    params?: IParams,
    isDynamic?: boolean,
  ): Promise<IModel> {
    const allViews = this.appModel.getAllPSAppViews as IModel[];
    if (allViews && allViews.length > 0) {
      const lowerTag = tag.toLowerCase();
      const exTag = `.${lowerTag}`;
      const view = allViews.find(
        v => v.id.endsWith(exTag) || v.id === lowerTag,
      );
      if (view) {
        return this.getModel(view.path, params, isDynamic);
      }
    }
    throw new Error(
      ibiz.i18n.t('modelHelper.noFoundView', { appId: this.appId, tag }),
    );
  }

  /**
   * 加载应用多语言模型
   *
   * @author chitanda
   * @date 2023-08-24 22:08:23
   * @param {string} language
   * @return {*}  {Promise<IModel>}
   */
  async getPSAppLang(language: string): Promise<IModel> {
    const app = await this.getAppModel();
    if (app.getAllPSAppLans) {
      const langs = app.getAllPSAppLans as IModel[];
      // 调用方给的是带地区后缀的语言标识，模型里的语言键只到语言本身。
      const key = resolveAppLangKey(
        language,
        langs.map(item => item.language as string),
      );
      const lang = langs.find(item => item.language === key);
      if (lang) {
        return this.getModel(lang.path);
      }
      ibiz.log.error(ibiz.i18n.t('modelHelper.noSupported', { language }));
    }
    return {};
  }

  /**
   * 加载应用样式字符串
   *
   * @author chitanda
   * @date 2023-09-07 11:09:11
   * @param {string} modelPath
   * @return {*}  {Promise<string>}
   */
  getStyleModel(modelPath: string): Promise<string> {
    let url: string;
    if (this.hub) {
      url = this.calcAppPath(modelPath);
    } else {
      url = this.calcSubAppPath(modelPath);
    }
    return this.get(url) as unknown as Promise<string>;
  }

  /**
   * 获取应用智能报表体系集合
   *
   * @author tony001
   * @date 2024-06-04 16:06:19
   * @param {IModel[]} model
   * @return {*}  {Promise<IModel[]>}
   */
  async getAppBISchemeModel(model: IModel[] = []): Promise<IModel[]> {
    const appBISchemeModel: IModel[] = [];
    if (model.length > 0) {
      for (let i = 0; i < model.length; i++) {
        const appBISchemeItem = await this.getModel(model[i].path);
        appBISchemeModel.push(appBISchemeItem);
      }
    }
    return appBISchemeModel;
  }

  /**
   * 获取应用智能报表立方体数据集合
   *
   * @author tony001
   * @date 2024-06-04 16:06:19
   * @param {IModel[]} [model=[]]
   * @return {*}  {Promise<IModel[]>}
   */
  async getAppAppBICubes(model: IModel[] = []): Promise<IModel[]> {
    const appBICubeModel: IModel[] = [];
    if (model.length > 0) {
      for (let i = 0; i < model.length; i++) {
        const appBICubeItem = await this.getModel(model[i].path);
        appBICubeModel.push(appBICubeItem);
      }
    }
    return appBICubeModel;
  }

  /**
   * 获取应用智能报表数据集合
   *
   * @author tony001
   * @date 2024-06-04 16:06:29
   * @param {IModel[]} [model=[]]
   * @return {*}  {Promise<IModel[]>}
   */
  async getAppBIReports(model: IModel[] = []): Promise<IModel[]> {
    const appBIReportModel: IModel[] = [];
    if (model.length > 0) {
      for (let i = 0; i < model.length; i++) {
        const appBIReportItem = await this.getModel(model[i].path);
        appBIReportModel.push(appBIReportItem);
      }
    }
    return appBIReportModel;
  }

  /**
   * 加载模型，如果给了 params 则不会缓存模型
   *
   * @author chitanda
   * @date 2024-01-15 12:01:57
   * @param {string} modelPath
   * @param {IParams} [params]
   * @param {boolean} [isDynamic]
   * @return {*}  {Promise<IModel>}
   */
  async getModel(
    modelPath: string,
    params?: IParams,
    isDynamic?: boolean,
  ): Promise<IModel> {
    let url: string;
    if (this.hub) {
      url = this.calcAppPath(modelPath, isDynamic);
    } else {
      url = this.calcSubAppPath(modelPath, isDynamic);
    }
    const isParams = params && !isEmpty(params);
    if (this.modelCache.has(url) && !isParams) {
      return this.modelCache.get(url)!;
    }
    const model = await this.get(url, params);
    if (!isParams) {
      this.modelCache.set(url, model);
    }
    this.deepFillAppId(model);
    return model;
  }

  /**
   * 递归填充应用标识
   *
   * @author chitanda
   * @date 2023-08-21 10:08:41
   * @protected
   * @param {IModel} model
   */
  protected deepFillAppId(model: IModel): void {
    model.appId = this.appId;
    const keys = Object.keys(model);
    keys.forEach(key => {
      const value = model[key];
      if (value && typeof value === 'object') {
        if (Array.isArray(value)) {
          value.forEach(item => {
            if (item && typeof item === 'object') {
              this.deepFillAppId(item);
            }
          });
        } else {
          this.deepFillAppId(value);
        }
      }
    });
  }

  /**
   * 计算应用模型请求路径
   *
   * @author chitanda
   * @date 2024-01-15 12:01:45
   * @protected
   * @param {string} modelPath
   * @param {boolean} [isDynamic=false]
   * @return {*}  {string}
   */
  protected calcAppPath(modelPath: string, isDynamic: boolean = false): string {
    if (isDynamic) {
      return formatPath(modelPath);
    }
    return `${formatPath(modelPath)}${
      this.modelTag
        ? `?dynamodeltag=${this.modelTag}${this.appContext && this.appContext.srfembsubapp ? `&srfembsubapp=${this.appContext.srfembsubapp}` : ''}`
        : ''
    }`;
  }

  /**
   * 计算子应用模型请求路径
   *
   * @author chitanda
   * @date 2024-01-15 12:01:39
   * @protected
   * @param {string} modelPath
   * @param {boolean} [isDynamic=false]
   * @return {*}  {string}
   */
  protected calcSubAppPath(
    modelPath: string,
    isDynamic: boolean = false,
  ): string {
    if (isDynamic) {
      return `/subapps/${this.appId}${formatPath(modelPath)}`;
    }
    return `/subapps/${this.appId}${formatPath(modelPath)}?dynamodeltag=${
      this.modelTag
    }`;
  }
}
