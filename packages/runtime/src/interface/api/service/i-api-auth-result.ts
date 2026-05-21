import { IApiData, IApiHttpError, IHttpResponse } from '@ibiz-template/core';

/**
 * @description 权限结果
 * @export
 * @interface IApiAuthResult
 */
export interface IApiAuthResult {
  /**
   * @description 是否成功
   * @type {boolean}
   * @memberof IApiAuthResult
   */
  ok: boolean;

  /**
   * @description http请求返回数据
   * @type {(IApiData | IHttpResponse | IApiHttpError)}
   * @memberof IApiAuthResult
   */
  result: IApiData | IHttpResponse | IApiHttpError;
}
