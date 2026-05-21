import { AiChatController, AiTopicController } from '../../controller';
import { IAIAgent, IAIAgentConfig } from '../i-ai-agent/i-ai-agent';
import { IChatMessage } from '../i-chat-message/i-chat-message';
import { IChatToolbarItem } from '../i-chat-toolbar-item/i-chat-toolbar-item';
import { FileUploaderOptions } from '../i-file-uploader-options/i-file-uploader-options';
import { ITopic } from '../i-topic-options/i-topic-options';
import { IKnowledgeBase } from '../i-knowledge-base/i-knowledge-base';

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
   *  会话标识
   */
  sessionid: string;

  /**
   * @description 自动提问
   * - 历史数据最后一个项是user时是否自动提问，默认开启
   * @type {boolean}
   * @memberof IChat
   */
  autoQuestion?: boolean;

  /**
   * @description 是否自动回填
   * - AI回答完成之后是否触发回填，默认关闭
   * @type {boolean}
   * @memberof IChat
   */
  autoFill?: boolean;

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

  /**
   * 是否允许切换ai代理
   */
  enableAIAgentChange?: boolean;

  /**
   * 激活ai代理标识
   */
  activeAIAgentID?: string | undefined;

  /**
   * AI代理列表
   *
   * @type {IAIAgent[]}
   */
  aiAgentlist?: IAIAgent[];

  /**
   * AI知识库列表
   */
  aiknowledgeBasesList?: IKnowledgeBase[];

  /**
   * 选中知识库ID
   */
  selectAIKnowledgeBaseId?: string;

  /**
   * 模式参数，用于业务区分
   */
  srfMode?: string;

  /**
   * 传入当前资源作为用户消息（如果外部传入，在请求历史记录后，需要附加当前资源作为用户消息）
   */
  appendCurResource: string;
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
   * 聊天区ai话题控制器
   *
   * @type {AiTopicController}
   */
  aiTopic?: AiTopicController;

  /**
   * 摘要最大长度
   *
   * @type {number}
   */
  summaryMaxTokens?: number;

  /**
   * 是否允许选择知识库
   *
   * @type {boolean}
   */
  enableKnowledgeBaseSelect: boolean;

  /**
   * 是否允许设置召回参数
   *
   * @type {boolean}
   */
  enableRecallConfigSetting: boolean;

  /**
   * 召回重排默认值(禁用|启用|自动)
   *
   * @type {0 | 1 | 2}
   */
  reRankDefaultValue: 0 | 1 | 2;

  /**
   * 最大召回数量默认值
   *
   * @type {number}
   */
  maxChunksDefaultValue: number;

  /**
   * 召回相似度阈值默认值
   *
   * @type {number}
   */
  chunkThresholdDefaultValue: number;

  /**
   * 知识分片打开视图
   *
   * @type {string}
   */
  chunkView?: string;

  /**
   * 知识分片实体代码名称
   *
   * @type {string}
   */
  chunkEntity?: string;

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
    srfaiagent: string | undefined,
    srfmode: string | undefined,
    srfaiknowledgebases: string | undefined,
    srfaiagentconfig: IAIAgentConfig | undefined,
  ): Promise<boolean>;

  /**
   * 中断消息
   * @param aiChat
   * @param context
   * @param params
   * @param otherParams
   */
  abortQuestion(
    aiChat: AiChatController,
    context: object,
    params: object,
    otherParams: object,
  ): Promise<void>;

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
   * @param context
   * @param params
   * @param message
   */
  closed?(context: object, params: object, message: IChatMessage[]): void;

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
   * 获取ai代理列表
   *
   * @author tony001
   * @date 2025-02-28 14:02:41
   * @type {FileUploaderOptions<object>}
   */
  fetchAgentList?: (query?: string) => Promise<IAIAgent[]>;

  /**
   * 获取AI知识库列表
   *
   * @returns
   */
  fetchKnowledgeBaseList?: () => Promise<IKnowledgeBase[]>;

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

  /**
   * 聊天内容摘要回调
   * @param context
   * @param params
   * @param otherParams
   * @return {*}  {Promise<object>}
   */
  chatDigest(
    context: object,
    params: object,
    otherParams: object,
  ): Promise<object>;

  /**
   * 打开链接视图
   * @param url
   * @param message
   * @param event
   */
  openLinkView(
    url: string,
    message: IChatMessage,
    event: MouseEvent,
  ): Promise<void>;
}
