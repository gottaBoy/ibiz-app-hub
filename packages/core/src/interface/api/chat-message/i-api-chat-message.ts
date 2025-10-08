import { IApiData } from '../global-param';

/**
 * @description AI聊天消息
 * @export
 * @interface IApiChatMessage
 */
export interface IApiChatMessage {
  /**
   * @description 消息标识
   * @type {string}
   * @memberof IApiChatMessage
   */
  messageid?: string;

  /**
   * @description 消息名称
   * @type {string}
   * @memberof IApiChatMessage
   */
  messagename?: string;

  /**
   * @description 消息类型
   * @type {string}
   * @memberof IApiChatMessage
   */
  type?: string;

  /**
   * @description 消息子类型
   * @type {string}
   * @memberof IApiChatMessage
   */
  subtype?: string;

  /**
   * @description 消息角色
   * @type {('ASSISTANT' | 'USER' | 'SYSTEM')} 助手 | 用户 | 系统
   * @memberof IApiChatMessage
   */
  role: 'ASSISTANT' | 'USER' | 'SYSTEM';

  /**
   * @description 内容摘要
   * @type {string}
   * @memberof IApiChatMessage
   */
  content: string;

  /**
   * @description 消息数据
   * @type {(IApiData | string | unknown)}
   * @memberof IApiChatMessage
   */
  data?: IApiData | string | unknown;

  /**
   * @description 消息路径
   * @type {string}
   * @memberof IApiChatMessage
   */
  url?: string;

  /**
   * @description 内容（排除排除think、resources、suggesions内容）
   * @type {string}
   * @memberof IApiChatMessage
   */
  realcontent?: string;
}
