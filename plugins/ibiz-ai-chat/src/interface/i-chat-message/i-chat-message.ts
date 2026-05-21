import { IChatStep } from '../i-chat-step/i-chat-step';
import { IChatSuggestion } from '../i-chat-suggestion/i-chat-suggestion';
import { IChatToolCall } from '../i-chat-tool-call/i-chat-tool-call';
import { IChatUIAction } from '../i-chat-uiaction/i-chat-uiaction';
import { IPortalAsyncAction } from '../i-portal-async-action/i-portal-async-action';

/**
 * AI聊天消息
 *
 * @author chitanda
 * @date 2023-10-10 16:10:29
 * @export
 * @interface IChatMessage
 */
export interface IChatMessage {
  /**
   * 消息标识
   *
   * @author chitanda
   * @date 2023-09-05 15:09:43
   * @type {string}
   */
  messageid: string;

  /**
   * 消息名称
   *
   * @author chitanda
   * @date 2023-09-05 15:09:49
   * @type {string}
   */
  messagename?: string;

  /**
   * 作业状态
   *
   * @author chitanda
   * @date 2023-10-10 15:10:59
   * @type {(10 | 20 | 30 | 40)} 未开始 | 执行中 | 已执行 | 执行失败
   */
  state: 10 | 20 | 30 | 40;

  /**
   * 消息类型
   *
   * @author chitanda
   * @date 2023-10-10 16:10:21
   * @type {string}
   */
  type: string | 'DEFAULT' | 'ERROR';

  /**
   * 消息状态,待处理|已发送|失败|用户取消
   */
  status: string | 'pending' | 'sent' | 'failed' | '	canceled';

  /**
   * 消息子类型
   *
   * @author chitanda
   * @date 2023-10-10 16:10:00
   * @type {string}
   */
  subtype?: string;

  /**
   * 消息角色
   *
   * @author chitanda
   * @date 2023-10-10 16:10:32
   * @type {('ASSISTANT' | 'USER' | 'SYSTEM')} 助手 | 用户 | 系统
   */
  role: 'ASSISTANT' | 'USER' | 'SYSTEM';

  /**
   * 内容摘要
   *
   * @author chitanda
   * @date 2023-09-05 15:09:23
   * @type {string}
   */
  content: string;

  /**
   * 内容（排除排除think、resources、suggesions内容）
   *
   * @author tony001
   * @date 2025-03-10 16:03:12
   * @type {string}
   */
  realcontent?: string;

  /**
   * 消息数据
   *
   * @author chitanda
   * @date 2023-09-05 15:09:55
   * @type {(IPortalAsyncAction | unknown)}
   */
  data?: IPortalAsyncAction | unknown;

  /**
   * 消息路径
   *
   * @author chitanda
   * @date 2023-09-05 15:09:25
   * @type {string}
   */
  url?: string;

  /**
   * 当前消息传输是否完成
   *
   * @author tony001
   * @date 2025-02-25 17:02:16
   * @type {boolean}
   */
  completed?: boolean;

  /**
   * 提示建议
   *
   * @author tony001
   * @date 2025-03-19 10:03:05
   * @type {IChatSuggestion[]}
   */
  suggestions?: IChatSuggestion[];

  /**
   * 工具调用是否完成
   * @type {boolean}
   * @memberof IChatMessage
   */
  toolcallcompleted?: boolean;

  /**
   * @description 工具调用集合
   * @type {IChatToolCall[]}
   * @memberof IChatMessage
   */
  toolcalls?: IChatToolCall[];

  /**
   * @description 是否点赞
   * @type {boolean}
   * @memberof IChatMessage
   */
  islike?: '0' | '1';

  /**
   * @description 是否点踩
   * @type {boolean}
   * @memberof IChatMessage
   */
  isdislike?: '0' | '1';

  /**
   * @description 反馈内容
   * @type {string}
   * @memberof IChatMessage
   */
  feedbackcontent?: string;

  /**
   * @description 真实消息标识
   * @type {string}
   * @memberof IChatMessage
   */
  realmessageid?: string;

  /**
   * @description 聊天步骤
   */
  chatsteps?: IChatStep[];

  /**
   * @description 聊天UI操作
   */
  chatuiactions?: IChatUIAction[];
}
