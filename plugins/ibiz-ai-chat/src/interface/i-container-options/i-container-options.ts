import { IChatContainerOptions } from '../i-chat-container/i-chat-container';
import { IChatOptions } from '../i-chat-options/i-chat-options';
import { IResourceOptions } from '../i-resource-options/i-resource-options';
import { ITopicOptions } from '../i-topic-options/i-topic-options';

/**
 * ai容器配置参数
 *
 * @author tony001
 * @date 2025-02-24 11:02:46
 * @export
 * @interface IContainerOptions
 */
export interface IContainerOptions {
  /**
   * 模式,细分为默认模式（聊天框）和话题模式（支持多话题切换），聊天框为默认模式
   *
   * @author tony001
   * @date 2025-02-20 14:02:36
   * @type {('DEFAULT' | 'TOPIC')}
   */
  mode?: 'DEFAULT' | 'TOPIC';

  /**
   * 话题参数(话题模式必填)
   *
   * @author tony001
   * @date 2025-02-20 15:02:02
   * @type {ITopicOptions}
   */
  topicOptions?: ITopicOptions;

  /**
   * 聊天窗口配置参数
   *
   * @author tony001
   * @date 2025-02-24 11:02:53
   * @type {IChatOptions}
   */
  chatOptions: IChatOptions;

  /**
   * 资源相关配置参数
   */
  resourceOptions: IResourceOptions;

  /**
   * ai容器呈现
   *
   * @author chitanda
   * @date 2023-10-15 19:10:44
   * @type {IChatContainerOptions}
   */
  containerOptions?: IChatContainerOptions;
}
