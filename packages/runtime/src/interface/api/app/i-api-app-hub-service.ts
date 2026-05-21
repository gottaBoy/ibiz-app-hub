import { IAppDataEntity, IApplication, IAppView } from '@ibiz/model-core';
import { IApiContext } from '@ibiz-template/core';
import { IApiAppHubController } from './i-api-app-hub-controller';
import { IApiAppService } from './i-api-app-service';
import { IApiAppDEService } from '../service';
import { IMicroAppConfigCenter } from './i-micro-app-config-center';

/**
 * @description 应用中心服务接口
 * @export
 * @interface IApiAppHubService
 */
export interface IApiAppHubService {
  /**
   * @description 全局控制器，放置全局性的功能性方法
   * @type {IApiAppHubController}
   * @memberof IApiAppHubService
   */
  readonly controller: IApiAppHubController;

  /**
   * @description 微应用配置中心(仅全代码使用)
   * @type {IMicroAppConfigCenter}
   * @memberof IApiAppHubService
   */
  readonly microAppConfigCenter: IMicroAppConfigCenter;

  /**
   * @description 默认应用首页视图
   * @type {string}
   * @memberof IApiAppHubService
   */
  defaultAppIndexViewName: string;

  /**
   * @description 默认页面（用于匿名访问获取默认页面数据）
   * @type {(IModel | undefined)}
   * @memberof IApiAppHubService
   */
  defaultPage: IModel | undefined;

  /**
   * @description 根据应用视图 codeName 或 id 获取应用视图模型
   * @param {string} tag 视图id或者视图codeName
   * @returns {*}  {Promise<IAppView>}
   * @memberof IApiAppHubService
   */
  getAppView(tag: string): Promise<IAppView>;

  /**
   * @description 获取应用实体模型
   * @param {string} id 实体id或者实体codeName
   * @param {string} [appId] 应用标识
   * @returns {*}  {Promise<IAppDataEntity>}
   * @memberof IApiAppHubService
   */
  getAppDataEntity(id: string, appId?: string): Promise<IAppDataEntity>;

  /**
   * @description 异步获取应用对象，用于不确定应用是否已经加载的情况
   * @param {string} [appId=ibiz.env.appId] 应用标识
   * @returns {*}  {Promise<IApiAppService>}
   * @memberof IApiAppHubService
   */
  getAppAsync(appId?: string): Promise<IApiAppService>;

  /**
   * @description 获取应用实例
   * @param {(string | IApplication)} [app] 应用标识或者应用模型
   * @returns {*}  {IApiAppService}
   * @memberof IApiAppHubService
   */
  getApp(app?: string | IApplication): IApiAppService;

  /**
   * @description 获取所有应用实例
   * @returns {*}  {IApiAppService[]}
   * @memberof IApiAppHubService
   */
  getAllApps(): IApiAppService[];

  /**
   * @description 通过标识获取应用对象
   * @param {string} id 应用标识
   * @returns {*}  {(IApiAppService | undefined)}
   * @memberof IApiAppHubService
   */
  getAppById(id: string): IApiAppService | undefined;

  /**
   * @description 获取应用实体服务
   * @param {string} appId 应用标识
   * @param {string} entityId 实体id
   * @param {IApiContext} context 上下文参数
   * @returns {*}  {Promise<IApiAppDEService>}
   * @memberof IApiAppHubService
   */
  getAppDEService(
    appId: string,
    entityId: string,
    context: IApiContext,
  ): Promise<IApiAppDEService>;

  /**
   * @description 重置清空应用中心
   * @memberof IApiAppHubService
   */
  reset(): void;

  /**
   * @description 销毁应用中心
   * @memberof IApiAppHubService
   */
  destroy(): void;
}
