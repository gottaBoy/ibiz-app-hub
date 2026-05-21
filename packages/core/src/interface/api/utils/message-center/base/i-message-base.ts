import { IPortalMessage } from '../common';

/**
 * @description 消息基类控制器，各个类型消息继承此类
 * @export
 * @interface IMessageBase
 */
export interface IMessageBase {
  /**
   * @description 推送标准结构消息
   * @param {IPortalMessage} msg 消息
   * @memberof IMessageBase
   */
  next(msg: IPortalMessage): void;

  /**
   * @description 订阅消息
   * @param {(msg: IPortalMessage) => void} cb 回调函数
   * @memberof IMessageBase
   */
  on(cb: (msg: IPortalMessage) => void): void;

  /**
   * @description 取消订阅消息
   * @param {(msg: IPortalMessage) => void} cb 回调函数
   * @memberof IMessageBase
   */
  off(cb: (msg: IPortalMessage) => void): void;
}
