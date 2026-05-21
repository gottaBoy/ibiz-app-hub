import { AxiosResponse } from 'axios';

/**
 * @description Http错误接口
 * @export
 * @interface IApiHttpError
 */
export interface IApiHttpError {
  /**
   * @description 错误名称
   * @type {string}
   * @memberof IApiHttpError
   */
  name: string;

  /**
   * @description 错误消息
   * @type {string}
   * @memberof IApiHttpError
   */
  message: string;

  /**
   * @description 状态码
   * @type {number}
   * @memberof IApiHttpError
   */
  status: number;

  /**
   * @description 错误标识
   * @type {string}
   * @memberof IApiHttpError
   */
  tag: string;

  /**
   * @description axios响应对象
   * @type {AxiosResponse}
   * @memberof IApiHttpError
   */
  response?: AxiosResponse;
}
