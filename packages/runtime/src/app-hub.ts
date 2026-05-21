import {
  IAppBICube,
  IAppBIReport,
  IAppBIScheme,
  IAppCodeList,
  IAppDataEntity,
  IAppView,
  IApplication,
  ISubAppRef,
} from '@ibiz/model-core';
import { getToken, RuntimeError } from '@ibiz-template/core';
import { Application } from './application';
import {
  IAppDEService,
  IAppHubService,
  IAppService,
  IMicroAppConfigCenter,
  ModelLoaderProvider,
} from './interface';
import { AppConfigService, Convert } from './hub';
import { HubController } from './controller';
import { ConfigService, MqttService } from './service';
import { NoticeController } from './controller/notification';
import { MicroAppConfigCenter } from './micro-app';

/**
 * 运行时总集
 *
 * @author chitanda
 * @date 2022-12-21 14:12:00
 * @export
 * @class AppHub
 */
export class AppHub implements IAppHubService {
  /**
   * 多应用模式下，应用模型转换器
   *
   * @author chitanda
   * @date 2023-04-23 15:04:06
   * @type {Convert}
   */
  readonly convert: Convert = new Convert();

  /**
   * @description 微应用配置中心（仅全代码使用）
   * @type {IMicroAppConfigCenter}
   * @memberof AppHub
   */
  readonly microAppConfigCenter: IMicroAppConfigCenter =
    new MicroAppConfigCenter();

  /**
   * 全局控制器，放置全局性的功能性方法
   *
   * @author chitanda
   * @date 2023-08-21 15:08:48
   */
  readonly controller = new HubController();

  /**
   * 基座级配置存储服务
   *
   * @author chitanda
   * @date 2023-09-22 10:09:25
   * @type {ConfigService}
   */
  configCache!: ConfigService;

  /**
   * 应用总集
   *
   * @author chitanda
   * @date 2022-12-21 14:12:45
   * @protected
   * @type {Map<string, Application>}
   */
  protected appMap: Map<string, Application> = new Map();

  /**
   * @description 原始应用模型
   * @protected
   * @type {Map<string, IModel>}
   * @memberof AppHub
   */
  protected appModelMap: Map<string, IModel> = new Map();

  /**
   * 当前基座下所有的应用视图
   *
   * @author chitanda
   * @date 2023-04-17 11:04:20
   * @protected
   * @type {Map<string, string>} Map<视图 id, 视图所属应用>
   */
  protected view2appMap: Map<string, string> = new Map();

  /**
   * 当前注册的应用视图优先级
   *
   * @author chitanda
   * @date 2024-01-15 15:01:57
   * @protected
   * @type {Map<string, number>}
   */
  protected view2appPriorityMap: Map<string, number> = new Map();

  /**
   * 实例化的应用视图模型
   *
   * @author chitanda
   * @date 2023-04-17 23:04:00
   * @protected
   * @type {Map<string, IAppView>}
   */
  protected views: Map<string, IAppView> = new Map();

  /**
   * 子应用dr部件模型
   *
   * @author tony001
   * @date 2024-04-29 15:04:24
   * @protected
   * @type {Map<string, IModel[]>}
   */
  protected drcontrols: Map<string, IModel[]> = new Map();

  /**
   * 子应用分页导航面板模型
   */
  protected subAppTabExpPanels: Map<string, IModel[]> = new Map();

  /**
   * 子应用界面行为组模型
   *
   * @author tony001
   * @date 2024-09-09 10:09:02
   * @protected
   * @type {Map<string, IModel[]>} key为应用标识、value为所有子应用该标识的界面行为组
   */
  protected subAppDEUIActionGroups: Map<string, IModel[]> = new Map();

  /**
   * 子应用菜单模型（不包含主菜单）
   *
   * @author tony001
   * @date 2024-09-26 13:09:07
   * @protected
   * @type {Map<string, IModel[]>} key为应用标识、value为所有子应用该标识的菜单模型
   */
  protected subAppMenuModels: Map<string, IModel[]> = new Map();

