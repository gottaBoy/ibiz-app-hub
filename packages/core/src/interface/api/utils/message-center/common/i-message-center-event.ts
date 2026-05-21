import { IPortalMessage } from './i-portal-message';

/**
 * @description 消息事件
 * @export
 * @interface IMessageCenterEvent
 */
export interface IMessageCenterEvent {
  /**
   * @description 所有消息事件
   * @param {IPortalMessage} msg 消息
   * @memberof IMessageCenterEvent
   */
  all: (msg: IPortalMessage) => void;
}
