export interface IAnswer {
  /**
   * @description 回答状态
   * @type {(10 | 20 | 30 | 40)} (未开始 | 回答中 | 回答完成 | 回答错误)
   * @memberof IAnswer
   */
  state: 10 | 20 | 30 | 40;

  /**
   * @description 回答内容
   * @type {string}
   * @memberof IAnswer
   */
  content: string;
}

export interface IChatToolCall {
  /**
   * @description 工具名称
   * @type {string}
   * @memberof IChatToolCall
   */
  name: string;

  /**
   * @description 参数
   * @type {{
   *     type: string;
   *     id: string;
   *     desc: string;
   *   }}
   * @memberof IChatToolCall
   */
  parameters: {
    type: string;
    id: string;
    desc: string;
  };

  /**
   * @description 是否错误
   * @type {boolean}
   * @memberof IChatToolCall
   */
  error: boolean;

  /**
   * @description 错误原因
   * @type {string}
   * @memberof IChatToolCall
   */
  result?: string;
}

export interface IMessage {
  /**
   * @description 内容信息
   * @type {string}
   * @memberof IMessage
   */
  content?: string;
  /**
   * @description 错误信息
   * @type {string}
   * @memberof IMessage
   */
  error?: string;
  /**
   * @description 思考信息parseContent
   * @type {string}
   * @memberof IMessage
   */
  think?: string;
  /**
   * @description 工具调用信息
   * @type {IChatToolCall[]}
   * @memberof IMessage
   */
  toolcalls: IChatToolCall[];
  /**
   * @description 消息角色
   * @type {('USER' | 'ASSISTANT')}
   * @memberof IMessage
   */
  role: 'USER' | 'ASSISTANT';
}
