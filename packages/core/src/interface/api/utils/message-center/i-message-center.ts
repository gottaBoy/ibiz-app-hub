import { IMessageCommand } from './command';
import { IPortalMessage } from './common';
import { IMessageConsole } from './console/i-message-console';
import { IMessageError } from './error/i-message-error';

/**
 * @description 界面消息中心
 * @export
 * @interface IMessageCenter
 */
export interface IMessageCenter {
  /**
   * @description 指令消息
   * @type {IMessageCommand}
   * @memberof IMessageCenter
   */
  readonly command: IMessageCommand;

  /**
   * @description 日志消息
   * @type {IMessageConsole}
   * @memberof IMessageCenter
   */
  readonly console: IMessageConsole;

  /**
   * @description 错误消息
   * @type {IMessageError}
   * @memberof IMessageCenter
   */
  readonly error: IMessageError;

  /**
   * @description 发送消息
   * @param {IPortalMessage} msg 消息
   * @memberof IMessageCenter
   */
  next(msg: IPortalMessage): void;

  /**
   * @description 订阅消息
   * @param {(msg: IPortalMessage) => void} callback 回调函数
   * @memberof IMessageCenter
   */
  on(callback: (msg: IPortalMessage) => void): void;

  /**
   * @description 取消订阅
   * @param {(msg: IPortalMessage) => void} callback 回调函数
   * @memberof IMessageCenter
   */
  off(callback: (msg: IPortalMessage) => void): void;
}
