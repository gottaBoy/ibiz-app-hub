import { useMemo } from 'preact/hooks';
import { aiChatT, Namespace, isSvg } from '../../../utils';
import { LikeSvg, DislikeSvg } from '../../../icons';
import { IChatMessage, IChatToolbarItem } from '../../../interface';
import { ChatMessage } from '../../../entity';
import { AiChatController } from '../../../controller';
import './messsage-toolbar.scss';

interface MessageToolbarProps {
  /**
   * @description 单实例聊天总控
   * @type {AiChatController}
   * @memberof MessageToolbarProps
   */
  controller: AiChatController;
  /**
   * @description 消息
   * @type {IChatMessage}
   * @memberof MessageToolbarProps
   */
  message: IChatMessage;
}

const ns = new Namespace('messsage-toolbar');

export const MessageToolbar = (props: MessageToolbarProps) => {
  const { controller, message } = props;

  const items: IChatToolbarItem[] = [
    {
      id: 'islike',
      label: aiChatT('like'),
      title: aiChatT('like'),
      icon: () => {
        return <LikeSvg />;
      },
      onClick: () => {
        controller.messageLike((message as ChatMessage)._origin);
      },
    },
    {
      id: 'isdislike',
      label: aiChatT('dislike'),
      title: aiChatT('dislike'),
      icon: () => {
        return <DislikeSvg />;
      },
      onClick: () => {
        controller.messageDisLike((message as ChatMessage)._origin);
      },
    },
  ];

  /**
   * @description 处理点击
   * @param {MouseEvent} evt
   * @param {IChatToolbarItem} item
   * @returns {*}
   */
  const handleClick = (evt: MouseEvent, item: IChatToolbarItem) => {
    item.onClick?.(evt, item, controller.context, controller.params, message);
  };

  /**
   * @description 绘制图标
   * @param {IChatToolbarItem} item
   * @returns {*}
   */
  const renderIcon = (item: IChatToolbarItem) => {
    if (typeof item.icon === 'function') return item.icon();
    if (item.icon?.showIcon && item.icon?.cssClass)
      return <i className={item.icon.cssClass} />;
    if (item.icon?.showIcon && item.icon?.imagePath) {
      if (isSvg(item.icon.imagePath))
        return (
          <div
            dangerouslySetInnerHTML={{
              __html: item.icon.imagePath,
            }}
          />
        );
      return <img src={item.icon.imagePath} />;
    }
  };

  /**
   * 是否隐藏
   */
  const hidden = useMemo(() => {
    return (
      (message.state === 20 && message.completed !== true) ||
      controller.resourceMode !== 'REMOTE' ||
      !message.realmessageid ||
      controller.currentTopicDisableStorage
    );
  }, [message.state, message.completed]);

  // 隐藏不绘制
  if (hidden) return <></>;

  return (
    <div className={`${ns.b()}`}>
      {items.map((item, index) => {
        const isActived =
          (item.id === 'islike' && message.islike === '1') ||
          (item.id === 'isdislike' && message.isdislike === '1');
        return (
          <div
            key={index}
            title={item.title}
            onClick={e => handleClick(e, item)}
            className={`${ns.e('item')} ${ns.is('actived', isActived)}`}
          >
            {renderIcon(item)}
          </div>
        );
      })}
    </div>
  );
};
