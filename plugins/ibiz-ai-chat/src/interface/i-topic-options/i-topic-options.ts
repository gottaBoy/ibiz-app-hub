/* eslint-disable @typescript-eslint/no-explicit-any */
import { IChat } from '../i-chat-options/i-chat-options';
import { IConfigService } from '../i-config-service/i-config-service';

/**
 * 话题数据
 *
 * @author tony001
 * @date 2025-02-23 17:02:34
 * @export
 * @interface ITopic
 */
export interface ITopic {
  /**
   * 应用标识
   *
   * @author tony001
   * @date 2025-02-20 18:02:07
   * @type {string}
   */
  appid: string;

  /**
   * 话题标识
   *
   * @author tony001
   * @date 2025-02-20 15:02:01
   * @type {string}
   */
  id: string;

  /**
   * 话题类型
   *
   * @author tony001
   * @date 2025-02-20 18:02:00
   * @type {string}
   */
  type: string;

  /**
   * @description 会话排序
   * @type {number}
   * @memberof ITopic
   */
  sequence: number;

  /**
   * @description 是否置顶
   * @type {(0 | 1)}
   * @memberof ITopic
   */
  isTop: 0 | 1;

  /**
   * 话题标题
   *
   * @author tony001
   * @date 2025-02-20 15:02:57
   * @type {string}
   */
  caption?: string;

  /**
   * 话题标题模式
   * default:默认值，由外部传入标题决定
   * snippet：片段,新建或重置会话时默认显示新会话，如果获取到的history内容中包含user信息，则取最后一条user信息截取用作标题,若未能取到标题时等待用户输入第一个user消息后截取作为标题
   * summary：摘要，需调用ai接口生成摘要作为标题
   *
   * @type {'default' | 'snippet' | 'summary'}
   */
  captionMode?: 'default' | 'snippet' | 'summary';

  /**
   * @description 标题是否计算完成
   * @type {boolean}
   * @memberof ITopic
   */
  captionComputed?: boolean;

  /**
   * 源话题标题
   *
   * @author tony001
   * @date 2025-03-18 19:03:21
   * @type {string}
   */
  sourceCaption?: string;

  /**
   * 话题主数据url，用于跳转主数据界面
   *
   * @author tony001
   * @date 2025-02-20 15:02:08
   * @type {string}
   */
  url?: string;

  /**
   * 真实id
   */
  realid?: string;

  /**
   * 是否忽略显示,默认显示
   */
  isShow?: boolean;

  /**
   * 上下文
   *
   * @author tony001
   * @date 2025-02-24 11:02:59
   * @type {IChat}
   */
  aiChat?: IChat;
}

/**
 * 话题参数
 *
 * @author tony001
 * @date 2025-02-20 15:02:46
 * @export
 * @interface ITopicOptions
 */
export interface ITopicOptions extends ITopic {
  /**
   * 隐藏话题侧边栏,默认不隐藏
   */
  hideTopicSidebar: boolean;

  /**
   * 禁用存储
   */
  disableStorage: boolean;

  /**
   * 删除之前
   *
   * @author tony001
   * @date 2025-03-23 10:03:29
   * @param {object} context
   * @param {object} params
   * @param {ITopic} data
   * @param {MouseEvent} [event]
   * @param {boolean} [isBatch]
   * @return {*}  {Promise<boolean>}
   */
  beforeDelete?(
    context: object,
    params: object,
    data: ITopic,
    event?: MouseEvent,
    isBatch?: boolean,
  ): Promise<boolean>;

  /**
   * 话题行为
   *
   * @author tony001
   * @date 2025-02-24 16:02:04
   * @param { string} action
   * @param {object} context
   * @param {object} params
   * @param {ITopic} data
   * @param {MouseEvent} event
   * @return {*}  {Promise<boolean>}
   */
  action?(
    action: string,
    context: object,
    params: object,
    data: ITopic,
    event: MouseEvent,
  ): Promise<boolean>;

  /**
   * 存储服务构造器
   *
   * @author tony001
   * @date 2025-02-23 16:02:46
   */
  configService: (
    appid: string,
    storageType: string,
    subType: string,
  ) => IConfigService;
}