  /**
   * 子应用部件模型（不包含drctrl）
   *
   * @author tony001
   * @date 2024-09-26 13:09:04
   * @protected
   * @type {Map<string, IModel[]>}
   */
  protected subAppControls: Map<string, IModel[]> = new Map();

  /**
   * 应用实体实例模型
   *
   * @author chitanda
   * @date 2023-04-17 23:04:32
   * @protected
   * @type {Map<string, Map<string, IAppDataEntity>>}
   */
  protected dataEntities: Map<string, Map<string, IAppDataEntity>> = new Map();

  /**
   * 模型加载适配器由外部注册，存在时使用
   *
   * @author chitanda
   * @date 2023-04-17 23:04:02
   * @type {ModelLoaderProvider}
   */
  protected modelLoaderProvider?: ModelLoaderProvider;

  /**
   * 插件清单，key为应用标识，值为key为插件标识，value为插件模型对象的MAP
   *
   * @author tony001
   * @date 2024-11-26 17:11:15
   * @protected
   * @type {Map<string, Map<string, IModel>>}
   */
  protected plugins: Map<string, Map<string, IModel>> = new Map();

  /**
   * 子应用代码表清单，key为应用标识，值为key为代码表标识，value为代码表模型对象MAP
   *
   * @author tony001
   * @protected
   * @type {Map<string, Map<string, IAppCodeList>>}
   */
  protected codeLists: Map<string, Map<string, IAppCodeList>> = new Map();

  /**
   * hub配置信息服务
   * @author lxm
   * @date 2023-07-03 07:12:05
   */
  config = new AppConfigService();

  notice = new NoticeController();

  /**
   * 默认首页视图名称
   *
   * @author chitanda
   * @date 2023-04-19 20:04:22
   * @type {string}
   */
  defaultAppIndexViewName: string = 'Index';

  /**
   * 默认页面
   *
   * @author tony001
   * @date 2024-05-09 13:05:58
   * @type {(IModel | undefined)}
   */
  defaultPage: IModel | undefined;

  /**
   * mqtt 服务
   *
   * @author tony001
   * @date 2024-12-14 15:12:20
   * @type {MqttService}
   */
  mqtt?: MqttService;

  /**
   * @description 当前激活的微应用标识
   * @type {string}
   * @memberof AppHub
   */
  activeMicroAppId: string = '';

  /**
   * 初始化Mqtt服务
   *
   * @author tony001
   * @date 2024-12-14 15:12:24
   * @return {*}  {Promise<void>}
   */
  async initMqtt(): Promise<void> {
    // 如果已经存在，即重新初始化，把旧的销毁
    if (this.mqtt) {
      this.mqtt.close();
    }

    if (
      ibiz.env.enableMqtt &&
      ibiz.appData &&
      ibiz.appData.mqtttopic &&
      ibiz.auth.isAnonymous !== true
    ) {
      this.mqtt = new MqttService(
        ibiz.appData.mqtttopic,
        getToken()!,
        ibiz.env.appId,
      );
      this.mqtt.evt.on('message', (_topic, msg) => {
        ibiz.mc.next(msg);
      });
      await this.mqtt.connect();
    }
  }

  /**
   * 预加载子应用
   *
   * @author tony001
   * @date 2025-04-03 10:04:19
   * @return {*}  {Promise<void>}
   */
  async preLoadSubApp(): Promise<void> {
    // 存在菜单模型的子应用需要预加载
    if (this.subAppMenuModels.size > 0) {
      for (const appId of this.subAppMenuModels.keys()) {
        await this.getAppAsync(appId);
      }
    }
  }

  /**
   * 计算应用视图 标识
   *
   * @author chitanda
   * @date 2023-04-20 18:04:48
   * @protected
   * @param {string} tag
   * @return {*}  {string}
   */
  protected calcAppViewId(tag: string = ''): string {
    let id = '';
    if (tag && tag.indexOf('.') !== -1) {
      const ids = tag.split('.');
      id = ids[ids.length - 1];
    } else {
      id = tag.toLowerCase();
    }
    return id;
  }

