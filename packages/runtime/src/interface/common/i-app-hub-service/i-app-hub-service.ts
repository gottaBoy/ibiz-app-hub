import {
  IAppBICube,
  IAppBIReport,
  IAppBIScheme,
  IAppCodeList,
  IAppDataEntity,
  IApplication,
  IAppView,
} from '@ibiz/model-core';
import { Convert } from '../../../hub';
import { ModelLoaderProvider } from '../../provider';
import { IAppConfigService } from '../i-app-config-service/i-app-config-service';
import { INoticeController } from '../../controller';
import { IAppDEService, IConfigService } from '../../service';
import { Application } from '../../../application';
import { MqttService } from '../../../service';
import { IApiAppHubService } from '../../api';
import { IAppService } from '../i-app-service/i-app-service';

/**
 * @description 应用中心服务接口
 * @export
 * @interface IAppHubService
 * @extends {IApiAppHubService}
 */
export interface IAppHubService extends IApiAppHubService {
  /**
   * @description 模型转换器
   * @type {Convert}
   * @memberof IAppHubService
   */
  readonly convert: Convert;

  /**
   * @description 基座级配置存储服务
   * @type {IConfigService}
   * @memberof IAppHubService
   */
  configCache: IConfigService;

  /**
   * @description 应用中心配置信息服务
   * @type {IAppConfigService}
   * @memberof IAppHubService
   */
  config: IAppConfigService;

  /**
   * @description 全局消息总控制器
   * @type {INoticeController}
   * @memberof IAppHubService
   */
  notice: INoticeController;

  /**
   * @description mqtt服务
   * @type {MqttService}
   * @memberof IAppHubService
   */
  mqtt?: MqttService;

  /**
   * @description 激活微应用标识（应用选择器使用）
   * @type {string}
   * @memberof IAppHubService
   */
  activeMicroAppId: string;

  /**
   * @description 初始化Mqtt服务
   * @returns {*}  {Promise<void>}
   * @memberof IAppHubService
   */
  initMqtt(): Promise<void>;

  /**
   * @description 注册模型加载适配器
   * @param {ModelLoaderProvider} provider
   * @memberof IAppHubService
   */
  registerModelLoaderProvider(provider: ModelLoaderProvider): void;

  /**
   * @description 注册应用视图模型
   * @param {IAppView} model
   * @memberof IAppHubService
   */
  registerAppView(model: IAppView): void;

  /**
   * @description 注册应用实体模型
   * @param {IAppDataEntity} model
   * @param {string} appId
   * @memberof IAppHubService
   */
  registerAppDataEntity(model: IAppDataEntity, appId: string): void;

  /**
   * @description 注册子应用dedrcontrols模型
   * @param {string} appId
   * @param {IModel} model
   * @memberof IAppHubService
   */
  registerSubAppDrControls(appId: string, model: IModel): void;

  /**
   * 注册子应用分页导航面板模型
   * @param appId
   * @param model
   */
  registerSubAppTabExpPanel(appId: string, model: IModel): void;

  /**
   * @description 注册子应用界面行为组模型
   * @param {string} appId
   * @param {IModel} model
   * @memberof IAppHubService
   */
  registerSubAppDEUIActionGroups(appId: string, model: IModel): void;

  /**
   * @description 注册子应用菜单模型
   * @param {string} appId
   * @param {IModel} model
   * @memberof IAppHubService
   */
  registerSubAppMenuModels(appId: string, model: IModel): void;

  /**
   * @description 注册子应用部件模型
   * @param {string} appId
   * @param {IModel} model
   * @memberof IAppHubService
   */
  registerSubAppControls(appId: string, model: IModel): void;

  /**
   * 注册子应用代码表
   * @param appId
   * @param model
   */
  registerSubAppCodeList(appId: string, model: IAppCodeList): void;

  /**
   * @description 设置应用视图所属应用，兼容识别视图 codeName 或 id
   * @param {string} tag
   * @param {string} [appId]
   * @param {number} [priority]
   * @memberof IAppHubService
   */
  setAppView(tag: string, appId?: string, priority?: number): void;

  /**
   * @description 应用视图是否已注册
   * @param {string} tag
   * @returns {*}  {boolean}
   * @memberof IAppHubService
   */
  hasAppView(tag: string): boolean;

  /**
   * @description 获取应用模型样式内容
   * @param {string} appId
   * @returns {*}  {(Promise<string | null>)}
   * @memberof IAppHubService
   */
  getAppStyle(appId: string): Promise<string | null>;

  /**
   * @description 根据DrControl的名称和子应用标识获取模型
   * @param {string} tag
   * @param {string} appId
   * @returns {*}  {(IModel | undefined)}
   * @memberof IAppHubService
   */
  getSubAppDrControl(tag: string, appId: string): IModel | undefined;

  /**
   * @description 根据分页导航面板的唯一标识（uniqueTag）获取模型
   * @param tag
   * @param appId
   */
  getSubAppTabExpPanel(tag: string, appId: string): IModel | undefined;

  /**
   * @description 根据界面行为组标识和子应用标识获取模型
   * @param {string} tag
   * @param {string} appId
   * @returns {*}  {(IModel | undefined)}
   * @memberof IAppHubService
   */
  getSubAppDEUIActionGroups(tag: string, appId: string): IModel | undefined;

