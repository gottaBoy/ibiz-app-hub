/* eslint-disable no-useless-escape */
import { IChatMessage } from '../../interface';
import {
  ChatStepParser,
  ChatToolCallParser,
  ChatUIActionParser,
} from '../../utils';

/**
 * 消息实体
 *
 * @author chitanda
 * @date 2023-10-09 16:10:45
 * @export
 * @class ChatMessage
 * @implements {IMessage}
 */
export class ChatMessage implements IChatMessage {
  toolcallcompleted: IChatMessage['toolcallcompleted'] = true;

  toolcalls: IChatMessage['toolcalls'] = [];

  chatsteps: IChatMessage['chatsteps'] = [];

  chatuiactions: IChatMessage['chatuiactions'] = [];

  /**
   * @description 消息的所有原始内容
   * - 用于维护工具调用消息数据
   * @type {string}
   * @memberof ChatMessage
   */
  allcontent: string = '';

  get messageid(): IChatMessage['messageid'] {
    return this.msg.messageid;
  }

  get state(): IChatMessage['state'] {
    return this.msg.state;
  }

  get role(): IChatMessage['role'] {
    return this.msg.role;
  }

  get type(): IChatMessage['type'] {
    return this.msg.type;
  }

  get status(): IChatMessage['status'] {
    return this.msg.status;
  }

  get realcontent(): IChatMessage['realcontent'] {
    let str = this.msg.content;
    // <think>相关内容移除（助手开头）
    if (str.indexOf('<think>') !== -1 && str.indexOf('</think>') === -1) {
      return '';
    }
    str = str.replace(/\<think\>[^]*?\<\/think\>/gs, '').trim();
    // <chatstep>相关内容（助手开头）
    if (str.indexOf('<chatstep>') !== -1 && str.indexOf('</chatstep>') === -1) {
      return '';
    }
    str = str.replace(/\<chatstep\>[^]*?\<\/chatstep\>/gs, '').trim();
    // <tool_call>相关内容（助手开头）
    if (
      str.indexOf('<tool_call>') !== -1 &&
      str.indexOf('</tool_call>') === -1
    ) {
      return '';
    }
    str = str.replace(/\<tool_call\>[^]*?\<\/tool_call\>/gs, '').trim();
    // <resources>相关内容（用户开头）
    if (
      str.indexOf('<resources>') !== -1 &&
      str.indexOf('</resources>') === -1
    ) {
      return '';
    }
    str = str.replace(/\<resources\>[^]*?\<\/resources\>/gs, '').trim();
    // <suggestions>相关内容（助手结束）
    const firstSuggestionIndex = str.indexOf('<suggestions>');
    if (firstSuggestionIndex !== -1) {
      str = str.substring(0, firstSuggestionIndex).trim();
    }
    // <chatuiaction>相关内容（助手结束）
    const firstChatUIActionIndex = str.indexOf('<chatuiaction>');
    if (firstChatUIActionIndex !== -1) {
      str = str.substring(0, firstChatUIActionIndex).trim();
    }
    return str;
  }

  get content(): IChatMessage['content'] {
    return this.msg.content;
  }

  get completed(): IChatMessage['completed'] {
    return this.msg.completed;
  }

  get suggestions(): IChatMessage['suggestions'] {
    return this.msg.suggestions;
  }

  get _origin(): IChatMessage {
    return this.msg;
  }

  get islike(): IChatMessage['islike'] {
    return this.msg.islike;
  }

  get isdislike(): IChatMessage['isdislike'] {
    return this.msg.isdislike;
  }

  get feedbackcontent(): IChatMessage['feedbackcontent'] {
    return this.msg.feedbackcontent;
  }

  get realmessageid(): IChatMessage['realmessageid'] {
    return this.msg.realmessageid;
  }

  constructor(protected msg: IChatMessage) {
    this.toolcalls = msg.toolcalls || [];
    this.chatsteps = msg.chatsteps || [];
    this.chatuiactions = msg.chatuiactions || [];
    this.allcontent = msg.content;
  }

  /**
   * 更新消息
   *
   * @author chitanda
   * @date 2023-10-10 17:10:07
   * @param {IChatMessage} msg
   */
  update(msg: IChatMessage): void {
    if (!msg.content) msg.content = '';
    this.allcontent += msg.content;
    // 接收到新的<think>（思考的开始标识）内容后清除前面的所有内容
    if (msg.content.indexOf('<think>') !== -1 && this.msg.content) {
      this.msg.content = '';
    }
    this.msg.content += msg.content;
    // 存在工具调用时将工具调用文本信息清除
    if (
      this.msg.content.indexOf('<tool_call>') !== -1 ||
      this.msg.content.indexOf('</tool_call>') !== -1
    ) {
      this.msg.content = '';
    }
    this.computeToolCalls();
    // 存在聊天步骤时将聊天步骤文本信息清除
    const startIndex: number = this.msg.content.indexOf('<chatstep>');
    const endIndex: number = this.msg.content.indexOf('</chatstep>');
    // 成组出现则移除后的内容作为content，未成组出现则content为空
    if (startIndex !== -1 || endIndex !== -1) {
      if (startIndex !== -1 && endIndex !== -1) {
        this.msg.content = this.msg.content.replace(
          /\<chatstep\>[^]*?\<\/chatstep\>/gs,
          '',
        );
      } else {
        this.msg.content = '';
      }
    }
    this.computeChatSteps();
    // 存在聊天界面操作时将聊天界面操作文本信息清除
    const uiActionStartIndex: number =
      this.msg.content.indexOf('<chatuiaction>');
    const uiActionEndIndex: number =
      this.msg.content.indexOf('</chatuiaction>');
    // 成组出现则移除后的内容作为content，未成组出现则content为空
    if (uiActionStartIndex !== -1 || uiActionEndIndex !== -1) {
      if (uiActionStartIndex !== -1 && uiActionEndIndex !== -1) {
        this.msg.content = this.msg.content.replace(
          /\<chatuiaction\>[^]*?\<\/chatuiaction\>/gs,
          '',
        );
      } else {
        this.msg.content = '';
      }
    }
    this.computeChatUIActions();
  }

  /**
   * @description 替换消息
   * @param {IChatMessage} msg
   * @memberof ChatMessage
   */
  replace(msg: IChatMessage): void {
    this.msg = msg;
  }

  /**
   * 更新消息完成状态
   *
   * @author tony001
   * @date 2025-02-25 17:02:31
   * @param {boolean} completed
   */
  updateCompleted(completed: boolean): void {
    this.msg.completed = completed;
  }

  /**
   * @description 计算工具调用
   * @memberof ChatMessage
   */
  computeToolCalls(): void {
    const { completed, toolCalls } = ChatToolCallParser.parse(this.allcontent);
    this.toolcallcompleted = completed;
    this.toolcalls = toolCalls;
  }

  /**
   * @description 计算聊天步骤
   */
  computeChatSteps(): void {
    this.chatsteps = ChatStepParser.parse(this.allcontent);
  }

  /**
   * @description 计算聊天界面操作
   */
  computeChatUIActions(): void {
    this.chatuiactions = ChatUIActionParser.parse(this.allcontent);
  }
}
