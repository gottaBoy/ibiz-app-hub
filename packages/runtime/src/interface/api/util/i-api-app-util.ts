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
   * @param {string} loginName 登录名
   * @param {string} password 密码
   * @param {boolean} [remember] 是否记住登录状态
   * @param {IApiData} [headers] 请求头
   * @param {IApiData} [opts] 登录配置
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
   * @param {IApiData} [opts] 登出配置
   * @return {*}  {Promise<boolean>}
   */
  logout(opts?: IApiData): Promise<boolean>;

  /**
   * 变更密码
   *
   * @author tony001
   * @date 2024-05-14 15:05:33
   * @param {string} oldPwd 旧密码
   * @param {string} newPwd 新密码
   * @param {{
   *       surePwd: string; // 确认密码
   *     }} [opts] 变更密码配置
   * @return {*}  {Promise<IApiAuthResult>}
   */
  changePwd(
    oldPwd: string,
    newPwd: string,
    opts?: {
      surePwd: string;
    },
  ): Promise<IApiAuthResult>;

  /**
   * 切换组织
   *
   * @author tony001
   * @date 2024-05-14 15:05:51
   * @param {string} oldOrgId 旧组织id
   * @param {string} newOrgId 新组织id
   * @param {IApiData} [opts] 切换组织配置
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
   * @param {string} oldTheme 旧主题
   * @param {string} newTheme 新主题
   * @param {IApiData} [opts] 切换主题配置
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
   * @param {string} oldLanguage 旧语言
   * @param {string} newLanguage 新语言
   * @param {IApiData} [opts] 切换语言配置
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
   * @param {IApiAiChatParam} params 聊天配置
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
   * @param {boolean} [isRouteModal] 是否是路由模态
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
   *     appContext?: IApiParams; // 应用上下文
   *     pathNodes: {
   *       viewName: string;  // 视图名称
   *       context?: IApiParams; // 上下文参数
   *       params?: IApiParams; // 视图参数
   *       srfnav?: string; // 导航参数
   *     }[];
   *   }} routePath 路由路径对象
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

  /**
   * @description 注册导航结束事件
   * @param {(form: string, to: string) => void} callBack 导航结束回调
   * @memberof IApiAppUtil
   */
  registerEventOnNavEnd(callBack: (form: string, to: string) => void): void;

  /**
   * @description 注册路由导航完成关闭模态类视图
   * @memberof IApiAppUtil
   */
  registerAutoCloseOnNavEnd(): void;
}
