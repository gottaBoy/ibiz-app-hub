/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState } from 'preact/hooks'; // 引入 useState
import { useComputed, useSignal } from '@preact/signals';
import { ChatTopic } from '../../entity';
import { Namespace } from '../../utils';
import {
  TopSvg,
  LinkSvg,
  MoreSvg,
  NoTopSvg,
  RemoveSvg,
  RenameSvg,
} from '../../icons'; // 引入 SVG 图标
import { Popup } from '../popup/popup';
import { AiTopicController } from '../../controller';
import './chat-topic-item.scss';

export interface ChatTopicItemProps {
  controller: AiTopicController;
  topic: ChatTopic;
  onClick: () => void;
  onAction: (action: string, event: MouseEvent) => void;
}

const ns = new Namespace('chat-topic-item');

export const ChatTopicItem = (props: ChatTopicItemProps) => {
  const { controller, topic, onClick, onAction } = props;
  const ref = useRef<HTMLInputElement>(null);
  const active = useComputed(() => {
    const result = controller.activedTopic.value?.id === topic.id;
    return result;
  });

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  /**
   * 是否为编辑模式
   */
  const isEditMode = useSignal(false);

  /**
   * 跳转主数据
   *
   * @author tony001
   * @date 2025-02-24 10:02:42
   * @param {MouseEvent} event
   */
  const handleJumpToView = (event: MouseEvent) => {
    event.stopPropagation();
    onAction('LINK', event);
  };

  /**
   * 处理话题行为
   *
   * @author tony001
   * @date 2025-02-24 10:02:57
   * @param {string} actionId
   * @param {MouseEvent} event
   */
  const handleAction = (actionId: string, event: MouseEvent) => {
    if (actionId === 'RENAME') {
      isEditMode.value = true;
      // 必须延迟100毫秒聚焦
      setTimeout(() => {
        ref.current?.focus();
      }, 100);
    } else {
      onAction(actionId, event);
    }
    setIsPopupOpen(false);
  };

  /**
   * 处理值改变
   * @param event
   */
  const handleChange = (event: any) => {
    event.stopPropagation();
    topic.data.caption = event.target?.value;
  };

  /**
   * 处理失焦事件
   *
   * - 关闭编辑状态
   * - 执行重命名行为
   * @param {MouseEvent} event
   */
  const handleBlur = (event: Event) => {
    event.stopPropagation();
    isEditMode.value = false;
    onAction('RENAME', event as MouseEvent);
  };

  /**
   * 处理回车事件
   *
   * - 关闭编辑状态
   * @param event
   */
  const handleKeyDown = (event: KeyboardEvent) => {
    event.stopPropagation();
    if (event.key === 'Enter') {
      isEditMode.value = false;
    }
  };

  return (
    <div
      className={`${ns.b()} ${ns.is('active', active.value)} ${ns.is(
        'edit',
        isEditMode.value,
      )}`}
      onClick={onClick.bind(this)}
    >
      <div className={ns.e('caption')} title={topic.caption}>
        {isEditMode.value ? (
          <input
            ref={ref}
            value={topic.caption}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onClick={e => e.stopPropagation()}
            onChange={value => handleChange(value)}
            className={ns.em('caption', 'editor')}
          />
        ) : (
          <div className={ns.em('caption', 'readonly')}>
            <span className={ns.em('caption', 'text')}>{topic.caption}</span>
            {topic.isTop ? (
              <span className={ns.em('caption', 'icon')}>
                <TopSvg />
              </span>
            ) : null}
          </div>
        )}
      </div>
      {!isEditMode.value && (
        <div className={ns.e('icon')}>
          <span
            title='跳转主视图'
            className={ns.em('icon', 'item')}
            onClick={handleJumpToView.bind(this)}
          >
            <LinkSvg className={ns.b('link-icon')} />
          </span>
          {!active.value ? (
            <Popup
              triggerMode='click'
              actions={[
                {
                  id: 'PINNED',
                  caption: topic.isTop ? '取消置顶' : '置顶',
                  icon: topic.isTop ? <NoTopSvg /> : <TopSvg />,
                },
                { id: 'RENAME', caption: '重命名', icon: <RenameSvg /> },
                { id: 'DELETE', caption: '删除话题', icon: <RemoveSvg /> },
              ]}
              position='bottom'
              isOpen={isPopupOpen}
              onToggleOpen={setIsPopupOpen}
              onAction={handleAction.bind(this)}
            >
              <span className={ns.em('icon', 'item')} title='更多'>
                <MoreSvg className={ns.e('more-icon')} />
              </span>
            </Popup>
          ) : null}
        </div>
      )}
    </div>
  );
};
