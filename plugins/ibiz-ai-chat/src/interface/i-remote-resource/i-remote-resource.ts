/**
 * @description 远程会话接口
 */
export interface IRemoteSession {
  /**
   * 真实标识
   */
  realid: string;
  /**
   * 会话标识
   */
  session_id: string;
  /**
   * 会话标题
   */
  caption: string;
  /**
   * 会话排序
   */
  sequence: number;
  /**
   * @description 是否置顶
   * @type {(0 | 1)}
   * @memberof IRemoteSession
   */
  is_top: 0 | 1;
}

/**
 * @description 远程消息接口
 */
export interface IRemoteMessage {
  /**
   * 消息标识
   */
  id: string;
  /**
   * 消息内容
   */
  content: string;
  /**
   * 消息排序
   */
  sequence: number;
  /**
   * 是否点赞
   */
  is_like: '0' | '1';
  /**
   * 是否点踩
   */
  is_dislike: '0' | '1';
  /**
   * 反馈内容
   */
  feedback_content: string;
  /**
   * 发送者类型，用户 | AI智能体 | 系统通知
   */
  sender_type: 'user' | 'agent' | 'system';
  /**
   * 处理耗时
   */
  latency_ms: number;
  /**
   * 消息状态， 待处理 | 已处理 | 失败 | 用户取消
   */
  status: 'pending' | 'sent' | 'failed' | 'canceled';
}
