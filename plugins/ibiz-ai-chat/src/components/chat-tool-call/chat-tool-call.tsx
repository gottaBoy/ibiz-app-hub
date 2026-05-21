import { useComputed, useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { IChatToolCall } from '../../interface';
import { Namespace } from '../../utils';
import { ChatToolCallItem } from '../chat-tool-call-item/chat-tool-call-item';
import './chat-tool-call.scss';

export interface ChatToolCallProps {
  /**
   * @description 工具调用集合
   * @type {IChatToolCall[]}
   * @memberof ChatToolCallProps
   */
  items: IChatToolCall[];

  /**
   * @description 工具调用是否处理完成
   */
  toolcallCompleted: boolean;
}

export const ChatToolCall = (props: ChatToolCallProps) => {
  const { items } = props;

  const ns = new Namespace('chat-tool-call');

  const nodes = useSignal<IChatToolCall[]>([]);
  const isExpanded = useSignal(false);
  const showToggle = useSignal(false);

  useEffect(() => {
    nodes.value = items.filter(item => item);
    showToggle.value = items.length > 4;
  }, [items]);

  // 使用计算属性确保界面能实时响应数据变化
  const displayedNodes = useComputed(() => {
    return showToggle.value && !isExpanded.value
      ? nodes.value.slice(0, 4)
      : nodes.value;
  });

  const handleToggle = () => {
    isExpanded.value = !isExpanded.value;
  };

  return (
    <div className={`${ns.b()}`}>
      {!props.toolcallCompleted && (
        <div className={ns.e('loading-container')}>
          <div className={ns.e('loading-text')}>智能体工具调用执行中</div>
          <div className={ns.e('loading-dot')}></div>
          <div className={ns.e('loading-dot')}></div>
          <div className={ns.e('loading-dot')}></div>
        </div>
      )}
      {props.toolcallCompleted &&
        displayedNodes.value.map((item, index) => {
          return <ChatToolCallItem key={index} item={item}></ChatToolCallItem>;
        })}
      {props.toolcallCompleted && showToggle.value && (
        <div className={ns.e('toggle')} onClick={handleToggle}>
          <span className={ns.e('toggle-label')}>
            {isExpanded.value ? '工具调用  收缩' : '工具调用  展开'}
          </span>
        </div>
      )}
    </div>
  );
};