  /**
   * 注册模型加载适配器
   *
   * @author chitanda
   * @date 2023-04-17 23:04:14
   * @param {ModelLoaderProvider} provider
   */
  registerModelLoaderProvider(provider: ModelLoaderProvider): void {
    this.modelLoaderProvider = provider;
  }

  /**
   * 注册应用视图实例模型
   *
   * @author chitanda
   * @date 2023-04-17 23:04:42
   * @param {IAppView} model
   */
  registerAppView(model: IAppView): void {
    this.views.set(model.codeName!.toLowerCase(), model);
  }

  /**
   *  注册子应用dedrcontrols模型
   *
   * @author tony001
   * @date 2024-04-29 15:04:36
   * @param {string} appId
   * @param {IModel} model
   */
  registerSubAppDrControls(appId: string, model: IModel): void {
    if (!this.drcontrols.has(appId)) {
      this.drcontrols.set(appId, []);
    }
    const targetAppDrControls = this.drcontrols.get(appId);
    targetAppDrControls?.push(model);
  }

  /**
   * 注册子应用分页导航面板模型
   * @param appId
   * @param model
   */
  registerSubAppTabExpPanel(appId: string, model: IModel): void {
    if (!this.subAppTabExpPanels.has(appId)) {
      this.subAppTabExpPanels.set(appId, []);
    }
    const targetAppTabExpPanels = this.subAppTabExpPanels.get(appId);
    targetAppTabExpPanels?.push(model);
  }

  /**
   * 注册子应用界面行为组
   *
   * @author tony001
   * @date 2024-09-09 10:09:05
   * @param {string} appId
   * @param {IModel} model
   */
  registerSubAppDEUIActionGroups(appId: string, model: IModel): void {
    if (!this.subAppDEUIActionGroups.has(appId)) {
      this.subAppDEUIActionGroups.set(appId, []);
    }
    const targetAppDEUIActionGroups = this.subAppDEUIActionGroups.get(appId);
    targetAppDEUIActionGroups?.push(model);
  }

  /**
   * 注册子应用菜单模型
   *
   * @author tony001
   * @date 2024-09-26 13:09:36
   * @param {string} appId
   * @param {IModel} model
   */
  registerSubAppMenuModels(appId: string, model: IModel): void {
    if (!this.subAppMenuModels.has(appId)) {
      this.subAppMenuModels.set(appId, []);
    }
    const targetAppMenuModels = this.subAppMenuModels.get(appId);
    targetAppMenuModels!.push(model);
  }

  /**
   * 注册子应用部件模型
   *
   * @author tony001
   * @date 2024-09-26 13:09:35
   * @param {string} appId
   * @param {IModel} model
   */
  registerSubAppControls(appId: string, model: IModel): void {
    if (!this.subAppControls.has(appId)) {
      this.subAppControls.set(appId, []);
    }
    const targetSubAppControls = this.subAppControls.get(appId);
    targetSubAppControls!.push(model);
  }

  /**
   * 注册应用实体
   *
   * @author chitanda
   * @date 2023-04-17 23:04:24
   * @param {IAppDataEntity} model
   * @param {string} [appId=ibiz.env.appId]
   */
  registerAppDataEntity(
    model: IAppDataEntity,
    appId: string = ibiz.env.appId,
  ): void {
    if (!this.dataEntities.has(appId)) {
      this.dataEntities.set(appId, new Map());
    }
    const map = this.dataEntities.get(appId)!;
    map.set(model.id!, model);
  }

  /**
   * 设置插件
   *
   * @author tony001
   * @date 2024-11-26 16:11:03
   * @param {IModel} plugin
   * @param {string} [appId=ibiz.env.appId]
   */
  setPlugin(plugin: IModel, appId: string = ibiz.env.appId): void {
    if (!this.plugins.has(appId)) {
      this.plugins.set(appId, new Map());
    }
    const isMainApp = appId === ibiz.env.appId;
    const tag: string = plugin.pluginCode!.toLowerCase();
    if (isMainApp) {
      const mainPlugins = this.plugins.get(appId);
      mainPlugins!.set(tag, plugin);
    } else {
      const mainPlugins = this.plugins.get(ibiz.env.appId);
      const subPlugins = this.plugins.get(appId);
      if (mainPlugins!.has(tag)) {
        if (plugin.replaceDefault) {
          mainPlugins!.set(tag, plugin);
          subPlugins!.set(tag, plugin!);
        } else {
          const mainPlugin = mainPlugins!.get(tag);
          subPlugins!.set(tag, mainPlugin!);
        }
      } else {
        subPlugins?.set(tag, plugin);
      }
    }
  }

