/* eslint-disable react/jsx-key */
import { useSignal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import { IChatStep } from '../../interface';
import { Namespace } from '../../utils';
import { ChatStepItem } from '../chat-step-item/chat-step-item';
import './chat-step.scss';

export interface ChatStepProps {
  items: IChatStep[];
}
const ns = new Namespace('chat-step');

export const ChatStep = (props: ChatStepProps) => {
  const { items } = props;

  // 是否显示折叠按钮
  const showToggle = useSignal(false);

  // 是否展开
  const isExpanded = useSignal(true);

  const displayedItems = useSignal<IChatStep[]>([]);

  // 初始化是否显示折叠按钮
  useEffect(() => {
    showToggle.value = items.length > 1;
    displayedItems.value =
      showToggle.value && !isExpanded.value ? [items[items.length - 1]] : items;
  }, [items]);

  // 处理折叠按钮点击事件
  const handleToggle = () => {
    isExpanded.value = !isExpanded.value;
    displayedItems.value =
      showToggle.value && !isExpanded.value ? [items[items.length - 1]] : items;
  };

  return (
    <div className={`${ns.b()}`}>
      <div className={ns.e('container')}>
        {displayedItems.value.map((element, index) => (
          <ChatStepItem
            key={`${element.title}_${element.content}_${index}`}
            element={element}
          />
        ))}
      </div>
      {showToggle.value && (
        <div className={ns.e('toggle')} onClick={handleToggle}>
          <span className={ns.e('toggle-label')}>
            {isExpanded.value ? '执行步骤  收缩' : '执行步骤  展开'}
          </span>
        </div>
      )}
    </div>
  );
};
