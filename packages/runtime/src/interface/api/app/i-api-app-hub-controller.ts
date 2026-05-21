import { IApiData } from '@ibiz-template/core';
import { IApiAuthResult } from '../service';

/**
 * @description 应用中心控制器
 * @export
 * @interface IApiAppHubController
 */
export interface IApiAppHubController {
  /**
   * @description 全局共享数据对象
   * @type {IApiData}
   * @memberof IApiAppHubController
   */
  session: IApiData;

  /**
   * @description 登录（包含调用登录逻辑，及跳转应用界面）
   * @param {string} loginName 登录名
   * @param {string} password 密码
   * @param {boolean} [remember] 是否记住登录状态
   * @param {IApiData} [headers] 请求头
   * @param {IApiData} [opts] 登录配置
   * @returns {*}  {Promise<boolean>}
   * @memberof IApiAppHubController
   */
  login(
    loginName: string,
    password: string,
    remember?: boolean,
    headers?: IApiData,
    opts?: IApiData,
  ): Promise<boolean>;

  /**
   * @description 登出
   * @param {IApiData} [opts] 登出配置
   * @returns {*}  {Promise<boolean>}
   * @memberof IApiAppHubController
   */
  logout(opts?: IApiData): Promise<boolean>;

  /**
   * @description 变更密码
   * @param {string} oldPwd 旧密码
   * @param {string} newPwd 新密码
   * @param {{
   *       surePwd: string; // 确认密码
   *     }} [opts] 变更密码配置
   * @returns {*}  {Promise<IApiAuthResult>}
   * @memberof IApiAppHubController
   */
  changePwd(
    oldPwd: string,
    newPwd: string,
    opts?: {
      surePwd: string;
    },
  ): Promise<IApiAuthResult>;

  /**
   * @description 切换组织
   * @param {string} oldOrgId 旧组织id
   * @param {string} newOrgId 新组织id
   * @param {IApiData} [opts] 切换组织配置
   * @returns {*}  {Promise<boolean>}
   * @memberof IApiAppHubController
   */
  switchOrg(
    oldOrgId: string,
    newOrgId: string,
    opts?: IApiData,
  ): Promise<boolean>;

  /**
   * @description 切换主题
   * @param {string} oldTheme 旧主题
   * @param {string} newTheme 新主题
   * @param {IApiData} [opts] 切换主题配置
   * @returns {*}  {Promise<boolean>}
   * @memberof IApiAppHubController
   */
  switchTheme(
    oldTheme: string,
    newTheme: string,
    opts?: IApiData,
  ): Promise<boolean>;

  /**
   * @description 切换语言
   * @param {string} oldLanguage 旧语言
   * @param {string} newLanguage 新语言
   * @param {IApiData} [opts] 切换语言配置
   * @returns {*}  {Promise<boolean>}
   * @memberof IApiAppHubController
   */
  switchLanguage(
    oldLanguage: string,
    newLanguage: string,
    opts?: IApiData,
  ): Promise<boolean>;
}
