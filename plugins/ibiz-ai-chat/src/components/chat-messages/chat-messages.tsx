import { useEffect, useRef, useState, useMemo } from 'preact/hooks';
import { Namespace } from '../../utils';
import { AiChatController } from '../../controller';
import { IChatToolbarItem } from '../../interface';
import { ChatMessageItem } from '../chat-message-item/chat-message-item';
import { ChatToolbar } from '../chat-toolbar/chat-toolbar';
import { ChatBackBottom } from '../chat-back-bottom/chat-back-bottom';
import './chat-messages.scss';

export interface ChatMessageProps {
  /**
   * 单实例聊天总控
   *
   * @author chitanda
   * @date 2023-10-13 17:10:43
   * @type {AiChatController}
   */
  controller: AiChatController;

  /**
   * 工具项集合
   *
   * @type {IChatToolbarItem[]}
   * @memberof ChatMessageProps
   */
  toolbarItems?: IChatToolbarItem[];
}

const ns = new Namespace('chat-messages');

export const ChatMessages = (props: ChatMessageProps) => {
  const ref = useRef<HTMLDivElement>(null);

  // 加载更多条数
  const batchSize: number = 5;
  // 当前显示的消息数量
  const [displayCount, setDisplayCount] = useState(batchSize);
  // 是否正在加载更多
  const [isLoading, setIsLoading] = useState(false);
  // 是否自动滚动
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  // 标志位
  const isScrollingAutomatically = useRef(false);

  const messages = props.controller.messages;

  const visibleMessages = useMemo(() => {
    // 始终显示最新的消息，所以从末尾开始取
    const startIndex = Math.max(0, messages.value.length - displayCount);
    return messages.value.slice(startIndex);
  }, [messages.value, displayCount]);

  const hasMoreMessages = useMemo(() => {
    return displayCount < messages.value.length;
  }, [messages.value, displayCount]);

  // 滚动到底部
  const scrollToBottom = () => {
    const container = ref.current;
    if (!container) return;
    // 设置标志位，表示当前是自动滚动
    isScrollingAutomatically.current = true;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'auto',
    });
    setTimeout(() => {
      isScrollingAutomatically.current = false;
    }, 500);
  };

  useEffect(() => {
    // 如果是自动滚动模式，则滚动到底部
    if (isAutoScroll) scrollToBottom();
  }, [messages.value]);

  // 监听滚动事件
  const handleScroll = () => {
    // 如果是自动滚动触发的，忽略此次事件
    if (isScrollingAutomatically.current) return;

    const container = ref.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;

    // 检查是否滚动到顶部附近（触发加载更多）
    if (scrollTop < 100 && !isLoading && hasMoreMessages) {
      setIsLoading(true);

      // 加载更多消息
      setTimeout(() => {
        const newCount = Math.min(
          displayCount + batchSize,
          messages.value.length,
        );
        setDisplayCount(newCount);

        // 保持当前滚动位置（加载更多后不跳转）
        const oldScrollHeight = container.scrollHeight;
        setTimeout(() => {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop =
            newScrollHeight - oldScrollHeight + container.scrollTop;
          setIsLoading(false);
        }, 0);
      }, 300); // 添加一点延迟让用户体验更好
    }

    // 检查是否接近底部（用于自动滚动判断）
    const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 50;
    setIsAutoScroll(isNearBottom);
  };

  /**
   * 处理回到底部
   *
   */
  const handleBackBottom = () => {
    isScrollingAutomatically.current = true;
    setIsAutoScroll(true);
  };

  return (
    <div ref={ref} className={ns.b()} onScroll={handleScroll}>
      {visibleMessages.map(message => {
        const size = message.content?.length || 0;
        return message.role !== 'SYSTEM' ? (
          <ChatMessageItem
            size={size}
            message={message}
            key={`${message.messageid}_${message.completed ? 'completed' : 'incomplete'}`}
            controller={props.controller}
          >
            <ChatToolbar
              type='content'
              mode='DEFAULT'
              hideTopicSidebar={false}
              data={message}
              items={props.toolbarItems}
              controller={props.controller}
            />
          </ChatMessageItem>
        ) : null;
      })}
      <ChatBackBottom
        right={20}
        bottom={14}
        target={`.${ns.b()}`}
        onClick={handleBackBottom}
      />
    </div>
  );
};