  /**
   * 获取插件
   *
   * @author tony001
   * @date 2024-11-26 17:11:15
   * @param {string} pluginId
   * @param {string} [appId=ibiz.env.appId]
   * @return {*}  {(IModel | undefined)}
   */
  getPlugin(
    pluginId: string,
    appId: string = ibiz.env.appId,
  ): IModel | undefined {
    return this.plugins.get(appId)?.get(pluginId);
  }

  /**
   * @description 获取指定应用所有插件
   * @param {*} [appIdstring=ibiz.env.appId]
   * @returns {*}  {(IModel[])}
   * @memberof AppHub
   */
  getPlugins(appId: string = ibiz.env.appId): IModel[] {
    const result = this.plugins.get(appId);
    if (result) {
      return Array.from(result.values());
    }
    return [];
  }

  /**
   * 注册子应用代码表
   *
   * @author tony001
   * @param {string} appId
   * @param {IAppCodeList} model
   */
  registerSubAppCodeList(appId: string, model: IAppCodeList): void {
    if (!this.codeLists.has(appId)) {
      this.codeLists.set(appId, new Map());
    }
    const map = this.codeLists.get(appId)!;
    map.set(model.codeListTag!, model);
  }

  /**
   * 设置应用视图所属应用
   *
   * @author chitanda
   * @date 2024-01-15 15:01:41
   * @param {string} tag 视图 codeName 或者视图 id
   * @param {string} [appId=ibiz.env.appId]
   * @param {number} [priority=-1] 视图的优先级，值越小优先级越高。10为最高优先级
   */
  setAppView(
    tag: string,
    appId: string = ibiz.env.appId,
    priority: number = -1,
  ): void {
    if (priority <= 0) {
      priority = 50;
    }
    const id = this.calcAppViewId(tag);
    if (this.view2appMap.has(id)) {
      const _priority = this.view2appPriorityMap.get(id);
      // 已经存在优先级高的视图直接跳过，若优先级相同或更高则覆盖
      if (_priority && _priority < priority) {
        return;
      }
    }
    this.view2appMap.set(id, appId);
    if (priority !== -1) {
      this.view2appPriorityMap.set(id, priority);
    }
  }

  /**
   * 判断应用视图是否存在
   *
   * @author chitanda
   * @date 2023-04-20 18:04:00
   * @param {string} tag 视图 codeName 或者视图 id
   * @return {*}  {boolean}
   */
  hasAppView(tag: string): boolean {
    const id = this.calcAppViewId(tag);
    return this.view2appMap.has(id);
  }

  /**
   * 获取应用样式
   *
   * @author chitanda
   * @date 2023-09-06 10:09:22
   * @param {string} appId
   * @return {*}  {(Promise<string | null>)}
   */
  async getAppStyle(appId: string): Promise<string | null> {
    if (this.modelLoaderProvider) {
      return this.modelLoaderProvider.getAppStyle(appId);
    }
    return null;
  }

  /**
   * 获取应用智能报表体系
   *
   * @author tony001
   * @date 2024-06-06 16:06:57
   * @param {string[]} [ids=[]]
   * @param {string} [appId=ibiz.env.appId]
   * @return {*}  {Promise<IAppBIScheme[]>}
   */
  async getAppBISchemes(
    ids: string[] = [],
    appId: string = ibiz.env.appId,
  ): Promise<IAppBIScheme[]> {
    if (this.modelLoaderProvider) {
      return this.modelLoaderProvider.getAppBISchemes(appId, ids);
    }
    return [];
  }

