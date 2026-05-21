import { Net } from '@ibiz-template/core';
import {
  IAppDEUIAction,
  IAppFunc,
  IAppUtil,
  IApplication,
  IDEOPPriv,
  IDEUILogic,
  ISubAppRef,
  ISysPFPlugin,
  IAppDEFInputTipSet,
  IAppPFPluginRef,
} from '@ibiz/model-core';
import {
  AuthorityService,
  CodeListService,
  ConfigService,
  DEServiceUtil,
} from './service';
import { IAppService } from './interface';

/**
 * 应用对象
 *
 * @author chitanda
 * @date 2023-04-23 15:04:59
 * @export
 * @class Application
 * @implements {IAppService}
 */
export class Application implements IAppService {
  /**
   * 当前应用标识(带系统标识)
   *
   * @author chitanda
   * @date 2023-04-19 22:04:55
   * @readonly
   * @type {string}
   */
  get appId(): string {
    return this.model.appId || ibiz.env.appId;
  }

  /**
   * 当前应用标识(仅标识)
   *
   * @author tony001
   * @date 2024-09-11 14:09:43
   * @readonly
   * @type {string}
   */
  get id(): string {
    return this.model.id!;
  }

  /**
   * 应用实体名称到应用实体代码名称的映射
   *
   * @author chitanda
   * @date 2023-06-14 17:06:02
   * @type {Map<string, string>}
   */
  readonly deName2DeCodeName: Map<string, string> = new Map();

  /**
   * 应用智能报表体系映射，key为应用智能报表体系标识，value为原始模型
   *
   * @author tony001
   * @date 2024-06-04 15:06:35
   * @type {Map<string, IModel>}
   */
  readonly appBISchemeMap: Map<string, IModel> = new Map();

  /**
   * 应用智能报表立方体映射，key为应用智能报表立方体标识，value为原始模型
   *
   * @author tony001
   * @date 2024-06-04 15:06:56
   * @type {Map<string, IModel>}
   */
  readonly appBICubeMap: Map<string, IModel> = new Map();

  /**
   * 应用智能报表映射，key为应用智能报表立方体标识，value为原始模型
   *
   * @author tony001
   * @date 2024-06-04 15:06:57
   * @type {Map<string, IModel>}
   */
  readonly appBIReportMap: Map<string, IModel> = new Map();

  /**
   * 应用请求服务
   *
   * @author chitanda
   * @date 2022-12-22 15:12:33
   * @type {Net}
   */
  readonly net: Net;

  /**
   * 应用级配置存储服务
   *
   * @author chitanda
   * @date 2023-09-22 10:09:58
   * @type {ConfigService}
   */
  readonly configCache: ConfigService;

  /**
   * 应用实体服务工具对象
   *
   * @author chitanda
   * @date 2022-12-23 10:12:46
   */
  readonly deService: DEServiceUtil;

  /**
   * 代码表服务
   *
   * @author chitanda
   * @date 2022-12-23 11:12:40
   * @type {CodeListService}
   */
  readonly codeList: CodeListService;

  /**
   * 权限服务
   *
   * @author chitanda
   * @date 2022-12-23 11:12:11
   * @type {AuthorityService}
   */
  readonly authority: AuthorityService;

  /**
   * Creates an instance of Application.
   *
   * @author chitanda
   * @date 2022-12-22 15:12:26
   * @param {IApplication} model
   */
  constructor(
    public readonly model: IApplication,
    public readonly subAppRef: ISubAppRef | undefined,
  ) {
    this.net = new Net({
      baseURL: `${ibiz.env.baseUrl}/${subAppRef && subAppRef.serviceId ? subAppRef.serviceId : this.appId}`,
    });
    this.configCache = new ConfigService(
      this.appId!,
      'PSSysApp',
      model.codeName!,
    );
    this.deService = new DEServiceUtil(model);
    this.codeList = new CodeListService(model);
    this.authority = new AuthorityService(model);
  }

  /**
   * 初始化应用
   *
   * @author chitanda
   * @date 2023-04-19 11:04:02
   * @return {*}  {Promise<void>}
   */
  async init(): Promise<void> {
    await this.authority.init();
    await this.loadAppModelStyle();
    await this.loadGlobalAppUtil();
    await this.loadReplaceDefaultPlugin();
  }

  /**
   * 加载应用模型全局样式
   *
   * @author chitanda
   * @date 2023-07-24 20:07:41
   * @protected
   * @return {*}  {Promise<void>}
   */
  protected async loadAppModelStyle(): Promise<void> {
    const style = await ibiz.hub.getAppStyle(this.appId);
    if (style) {
      const dom = document.createElement('style');
      dom.setAttribute('type', 'text/css');
      dom.id = this.appId;
      dom.innerHTML = style;
      document.head.appendChild(dom);
    }
  }

  /**
   * 加载应用插件(用于替换默认的组件和功能)
   *
   * @author tony001
   * @date 2025-01-24 14:01:34
   * @protected
   * @return {*}  {Promise<void>}
   */
  protected async loadGlobalAppUtil(): Promise<void> {
    const appUtilTag: string = `${ibiz.env.isMob ? 'MOB_' : ''}GLOBAL_APP_UTIL`;
    const globalAppUtilPlugin = ibiz.hub.getPlugin(
      appUtilTag.toLowerCase(),
      this.appId,
    );
    if (!globalAppUtilPlugin) return;
    if (
      globalAppUtilPlugin.refMode !== 'APP' ||
      globalAppUtilPlugin.refTag !== appUtilTag
    )
      return;
    await ibiz.plugin.loadPlugin(globalAppUtilPlugin as ISysPFPlugin);
  }