  /**
   * @description 根据菜单名称和子应用标识获取菜单模型
   * @param {string} tag
   * @param {string} appId
   * @returns {*}  {(IModel | undefined)}
   * @memberof IAppHubService
   */
  getSubAppMenuModel(tag: string, appId: string): IModel | undefined;

  /**
   * @description 根据部件标识和子应用标识获取部件模型
   * @param {string} tag
   * @param {string} appId
   * @returns {*}  {(IModel | undefined)}
   * @memberof IAppHubService
   */
  getSubAppControl(tag: string, appId: string): IModel | undefined;

  /**
   * 根据代码表标识和子应用标识获取代码表模型
   * @param id
   * @param appId
   */
  getSubAppCodeList(id: string, appId: string): IAppCodeList | undefined;

  /**
   * @description 根据参数加载请求视图模型，用于后台根据运行时参数加载视图
   * @param {string} appId
   * @param {string} viewId
   * @param {IParams} params
   * @returns {*}  {Promise<IAppView>}
   * @memberof IAppHubService
   */
  loadAppView(
    appId: string,
    viewId: string,
    params: IParams,
  ): Promise<IAppView>;

  /**
   * @description 获取应用智能报表体系
   * @param {string[]} [ids] 智能报表体系标识集合
   * @param {string} [appId] 应用标识
   * @returns {*}  {Promise<IAppBIScheme[]>}
   * @memberof IAppHubService
   */
  getAppBISchemes(ids?: string[], appId?: string): Promise<IAppBIScheme[]>;

  /**
   * @description 获取应用智能报表立方体数据
   * @param {string[]} ids 智能报表立方体标识集合
   * @param {string} [appId] 应用标识
   * @returns {*}  {Promise<IAppBICube[]>}
   * @memberof IAppHubService
   */
  getAppAppBICubes(ids: string[], appId?: string): Promise<IAppBICube[]>;

  /**
   * @description 获取应用智能报表数据
   * @param {string[]} ids 智能报表标识集合
   * @param {string} [appId] 应用标识
   * @returns {*}  {Promise<IAppBIReport[]>}
   * @memberof IAppHubService
   */
  getAppBIReports(ids: string[], appId?: string): Promise<IAppBIReport[]>;

  /**
   * @description 设置插件
   * @param {IModel} plugin
   * @param {string} [appId]
   * @memberof IAppHubService
   */
  setPlugin(plugin: IModel, appId?: string): void;

  /**
   * @description 获取插件
   * @param {string} pluginId
   * @param {string} [appId]
   * @returns {*}  {(IModel | undefined)}
   * @memberof IAppHubService
   */
  getPlugin(pluginId: string, appId?: string): IModel | undefined;

  /**
   * @description 获取指定应用所有插件
   * @param {string} [appId]
   * @returns {*}  {(IModel[])}
   * @memberof IAppHubService
   */
  getPlugins(appId?: string): IModel[];

  /**
   * @description 原始模型转化为dsl对象
   * @param {IData} data
   * @param {('APP' | 'VIEW' | 'CTRL' | 'APPENTITY')} type
   * @returns {*}  {(Promise<IModel | undefined>)}
   * @memberof IAppHubService
   */
  translationModelToDsl(
    data: IData,
    type: 'APP' | 'VIEW' | 'CTRL' | 'APPENTITY',
  ): Promise<IModel | undefined>;

  /**
   * @description 新建应用
   * @param {string} id
   * @returns {*}  {Promise<Application>}
   * @memberof IAppHubService
   */
  createApp(id: string): Promise<Application>;

  /**
   * @description 异步获取应用对象，用于不确定应用是否已经加载的情况
   * @param {string} [appId=ibiz.env.appId]
   * @returns {*}  {Promise<IAppService>}
   * @memberof IAppHubService
   */
  getAppAsync(appId?: string): Promise<IAppService>;

  /**
   * @description 获取应用实例
   * @param {(string | IApplication)} [app]
   * @returns {*}  {IAppService}
   * @memberof IAppHubService
   */
  getApp(app?: string | IApplication): IAppService;

  /**
   * @description 获取所有应用实例
   * @returns {*}  {IAppService[]}
   * @memberof IAppHubService
   */
  getAllApps(): IAppService[];

  /**
   * @description 通过标识获取应用对象
   * @param {string} id
   * @returns {*}  {(IAppService | undefined)}
   * @memberof IAppHubService
   */
  getAppById(id: string): IAppService | undefined;

  /**
   * @description 获取应用实体服务
   * @param {string} appId
   * @param {string} entityId
   * @param {IContext} context
   * @returns {*}  {Promise<IAppDEService>}
   * @memberof IAppHubService
   */
  getAppDEService(
    appId: string,
    entityId: string,
    context: IContext,
  ): Promise<IAppDEService>;

  /**
   * @description 设置应用原始模型
   * @param {string} key
   * @param {IModel} model
   * @memberof IAppHubService
   */
  setAppSourceModel(key: string, model: IModel): void;

  /**
   * @description 获取应用原始模型
   * @param {(string | IApplication)} [app]
   * @returns {*}  {IModel}
   * @memberof IAppHubService
   */
  getAppSourceModel(app?: string | IApplication): IModel;

  /**
   * @description 合并子应用代码表
   * @param {IAppCodeList} codeList
   * @memberof IAppHubService
   */
  mergeSubAppCodeList(codeList: IAppCodeList): void;
}
