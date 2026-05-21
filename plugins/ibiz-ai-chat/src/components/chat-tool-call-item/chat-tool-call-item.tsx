/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { h } from 'preact';
import { IChatToolCall } from '../../interface';
import { Namespace } from '../../utils';
import { DefaultToolCall } from './default-tool-call/default-tool-call';
import { ChunkToolCall } from './chunk-tool-call/chunk-tool-call';
import { ImageToolCall } from './image-tool-call/image-tool-call';
import './chat-tool-call-item.scss';

export interface ChatToolCallItemProps {
  /**
   * @description 工具调用
   * @type {IChatToolCall}
   * @memberof ChatToolCallItemProps
   */
  item: IChatToolCall;
}

export const ChatToolCallItem = (props: ChatToolCallItemProps) => {
  const ns = new Namespace('chat-tool-call-item');
  let com = null;

  switch (props.item.type) {
    case 'fetch_chunks':
      com = ChunkToolCall;
      break;
    case 'desc_oss_image':
      com = ImageToolCall;
      break;
    default:
      com = DefaultToolCall;
  }

  return h(com, {
    item: props.item,
    className: ns.b(),
  });
};
