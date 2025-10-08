import { AiChatController } from '../../controller';
import { IChatMessage } from '../i-chat-message/i-chat-message';
import { IChatToolbarItem } from '../i-chat-toolbar-item/i-chat-toolbar-item';
import { FileUploaderOptions } from '../i-file-uploader-options/i-file-uploader-options';
import { ITopic } from '../i-topic-options/i-topic-options';

/**
 * 聊天数据
 *
 * @author tony001
 * @date 2025-02-24 11:02:52
 * @export
 * @interface IChat
 */
export interface IChat {
  /**
   * 聊天窗口标题
   *
   * @type {string}
   * @memberof IChatOptions
   */
  caption?: string;

  /**
   * 上下文
   *
   * @author tony001
   * @date 2025-02-23 17:02:33
   * @type {object}
   */
  context: object;

  /**
   * 视图参数
   *
   * @author tony001
   * @date 2025-02-23 17:02:48
   * @type {object}
   */
  params: object;

  /**
   * 实体标识
   *
   * @author tony001
   * @date 2025-02-24 14:02:40
   * @type {string}
   */
  appDataEntityId: string;

  /**
   * 传入对象参数（如果外部传入，在请求历史记录，需要附加当前参数）
   *
   * @author tony001
   * @date 2025-03-26 14:03:56
   * @type {object}
   */
  appendCurData?: object;

  /**
   * 传入当前编辑内容作为用户消息（如果外部传入，在请求历史记录后，需要附加当前编辑内容作为用户消息）
   *
   * @author tony001
   * @date 2025-03-26 15:03:33
   * @type {string}
   */
  appendCurContent?: string;

  /**
   * 内容工具项
   *
   * @type {IChatToolbarItem[]}
   * @memberof IChatOptions
   */
  contentToolbarItems?: IChatToolbarItem[];

  /**
   * 底部工具项
   *
   * @type {IChatToolbarItem[]}
   * @memberof IChatOptions
   */
  footerToolbarItems?: IChatToolbarItem[];

  /**
   * 提问区工具栏
   *
   * @author tony001
   * @date 2025-02-28 16:02:12
   * @type {IChatToolbarItem[]}
   */
  questionToolbarItems?: IChatToolbarItem[];

  /**
   * 其他项工具栏
   *
   * @author tony001
   * @date 2025-03-19 13:03:37
   * @type {IChatToolbarItem[]}
   */
  otherToolbarItems?: IChatToolbarItem[];
}

/**
 * 聊天区配置参数
 *
 * @author chitanda
 * @date 2023-10-13 17:10:57
 * @export
 * @interface IChatOptions
 */
export interface IChatOptions extends IChat {
  /**
   * 模式,细分为默认模式（聊天框）和话题模式（支持多话题切换），聊天框为默认模式
   *
   * @author tony001
   * @date 2025-02-20 14:02:36
   * @type {('DEFAULT' | 'TOPIC')}
   */
  mode?: 'DEFAULT' | 'TOPIC';

  /**
   * 话题标识
   *
   * @author tony001
   * @date 2025-02-24 18:02:26
   * @type {string}
   */
  topicId?: string;

  /**
   *话题数据
   *
   * @author tony001
   * @date 2025-03-10 16:03:46
   * @type {ITopic}
   */
  topic?: ITopic;

  /**
   * 聊天窗触发提问回调
   *
   * @author tony001
   * @date 2025-02-24 14:02:51
   * @param {object} context
   * @param {object} params
   * @param {object} otherParams
   * @param {IChatMessage[]} question 提问历史内容(包含当前提问)
   * @return {*}  {Promise<boolean>} 等待回答，用于显示 loading 并获取最终成功与否
   */
  question(
    aiChat: AiChatController,
    context: object,
    params: object,
    otherParams: object,
    question: IChatMessage[],
    sessionid: string,
  ): Promise<boolean>;

  /**
   * 中断消息
   *
   * @author tony001
   * @date 2025-03-10 14:03:37
   * @param {AiChatController} aiChat
   */
  abortQuestion(aiChat: AiChatController): Promise<void>;

  /**
   * 聊天窗历史记录获取
   *
   * @author tony001
   * @date 2025-02-24 13:02:56
   * @return {*}  {Promise<boolean>}
   */
  history(
    context: object,
    params: object,
    otherParams: object,
  ): Promise<boolean>;

  /**
   * 窗口关闭
   *
   * @param {object} context
   * @param {object} params
   * @memberof IChatOptions
   */
  closed?(context: object, params: object): void;

  /**
   * 聊天窗任意位置点击操作
   *
   * @author chitanda
   * @date 2023-10-13 18:10:56
   * @param {string} action 操作的行为标识 backfill:回填  question:提问   deletemsg:删除消息  refreshmsg:刷新消息
   * @param {T} [params] 传递的参数
   * @return {*}  {Promise<boolean>} 等待操作，用于显示 loading 并获取最终成功与否
   */
  action?<T = unknown>(
    action: 'backfill' | 'question' | 'deletemsg' | 'refreshmsg' | 'copymsg',
    params?: T,
  ): Promise<boolean>;

  /**
   * 全屏操作
   *
   * @param {boolean} target
   * @param {object} context
   * @param {object} params
   * @memberof IChatOptions
   */
  fullscreen?(target: boolean, context: object, params: object): void;

  /**
   * 最小化操作
   *
   * @param {boolean} target
   * @param {object} context
   * @param {object} params
   * @memberof IChatOptions
   */
  minimize?(target: boolean, context: object, params: object): void;

  /**
   * 文件上传配置
   *
   * @author tony001
   * @date 2025-02-28 14:02:41
   * @type {FileUploaderOptions<object>}
   */
  uploader: FileUploaderOptions<object>;

  /**
   * 工具栏项点击回调
   *
   * @author tony001
   * @date 2025-03-12 16:03:22
   */
  extendToolbarClick: (
    e: MouseEvent,
    item: object,
    context: object,
    params: object,
    data: object,
  ) => Promise<object> | void;

  /**
   * 推荐提示回调
   *
   * @author tony001
   * @date 2025-03-19 10:03:28
   * @param {object} context
   * @param {object} params
   * @param {object} otherParams
   * @return {*}  {Promise<object>}
   */
  recommendPrompt(
    context: object,
    params: object,
    otherParams: object,
  ): Promise<object>;
}
