import { IApiData } from '../../../global-param';
import { IMessageBase } from '../base';

/**
 * @description 错误消息控制器
 * @export
 * @interface IMessageError
 * @extends {IMessageBase}
 */
export interface IMessageError extends IMessageBase {
  /**
   * @description 发送消息
   * @param {(IApiData | string)} data 错误数据
   * @memberof IMessageError
   */
  send(data: IApiData | string): void;
}
