/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useMemo } from 'preact/hooks';
import { IChatToolbarItem } from '../../interface';
import { AiChatController } from '../../controller';
import { Namespace } from '../../utils';
import {
  CopySvg,
  DeleteSvg,
  RefreshSvg,
  FillSvg,
  ResetDialogueSvg,
  ClearDialogueSvg,
} from '../../icons';
import { ContainerContext } from '../chat-container/chat-container';
import { ChatMessage } from '../../entity';
import { ChatToolberItem } from './chat-toolbar-item/chat-toolbar-item';
import './chat-toolbar.scss';

export interface ChatToolbarProps {
  /**
   * 单实例聊天总控
   *
   * @type {AiChatController}
   * @memberof ChatToolbarProps
   */
  controller: AiChatController;

  /**
   * 用户自定义工具项集合
   *
   * @type {IChatToolbarItem}
   * @memberof ChatToolbarProps
   */
  items?: IChatToolbarItem[];

  /**
   * 业务数据
   *
   * @type {*}
   * @memberof ChatToolbarProps
   */
  data: any;

  /**
   * 工具栏类型
   *
   * @type {('content' | 'footer')}
   * @memberof ChatToolbarProps
   */
  type: 'content' | 'footer';

  /**
   * 类名
   *
   * @type {string}
   * @memberof ChatToolbarProps
   */
  className?: string;

  /**
   * AI模式
   *
   * @type {('DEFAULT' | 'TOPIC')}
   * @memberof ChatToolbarProps
   */
  mode: 'DEFAULT' | 'TOPIC';

  /**
   * 隐藏话题侧边栏
   *
   * @type {boolean}
   * @memberof ChatToolbarProps
   */
  hideTopicSidebar: boolean;
}

const ns = new Namespace('chat-toolbar');

export const ChatToolbar = (props: ChatToolbarProps) => {
  const { controller, items = [], data, type, className } = props;
  const containerContext = useContext(ContainerContext);

  let toolbarItems: IChatToolbarItem[] = [];

  /**
   * 底部默认工具栏
   *
   */
  const FooterDefaultItems: IChatToolbarItem[] = [
    {
      label: '重置对话',
      title: '重置对话',
      icon: () => {
        return <ResetDialogueSvg />;
      },
      onClick: () => {
        controller.resetTopic();
      },
      children: [
        {
          label: '清空对话',
          title: '清空对话',
          icon: () => {
            return <ClearDialogueSvg />;
          },
          onClick: () => {
            controller.clearTopic();
          },
        },
      ],
    },
  ];

  /**
   * 回答默认工具栏
   *
   */
  const AnswerDefaultItems: IChatToolbarItem[] = [
    {
      label: '刷新',
      title: '刷新',
      icon: () => {
        return <RefreshSvg />;
      },
      onClick: () => {
        controller.refreshMessage(data);
      },
    },
    {
      label: '删除',
      title: '删除',
      hidden: (): boolean => {
        return !data.realmessageid;
      },
      icon: () => {
        return <DeleteSvg />;
      },
      onClick: () => {
        controller.deleteMessage(data);
      },
    },
    {
      label: '复制',
      title: '复制',
      icon: () => {
        return <CopySvg />;
      },
      onClick: () => {
        controller.copyMessage(data);
      },
    },
  ];

  // 容器注入参数
  if (containerContext.enableBackFill) {
    AnswerDefaultItems.unshift(
      ...[
        {
          label: '回填',
          title: '回填',
          icon: () => {
            return <FillSvg />;
          },
          onClick: () => {
            controller.backfill(data);
          },
        },
      ],
    );
  }

  /**
   * 提问默认工具栏
   */
  const QuestionDefaultItems: IChatToolbarItem[] = [
    {
      label: '刷新',
      title: '刷新',
      icon: () => {
        return <RefreshSvg />;
      },
      onClick: () => {
        controller.refreshMessage(data, true);
      },
    },
  ];

  if (type === 'content') {
    switch (data.type) {
      case 'DEFAULT':
        if (data.role === 'ASSISTANT') {
          toolbarItems = [...AnswerDefaultItems, ...items];
        } else {
          toolbarItems = [...QuestionDefaultItems];
        }
        break;
      case 'ERROR':
        toolbarItems = [...AnswerDefaultItems, ...items];
        break;
      default:
        break;
    }
  } else {
    toolbarItems = [...FooterDefaultItems, ...items];
  }

  const handleItemClick = (e: MouseEvent, item: IChatToolbarItem): void => {
    const tempData = {
      ...data,
    };
    // 特殊处理消息数据
    if (data instanceof ChatMessage) {
      Object.assign(tempData, { topic: controller.topic });
      // 计算真实文本
      tempData.msg.realcontent = data.realcontent;
    } else {
      if (!tempData.data) tempData.data = {};
      Object.assign(tempData.data, { messages: controller.messages.value });
    }
    if (item.onClick && typeof item.onClick === 'function') {
      item.onClick(e, item, controller.context, controller.params, tempData);
    } else {
      const extendToolbarClick = props.controller.opts.extendToolbarClick;
      if (extendToolbarClick && typeof extendToolbarClick === 'function') {
        extendToolbarClick(
          e,
          item,
          controller.context,
          controller.params,
          tempData,
        );
      }
    }
  };

  const isLoadding = useMemo(() => {
    return type === 'content' && data?.state === 20 && data?.completed !== true;
  }, [data?.state, data?.completed]);

  return (
    <div className={`${ns.b()} ${className || ''}`}>
      {toolbarItems.map((item, index) => {
        return (
          <ChatToolberItem
            data={data}
            key={index}
            model={item}
            disabled={isLoadding}
            buttonType={type === 'content' ? 'circle' : 'default'}
            onClick={handleItemClick.bind(this)}
          />
        );
      })}
    </div>
  );
};