  /**
   * 获取应用智能报表立方体数据
   *
   * @author tony001
   * @date 2024-06-04 16:06:03
   * @param {string[]} ids
   * @param {string} appId
   * @return {*}  {Promise<IAppBICube[]>}
   */
  async getAppAppBICubes(
    ids: string[],
    appId: string = ibiz.env.appId,
  ): Promise<IAppBICube[]> {
    if (this.modelLoaderProvider) {
      return this.modelLoaderProvider.getAppAppBICubes(appId, ids);
    }
    return [];
  }

  /**
   * 获取应用智能报表数据
   *
   * @author tony001
   * @date 2024-06-04 16:06:25
   * @param {string[]} ids
   * @param {string} appId
   * @return {*}  {Promise<IAppBIReport[]>}
   */
  async getAppBIReports(
    ids: string[],
    appId: string = ibiz.env.appId,
  ): Promise<IAppBIReport[]> {
    if (this.modelLoaderProvider) {
      return this.modelLoaderProvider.getAppBIReports(appId, ids);
    }
    return [];
  }

  /**
   * 根据视图代码名称查找视图
   *
   * @author chitanda
   * @date 2023-04-17 21:04:14
   * @param {string} tag 视图 codeName 或者视图 id
   * @return {*}  {Promise<IAppView>}
   */
  async getAppView(tag: string): Promise<IAppView> {
    const id = this.calcAppViewId(tag);
    const appId = this.view2appMap.get(id) || ibiz.env.appId;
    if (!this.appMap.has(appId)) {
      await this.createApp(appId);
    }
    if (this.views.has(id)) {
      return this.views.get(id)!;
    }
    if (this.modelLoaderProvider) {
      const appView = await this.modelLoaderProvider.getAppView(appId, id);
      this.registerAppView(appView);
      return appView;
    }
    throw new RuntimeError(ibiz.i18n.t('runtime.hub.noExist', { id }));
  }

  /**
   * 根据DrControl的名称和子应用标识获取模型
   *
   * @author tony001
   * @date 2024-04-29 15:04:25
   * @param {string} tag
   * @param {string} appId
   * @return {*}  {Promise<IModel | undefined>}
   */
  getSubAppDrControl(tag: string, appId: string): IModel | undefined {
    if (!this.drcontrols.has(appId)) {
      return undefined;
    }
    const targetAppDrControls = this.drcontrols.get(appId);
    return targetAppDrControls!.find(item => {
      return (
        `${item.appDataEntityId!.split('.')[1]}_${item.modelType}_${item.dataRelationTag}`.toLowerCase() ===
        tag
      );
    });
  }

  /**
   * @description 根据分页导航面板的唯一标识（uniqueTag）获取模型
   * @param tag
   * @param appId
   */
  getSubAppTabExpPanel(tag: string, appId: string): IModel | undefined {
    if (!this.subAppTabExpPanels.has(appId)) {
      return undefined;
    }
    const targetAppTabExpPanels = this.subAppTabExpPanels.get(appId);
    return targetAppTabExpPanels!.find(item => {
      return item.uniqueTag === tag;
    });
  }

  /**
   * 根据界面行为组标识和子应用标识获取模型
   *
   * @author tony001
   * @date 2024-09-09 11:09:43
   * @param {string} tag
   * @param {string} appId
   * @return {*}  {(IModel | undefined)}
   */
  getSubAppDEUIActionGroups(tag: string, appId: string): IModel | undefined {
    if (!this.subAppDEUIActionGroups.get(appId)) {
      return undefined;
    }
    const targetSubAppDEUIActionGroups = this.subAppDEUIActionGroups.get(appId);
    return targetSubAppDEUIActionGroups!.find(item => {
      return item.uniqueTag === tag;
    });
  }

  /**
   * 根据菜单名称和子应用标识获取菜单模型
   *
   * @author tony001
   * @date 2024-09-26 14:09:50
   * @param {string} tag
   * @param {string} appId
   * @return {*}  {(IModel | undefined)}
   */
  getSubAppMenuModel(tag: string, appId: string): IModel | undefined {
    if (!this.subAppMenuModels.has(appId)) {
      return undefined;
    }
    const targetSubAppMenuModels = this.subAppMenuModels.get(appId);
    return targetSubAppMenuModels!.find(item => {
      return tag.startsWith(item.name.split('hubsubapp_')[1]);
    });
  }

