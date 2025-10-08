import { IPortalAsyncAction } from '../api';
import { IApiChatMessage } from '../api/chat-message';

/**
 * @description AI聊天消息
 * @export
 * @interface IChatMessage
 */
export interface IChatMessage extends IApiChatMessage {
  /**
   * @description 消息数据
   * @type {(IPortalAsyncAction | IData | string | unknown)}
   * @memberof IChatMessage
   */
  data?: IPortalAsyncAction | IData | string | unknown;
}
