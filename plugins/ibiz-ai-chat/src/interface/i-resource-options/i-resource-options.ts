/* eslint-disable @typescript-eslint/no-explicit-any */
import { IRemoteSession } from '../i-remote-resource/i-remote-resource';

/**
 * 资源选项
 */
export interface IResourceOptions {
  /**
   * AI资源模式，REMOTE：远程模式，话题存储config和远程session，消息存储消息表；LOCAL：本地模式，话题存储config，消息存储客户端；默认本地模式
   */
  resourceMode: 'REMOTE' | 'LOCAL';

  /**
   * 获取话题列表
   */
  getSessionList(args?: Record<string, any>): Promise<IRemoteSession[]>;

  /**
   * 删除话题(多个以逗号分割)
   * @param realID
   */
  deleteSession(realID: string): Promise<boolean>;

  /**
   * 更新会话
   * @param realID
   * @param session
   */
  updateSession(
    realID: string,
    session: Record<string, any>,
  ): Promise<Record<string, any>>;

  /**
   * 获取指定会话消息清单
   */
  getMessages(args: Record<string, any>): Promise<Record<string, any>[]>;

  /**
   * 删除消息(多个以逗号分割)
   * @param messageID
   */
  deleteMessage(messageID: string): Promise<boolean>;

  /**
   * 点赞消息
   * @param messageID
   */
  likeMessage(messageID: string): Promise<boolean>;

  /**
   * 点踩消息
   * @param messageID
   * @param feedbackContent
   */
  dislikeMessage(messageID: string, feedbackContent?: string): Promise<boolean>;

  /**
   * 取消点赞或者点踩
   * @param messageID
   */
  cancelFeedback(messageID: string): Promise<boolean>;

  /**
   * 清空所有会话
   * @param excludeSessionID 排除会话的会话id
   */
  clearAllSession(excludeSessionID: string): Promise<boolean>;

  /**
   * 清空指定会话的所有消息
   * @param realID
   */
  clearAllMessageBySessionId(realID: string): Promise<boolean>;
}