  /**
   * 根据部件标识和子应用标识获取部件模型
   *
   * @author tony001
   * @date 2024-09-26 17:09:58
   * @param {string} tag
   * @param {string} appId
   * @return {*}  {(IModel | undefined)}
   */
  getSubAppControl(tag: string, appId: string): IModel | undefined {
    if (!this.subAppControls.has(appId)) {
      return undefined;
    }
    const targetSubAppControls = this.subAppControls.get(appId);
    return targetSubAppControls!.find(item => {
      const ids: string[] = item.id.split('.');
      return tag === ids[1] + ids[2];
    });
  }

  /**
   * 根据视图模型路径，加参数重新计算视图模型
   *
   * @author chitanda
   * @date 2024-01-08 11:01:54
   * @param {string} appId
   * @param {string} modelPath
   * @param {IParams} params
   * @return {*}  {Promise<IAppView>}
   */
  async loadAppView(
    appId: string,
    modelPath: string,
    params: IParams,
  ): Promise<IAppView> {
    if (this.modelLoaderProvider) {
      const model = await this.modelLoaderProvider.loadAppView(
        appId,
        modelPath,
        params,
      );
      return model;
    }
    throw new RuntimeError(
      ibiz.i18n.t('runtime.hub.noExist', { id: modelPath }),
    );
  }

  /**
   * 根据应用实体代码名称查找应用视图
   *
   * @author chitanda
   * @date 2023-04-17 23:04:08
   * @param {string} name
   * @param {string} [appId=ibiz.env.appId]
   * @return {*}  {Promise<IAppDataEntity>}
   */
  async getAppDataEntity(
    id: string,
    appId: string = ibiz.env.appId,
  ): Promise<IAppDataEntity> {
    if (!this.appMap.has(appId)) {
      await this.createApp(appId);
    }
    if (this.dataEntities.has(appId)) {
      const map = this.dataEntities.get(appId)!;
      // 外部传入可能是codeName，也可能是id
      if (id.indexOf('.') === -1) {
        const targetEntity = Array.from(map.values()).find(
          value => value.codeName === id,
        );
        if (targetEntity) {
          return targetEntity;
        }
      } else if (map.has(id)) {
        return map.get(id)!;
      }
    }
    if (this.modelLoaderProvider) {
      let entity;
      if (id.indexOf('.') !== -1) {
        entity = await this.modelLoaderProvider.getAppDataEntity(appId, id);
      } else {
        entity = await this.modelLoaderProvider.getAppDataEntityByCodeName(
          appId,
          id,
        );
      }
      this.registerAppDataEntity(entity, appId);
      return entity;
    }
    throw new RuntimeError(ibiz.i18n.t('runtime.service.noFound', { id }));
  }

  /**
   * 根据代码表标识获取子应用代码表
   *
   * @author tony001
   * @param {string} id
   * @param {string} [appId=ibiz.env.appId]
   * @return {*}  {Promise<IAppCodeList>}
   */
  getSubAppCodeList(
    id: string,
    appId: string = ibiz.env.appId,
  ): IAppCodeList | undefined {
    const targetCodeListMap = this.codeLists.get(appId);
    return targetCodeListMap?.get(id);
  }

  /**
   * 新建 hub 应用
   *
   * @author chitanda
   * @date 2023-04-17 21:04:11
   * @param {string} id
   * @return {*}  {Promise<Application>}
   */
  async createApp(id: string): Promise<Application> {
    if (this.appMap.has(id)) {
      return this.appMap.get(id)!;
    }
    if (!this.modelLoaderProvider) {
      throw new RuntimeError(ibiz.i18n.t('runtime.utils.firstregister'));
    }
    const appModel: IApplication = await this.modelLoaderProvider.getApp(id);
    const subAppRef: ISubAppRef | undefined =
      await this.modelLoaderProvider.getSubAppRef(id);
    const app = new Application(appModel, subAppRef);
    this.appMap.set(id, app);
    await this.modelLoaderProvider.initApp(id);
    await app.init();
    if (id === ibiz.env.appId) {
      await this.initMqtt();
      await this.preLoadSubApp();
    }
    if (!this.configCache) {
      this.configCache = new ConfigService(
        ibiz.env.appId,
        'PSSysHub',
        'Global',
      );
    }
    return app;
  }

