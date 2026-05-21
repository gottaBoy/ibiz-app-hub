import { ICommandBase } from '../i-command-base';
import { IMarkOpenData } from './i-mark-open-data';

/**
 * @description 协同指令消息控制器
 * @export
 * @interface ICommandMarkOpenData
 * @extends {ICommandBase}
 */
export interface ICommandMarkOpenData extends ICommandBase {
  /**
   * @description 发送消息
   * @param {IMarkOpenData} data 协同数据
   * @memberof ICommandMarkOpenData
   */
  send(data: IMarkOpenData): void;
}
