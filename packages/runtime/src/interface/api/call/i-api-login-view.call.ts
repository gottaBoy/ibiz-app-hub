import { IApiViewCall } from './i-api-view.call';

/**
 * @description 应用登录视图能力
 * @export
 * @interface IApiLoginViewCall
 * @extends {IApiViewCall}
 */
export interface IApiLoginViewCall extends IApiViewCall {
  /**
   * @description 登录，username: 用户名，password: 密码，captcha: 验证码，orgid: 组织id，panelDataParent: 数据父容器标识
   * @type {{
   *     args: {
   *       data: [
   *         {
   *           username: string;
   *           password: string;
   *           captcha?: string;
   *           orgid?: string;
   *         },
   *       ];
   *       params?: { panelDataParent: string };
   *     };
   *   }}
   * @memberof IApiLoginViewCall
   */
  Login: {
    args: {
      data: [
        {
          username: string;
          password: string;
          captcha?: string;
          orgid?: string;
        },
      ];
      params?: { panelDataParent: string };
    };
  };
}
