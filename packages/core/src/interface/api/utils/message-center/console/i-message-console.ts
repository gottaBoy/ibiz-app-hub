import { IApiData } from '../../../global-param';
import { IMessageBase } from '../base';

/**
 * @description 日志消息控制器
 * @export
 * @interface IMessageConsole
 * @extends {IMessageBase}
 */
export interface IMessageConsole extends IMessageBase {
  /**
   * @description 发送消息
   * @param {(IApiData | string)} data 日志数据
   * @memberof IMessageConsole
   */
  send(data: IApiData | string): void;
}