  /**
   * @description 加载替换默认插件（仅主应用执行）
   * @protected
   * @returns {*}  {Promise<void>}
   * @memberof Application
   */
  protected async loadReplaceDefaultPlugin(): Promise<void> {
    if (this.appId !== ibiz.env.appId) return;
    const appPlugins: IAppPFPluginRef[] = ibiz.hub.getPlugins(
      this.appId,
    ) as IAppPFPluginRef[];
    const tempPlugins = appPlugins?.filter(
      (appPFPluginRef: IAppPFPluginRef) => {
        // 远程插件且能替换全局
        return (
          appPFPluginRef.runtimeObject === true &&
          appPFPluginRef.pluginParams &&
          appPFPluginRef.pluginParams.replaceglobal === 'true'
        );
      },
    );
    if (tempPlugins && tempPlugins.length > 0) {
      for (let i = 0; i < tempPlugins.length; i++) {
        await ibiz.plugin.loadPlugin(tempPlugins[i] as ISysPFPlugin);
      }
    }
  }

  /**
   * 根据 id 查找应用功能
   *
   * @author chitanda
   * @date 2023-04-20 17:04:24
   * @param {string} id
   * @return {*}  {(IAppFunc | null)}
   */
  getAppFunc(id: string): IAppFunc | null {
    const items: IAppFunc[] = this.model.appFuncs || [];
    const item = items.find(func => func.id === id);
    return item || null;
  }

  /**
   * 根据id获取应用功能组件
   *
   * @author tony001
   * @date 2024-04-23 11:04:27
   * @param {string} id
   * @return {*}  {(IAppUtil | undefined)}
   */
  getAppUtil(
    id: string,
    type: 'CUSTOM' | 'DEFAULT' = 'DEFAULT',
  ): IAppUtil | undefined {
    const appUtils: IAppUtil[] = this.model.appUtils || [];
    let appUtil: IAppUtil | undefined;
    // 自定义类型使用应用功能组件功能标记识别，反之使用使用应用功能组件标识识别
    if (type === 'CUSTOM') {
      appUtil = appUtils.find(item => item.utilTag === id);
    } else {
      appUtil = appUtils.find(item => item.id === id);
    }

    return appUtil;
  }

  /**
   * 根据id获取应用实体属性输入提示集合
   *
   * @param {string} id
   * @return {*}  {(IAppDEFInputTipSet | undefined)}
   * @memberof Application
   */
  getInputTipsSet(id: string): IAppDEFInputTipSet | undefined {
    return this.model.appDEFInputTipSets?.find(item => item.id === id);
  }

  /**
   * 获取界面行为模型
   * @author lxm
   * @date 2023-04-28 05:44:14
   * @param {string} actionId
   * @param {string} [_appDataEntityId]
   * @return {*}
   */
  async getUIAction(actionId: string): Promise<IAppDEUIAction | undefined> {
    const [, appDeId] = actionId.split('@');
    // 查找实体界面行为
    if (appDeId) {
      const appDataEntity = await ibiz.hub.getAppDataEntity(
        appDeId,
        this.appId,
      );
      const find = appDataEntity.appDEUIActions!.find(action => {
        return action.id === actionId;
      });
      if (find) {
        return find;
      }
    }
    // 查找应用的界面行为
    return this.model.appDEUIActions!.find(action => {
      return action.id === actionId;
    });
  }

  /**
   * 获取操作标识模型
   * @author lxm
   * @date 2023-05-10 11:24:17
   * @param {string} id
   * @param {string} [appDataEntityId]
   * @return {*}  {(Promise<IDEOPPriv | undefined>)}
   */
  async getOPPriv(
    id: string,
    appDataEntityId?: string,
  ): Promise<IDEOPPriv | undefined> {
    let result = this.model.deopprivs?.find(item => item.name === id);
    // 查找实体的操作标识
    if (!result && appDataEntityId) {
      const appDataEntity = await ibiz.hub.getAppDataEntity(
        appDataEntityId,
        this.appId,
      );
      result = appDataEntity.deopprivs?.find(item => item.name === id);
    }
    return result;
  }

  /**
   * 查找实体的界面逻辑模型
   * @author lxm
   * @date 2023-06-14 07:20:30
   * @param {string} deUILogicId
   * @param {string} appDataEntityId
   * @return {*}  {(Promise<IDEUILogic | undefined>)}
   */
  async getDEUILogic(
    deUILogicId: string,
    appDataEntityId: string,
  ): Promise<IDEUILogic | undefined> {
    const appDataEntity = await ibiz.hub.getAppDataEntity(
      appDataEntityId,
      this.appId,
    );
    return appDataEntity.appDEUILogics!.find(logic => {
      return logic.id === deUILogicId;
    });
  }

  /**
   * 销毁应用
   *
   * @author tony001
   * @date 2024-04-10 15:04:51
   */
  destroy(): void {
    this.codeList.destroy();
  }
}
