/* eslint-disable @typescript-eslint/no-unused-vars */
import { IAuthResult, IApiAppHubController } from '../interface';

/**
 * @description 应用中心控制器
 * @export
 * @class HubController
 * @implements {IApiAppHubController}
 */
export class HubController implements IApiAppHubController {
  /**
   * @description 全局共享数据对象
   * @type {IData}
   * @memberof HubController
   */
  session: IData = {};

  /**
   * @description 登录（包含调用登录逻辑，及跳转应用界面）
   * @param {string} loginName
   * @param {string} password
   * @param {(boolean | undefined)} [remember]
   * @param {(IData | undefined)} [headers]
   * @param {(IData | undefined)} [opts]
   * @returns {*}  {Promise<boolean>}
   * @memberof HubController
   */
  async login(
    loginName: string,
    password: string,
    remember?: boolean | undefined,
    headers?: IData | undefined,
    opts?: IData | undefined,
  ): Promise<boolean> {
    const bol = await ibiz.appUtil.login(
      loginName,
      password,
      remember,
      headers,
      opts,
    );
    return bol;
  }

  /**
   * @description 登出（包含调用登录逻辑，及跳转登录页）
   * @param {(IData | undefined)} [opts]
   * @returns {*}  {Promise<boolean>}
   * @memberof HubController
   */
  async logout(opts?: IData | undefined): Promise<boolean> {
    const bol = await ibiz.appUtil.logout(opts);
    return bol;
  }

  /**
   * @description 变更密码
   * @param {string} oldPwd 旧密码
   * @param {string} newPwd 新密码
   * @param {{
   *       surePwd: string; // 确认密码
   *     }} [opts] 变更密码配置
   * @returns {*}  {Promise<IAuthResult>}
   * @memberof HubController
   */
  async changePwd(
    oldPwd: string,
    newPwd: string,
    opts?: {
      surePwd: string;
    },
  ): Promise<IAuthResult> {
    const bol = await ibiz.appUtil.changePwd(oldPwd, newPwd, opts);
    return bol;
  }

  /**
   * @description 切换组织（包括界面刷新）
   * @param {string} oldOrgId
   * @param {string} newOrgId
   * @param {(IData | undefined)} [opts]
   * @returns {*}  {Promise<boolean>}
   * @memberof HubController
   */
  async switchOrg(
    oldOrgId: string,
    newOrgId: string,
    opts?: IData | undefined,
  ): Promise<boolean> {
    const bol = await ibiz.appUtil.switchOrg(oldOrgId, newOrgId, opts);
    return bol;
  }

  /**
   * @description 切换主题
   * @param {string} oldTheme
   * @param {string} newTheme
   * @param {(IData | undefined)} [opts]
   * @returns {*}  {Promise<boolean>}
   * @memberof HubController
   */
  async switchTheme(
    oldTheme: string,
    newTheme: string,
    opts?: IData | undefined,
  ): Promise<boolean> {
    const bol = await ibiz.appUtil.switchTheme(oldTheme, newTheme, opts);
    return bol;
  }

  /**
   * @description 切换语言
   * @param {string} oldLanguage
   * @param {string} newLanguage
   * @param {(IData | undefined)} [opts]
   * @returns {*}  {Promise<boolean>}
   * @memberof HubController
   */
  async switchLanguage(
    oldLanguage: string,
    newLanguage: string,
    opts?: IData | undefined,
  ): Promise<boolean> {
    const bol = await ibiz.appUtil.switchTheme(oldLanguage, newLanguage, opts);
    return bol;
  }
}
