import { IChatMessage, IRemoteMessage } from '../../interface';

/**
 * 基于远程类型角色转换
 * @param type
 * @returns
 */
export function getMsgRoleByRemoteType(
  type: string,
): 'USER' | 'ASSISTANT' | 'SYSTEM' {
  switch (type) {
    case 'user':
      return 'USER';
    case 'agent':
      return 'ASSISTANT';
    case 'system':
      return 'SYSTEM';
    default:
      return 'USER';
  }
}

/**
 * 基于远程状态转换至消息状态
 * @param state
 * @returns
 */
export function getMsgStateByRemoteState(
  state: 'pending' | 'sent' | 'failed' | 'canceled',
): 10 | 20 | 30 | 40 {
  switch (state) {
    case 'pending':
      return 20;
    case 'sent':
      return 30;
    case 'failed':
      return 40;
    case 'canceled':
      return 30;
    default:
      return 30;
  }
}

/**
 *  基于远程状态转换至消息类型
 * @param state
 * @returns
 */
export function getMsgTypeByRemoteState(
  state: 'pending' | 'sent' | 'failed' | 'canceled',
): string | 'DEFAULT' | 'ERROR' {
  switch (state) {
    case 'pending':
    case 'sent':
    case 'canceled':
      return 'DEFAULT';
    case 'failed':
      return 'ERROR';
    default:
      return 'DEFAULT';
  }
}

/**
 * 基于远程消息转换至本地消息
 * @param remoteMsg
 * @returns
 */
export function getMsgByRemoteMsg(remoteMsg: IRemoteMessage): IChatMessage {
  return {
    messageid: remoteMsg.id,
    state: getMsgStateByRemoteState(remoteMsg.status),
    type: getMsgTypeByRemoteState(remoteMsg.status),
    role: getMsgRoleByRemoteType(remoteMsg.sender_type),
    content: remoteMsg.content,
    completed: true,
    islike: remoteMsg.is_like,
    isdislike: remoteMsg.is_dislike,
    feedbackcontent: remoteMsg.feedback_content,
    realmessageid: remoteMsg.id,
    status: remoteMsg.status,
  };
}
