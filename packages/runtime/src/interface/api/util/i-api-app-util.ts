import {
  IApiContext,
  IApiData,
  IApiParams,
  IApiChatMessage,
} from '@ibiz-template/core';
import { IApiAuthResult, IApiControlController, IApiViewController } from '..';

/**
 * Ai聊天参数
 *
 * @export
 * @interface IApiAiChatParam
 */
export interface IApiAiChatParam {
  /**
   * 上下文
   *
   * @type {IApiContext}
   * @memberof IApiAiChatParam
   */
  context: IApiContext;

  /**
   * 视图参数
   *
   * @author tony001
   * @date 2025-02-20 15:02:05
   * @type {IApiParams}
   */
  params: IApiParams;

  /**
   * 业务数据
   *
   * @author tony001
   * @date 2025-02-20 15:02:50
   * @type {IApiData}
   */
  data: IApiData;

  /**
   * 应用实体
   *
   * @type {string}
   * @memberof IApiAiChatParam
   */
  appDataEntityId: string;

  /**
   * 应用实体自填模式
   *
   * @type {string}
   * @memberof IApiAiChatParam
   */
  appDEACModeId: string;

  /**
   * 当前上下文对应的视图控制器
   *
   * @type {IApiViewController}
   * @memberof IApiAiChatParam
   */
  view: IApiViewController;

  /**
   * 当前部件控制器
   *
   * @type {IApiControlController}
   * @memberof IApiAiChatParam
   */
  ctrl?: IApiControlController;
}

/**
 * 应用级功能接口定义，承载应用级功能实现，包含登录、注册、修改密码、切换主题等功能
 *
 * @author tony001
 * @date 2024-05-14 15:05:10
 * @export
 * @interface IApiAppUtil
 */
export interface IApiAppUtil {
  /**
   * @description 路由是否初始化构建完成
   * @returns {*}  {Promise<void>}
   * @memberof IApiAppUtil
   */
  onRouteIsReady(): Promise<void>;
  /**
   * 登录（包含调用登录逻辑，及跳转应用界面）
   *
   * @author tony001
   * @date 2024-05-14 15:05:07
   * @param {string} loginName
   * @param {string} password
   * @param {boolean} [remember]
   * @param {IApiData} [headers]
   * @param {IApiData} [opts]
   * @return {*}  {Promise<boolean>}
   */
  login(
    loginName: string,
    password: string,
    remember?: boolean,
    headers?: IApiData,
    opts?: IApiData,
  ): Promise<boolean>;

  /**
   * 登出（包含调用登录逻辑，及跳转登录页）
   *
   * @author tony001
   * @date 2024-05-14 15:05:24
   * @param {IApiData} [opts]
   * @return {*}  {Promise<boolean>}
   */
  logout(opts?: IApiData): Promise<boolean>;

  /**
   * 变更密码
   *
   * @author tony001
   * @date 2024-05-14 15:05:33
   * @param {string} oldPwd
   * @param {string} newPwd
   * @param {IApiData} [opts]
   * @return {*}  {Promise<IApiAuthResult>}
   */
  changePwd(
    oldPwd: string,
    newPwd: string,
    opts?: IApiData,
  ): Promise<IApiAuthResult>;

  /**
   * 切换组织
   *
   * @author tony001
   * @date 2024-05-14 15:05:51
   * @param {string} oldOrgId
   * @param {string} newOrgId
   * @param {IApiData} [opts]
   * @return {*}  {Promise<boolean>}
   */
  switchOrg(
    oldOrgId: string,
    newOrgId: string,
    opts?: IApiData,
  ): Promise<boolean>;

  /**
   * 切换主题
   *
   * @author tony001
   * @date 2024-05-14 16:05:06
   * @param {string} oldTheme
   * @param {string} newTheme
   * @param {IApiData} [opts]
   * @return {*}  {Promise<boolean>}
   */
  switchTheme(
    oldTheme: string,
    newTheme: string,
    opts?: IApiData,
  ): Promise<boolean>;

  /**
   * 切换语言
   *
   * @author tony001
   * @date 2024-05-14 16:05:20
   * @param {string} oldLanguage
   * @param {string} newLanguage
   * @param {IApiData} [opts]
   * @return {*}  {Promise<boolean>}
   */
  switchLanguage(
    oldLanguage: string,
    newLanguage: string,
    opts?: IApiData,
  ): Promise<boolean>;

  /**
   * 获取应用上下文
   *
   * @return {*}  {(IApiParams | undefined)}
   * @memberof IApiAppUtil
   */
  getAppContext(): IApiParams | undefined;

  /**
   * 打开AI聊天
   *
   * @param {IApiAiChatParam} params
   * @return {*}  {Promise<IApiChatMessage[]>}
   * @memberof IApiAppUtil
   */
  openAiChat(params: IApiAiChatParam): Promise<IApiChatMessage[]>;

  /**
   * @description 视图缓存中心
   * @type {Map<string, IApiViewController>}
   * @memberof IApiAppUtil
   */
  viewCacheCenter: Map<string, IApiViewController>;

  /**
   * @description 当前路由转换成路由路径对象
   * @param {boolean} [isRouteModal]
   * @returns {*}  {{
   *     appContext: IApiParams;
   *     pathNodes: {
   *       viewName: string;
   *       context?: IApiParams;
   *       params?: IApiParams;
   *       srfnav?: string;
   *     }[];
   *   }}
   * @memberof IApiAppUtil
   */
  route2routeObject(isRouteModal?: boolean): {
    appContext?: IApiParams;
    pathNodes: {
      viewName: string;
      context?: IApiParams;
      params?: IApiParams;
      srfnav?: string;
    }[];
  };

  /**
   * @description 路由路径对象转化为路由路径
   * @param {{
   *     appContext?: IApiParams;
   *     pathNodes: {
   *       viewName: string;
   *       context?: IApiParams;
   *       params?: IApiParams;
   *       srfnav?: string;
   *     }[];
   *   }} routePath
   * @returns {*}  {string}
   * @memberof IApiAppUtil
   */
  routeObject2String(routePath: {
    appContext?: IApiParams;
    pathNodes: {
      viewName: string;
      context?: IApiParams;
      params?: IApiParams;
      srfnav?: string;
    }[];
  }): string;
}
