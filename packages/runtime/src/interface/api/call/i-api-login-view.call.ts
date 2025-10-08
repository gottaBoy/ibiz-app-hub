import { IApiData } from '@ibiz-template/core';
import { IApiViewCall } from './i-api-view.call';

/**
 * @description 应用登录视图能力
 * @export
 * @interface IApiLoginViewCall
 * @extends {IApiViewCall}
 */
export interface IApiLoginViewCall extends IApiViewCall {
  /**
   * @description 登录
   * @type {{
   *     args: { data: IApiData[]; params: { panelDataParent: string } };
   *   }}
   * @memberof IApiLoginViewCall
   */
  Login: {
    args: { data: IApiData[]; params: { panelDataParent: string } };
  };
}
