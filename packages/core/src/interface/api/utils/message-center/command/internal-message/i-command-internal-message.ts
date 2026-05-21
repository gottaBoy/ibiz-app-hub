import { ICommandBase } from '../i-command-base';
import { IInternalMessage } from './i-internal-message';

/**
 * @description 站内信指令消息控制器
 * @export
 * @interface ICommandInternalMessage
 * @extends {ICommandBase}
 */
export interface ICommandInternalMessage extends ICommandBase {
  /**
   * @description 发送消息
   * @param {IInternalMessage} data 站内信数据
   * @memberof ICommandInternalMessage
   */
  send(data: IInternalMessage): void;
}