  /**
   * 异步获取应用对象，用于不确定应用是否已经加载的情况
   *
   * @author chitanda
   * @date 2023-04-17 21:04:41
   * @param {string} [key=ibiz.env.appId]
   * @return {*}  {Promise<IAppService>}
   */
  async getAppAsync(key: string = ibiz.env.appId): Promise<IAppService> {
    return this.createApp(key);
  }

  /**
   * 根据应用 id 或应用模型获取应用实例
   *
   * @author chitanda
   * @date 2023-04-17 22:04:42
   * @param {(string | IApplication)} [app]
   * @return {*}  {IAppService}
   */
  getApp(app?: string | IApplication): IAppService {
    let key: string | null = null;
    if (app) {
      if (app instanceof Object) {
        key = (app as IApplication).id!;
      } else {
        key = app;
      }
    } else {
      key = ibiz.env.appId;
    }
    return this.appMap.get(key!)!;
  }

  /**
   * 通过标识获取应用对象
   *
   * @author tony001
   * @date 2024-09-11 15:09:13
   * @param {string} id
   * @return {*}  {(IAppService | undefined)}
   */
  getAppById(id: string): IAppService | undefined {
    let app: IAppService | undefined;
    if (this.appMap.size > 0) {
      const apps = Array.from(this.appMap.values());
      app = apps.find(item => {
        return item.id === id;
      });
    }
    return app;
  }

  /**
   * 获取所有应用实例
   *
   * @author chitanda
   * @date 2023-12-22 16:12:28
   * @return {*}  {IAppService[]}
   */
  getAllApps(): IAppService[] {
    if (this.appMap.size > 0) {
      return Array.from(this.appMap.values());
    }
    return [];
  }

  /**
   * 获取应用实体服务
   *
   * @author chitanda
   * @date 2024-01-10 13:01:01
   * @param {string} appId
   * @param {string} entityId
   * @param {IContext} context
   * @return {*}  {Promise<IAppDEService>}
   */
  async getAppDEService(
    appId: string,
    entityId: string,
    context: IContext,
  ): Promise<IAppDEService> {
    const app = await this.getAppAsync(appId);
    return app.deService.getService(context, entityId);
  }

  async translationModelToDsl(
    data: IData,
    type: 'APP' | 'VIEW' | 'CTRL' | 'APPENTITY',
  ): Promise<IModel | undefined> {
    if (this.modelLoaderProvider) {
      return this.modelLoaderProvider.translationModelToDsl(data, type);
    }
  }

  reset(): void {
    this.appMap.clear();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.configCache as any) = undefined;
  }

  setAppSourceModel(key: string, model: IModel): void {
    this.appModelMap.set(key, model);
  }

  getAppSourceModel(app?: string | IApplication): IModel {
    let key: string | null = null;
    if (app) {
      if (app instanceof Object) {
        key = (app as IApplication).id!;
      } else {
        key = app;
      }
    } else {
      key = ibiz.env.appId;
    }
    return this.appModelMap.get(key!)!;
  }

  /**
   * 销毁基座
   *
   * @author tony001
   * @date 2024-04-10 17:04:38
   */
  destroy(): void {
    ibiz.hub.getAllApps().forEach(app => {
      app.destroy();
    });
  }

  /**
   * 合并子应用代码表
   * @param codeList
   */
  mergeSubAppCodeList(codeList: IAppCodeList): void {
    if (!this.modelLoaderProvider) {
      throw new RuntimeError(ibiz.i18n.t('runtime.utils.firstregister'));
    }
    this.modelLoaderProvider.mergeSubAppCodeList(codeList);
  }
}
