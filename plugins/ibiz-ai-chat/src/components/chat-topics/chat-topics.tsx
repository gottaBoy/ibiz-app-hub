/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { Fragment } from 'preact/jsx-runtime';
import { AiTopicController } from '../../controller';
import { ChatTopic } from '../../entity';
import { Namespace } from '../../utils';
import { ChatTopicItem } from '../chat-topic-item/chat-topic-item';
import {
  NewDialogueSvg,
  RemoveSvg,
  SiderbarSvg,
  TempChatSelectedSvg,
  TempChatSvg,
} from '../../icons';
import { ChatSearch } from '../chat-search/chat-search';
import './chat-topics.scss';

export interface ChatTopicProps {
  /**
   * 话题控制器
   *
   * @author tony001
   * @date 2025-02-20 17:02:49
   * @type {AiTopicController}
   */
  controller: AiTopicController;
}

const ns = new Namespace('chat-topics');

export const ChatTopics = (props: ChatTopicProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * 快速搜索值
   */
  const query = useSignal<string | undefined>(undefined);

  /**
   * 当前话题列表
   */
  const topics = useSignal<ChatTopic[]>([]);

  useEffect(() => {
    const currentTopic = [...props.controller.topics.value].sort((a, b) => {
      // 第一优先级：置顶状态（true在前，false在后）
      if (a.isTop !== b.isTop) return b.isTop ? 1 : -1;
      // 第二优先级：sequence排序
      return a.sequence - b.sequence;
    });
    topics.value = currentTopic.filter(topic =>
      topic.caption
        ?.toLowerCase()
        .includes(query.value?.trim().toLowerCase() || ''),
    );
  }, [props.controller.topics.value]);

  /**
   * 项点击
   *
   * @author tony001
   * @date 2025-02-24 10:02:31
   * @param {ChatTopic} topic
   */
  const itemClick = (topic: ChatTopic) => {
    if (props.controller.isTempChat.value) {
      props.controller.exitTempChat();
    }
    props.controller.handleTopicChange(topic);
  };

  /**
   * 话题行为
   *
   * @author tony001
   * @date 2025-02-24 10:02:22
   * @param {string} action
   * @param {ChatTopic} topic
   * @param {MouseEvent} event
   */
  const handleTopicAction = (
    action: string,
    topic: ChatTopic,
    event: MouseEvent,
  ) => {
    props.controller.handleTopicAction(action, topic, event);
  };

  /**
   * 处理值改变
   *
   * @param {*} event
   */
  const handleChange = (value: string) => {
    query.value = value;
    topics.value = props.controller.topics.value.filter(topic =>
      topic.caption
        ?.toLowerCase()
        .includes(query.value?.trim().toLowerCase() || ''),
    );
  };

  // 监听激活项改变，滚动到激活项
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const selectedElement = container.querySelector(
      '.ibiz-chat-topic-item.is-active',
    );
    selectedElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [props.controller.activedTopic.value]);

  /**
   * 切换侧栏折叠状态
   * @param event
   */
  const switchSidebarCollapse = () => {
    props.controller.switchTopicSidebarCollapse();
  };

  /**
   *  切换临时会话状态
   */
  const switchTempChatState = (state: boolean) => {
    if (state) {
      props.controller.enterTempChat();
    } else {
      props.controller.exitTempChat();
      // 查找前一个激活会话
      let preActivedTopic = props.controller.preActivedTopic;
      if (!preActivedTopic) {
        preActivedTopic = props.controller.topics.value[0];
      }
      // 切换激活
      if (!preActivedTopic) return;
      props.controller.handleTopicChange(preActivedTopic);
    }
  };

  /**
   * 新建会话
   */
  const globalNewTopic = () => {
    props.controller.globalNewTopic();
  };

  return (
    <div className={ns.b()}>
      {props.controller.topicSidebarCollapse.value === true ? (
        <div className={ns.e('collapse-container')}>
          <div
            className={ns.e('icon-item')}
            title={'打开侧栏'}
            onClick={() => switchSidebarCollapse()}
          >
            <SiderbarSvg />
          </div>
          {props.controller.isTempChat.value === false ? (
            <div
              className={ns.e('icon-item')}
              title={'进入临时会话'}
              onClick={() => switchTempChatState(true)}
            >
              <TempChatSvg />
            </div>
          ) : (
            <div
              className={ns.e('icon-item')}
              title={'退出临时会话'}
              onClick={() => switchTempChatState(false)}
            >
              <TempChatSelectedSvg />
            </div>
          )}
        </div>
      ) : (
        <Fragment>
          <div className={ns.e('header')}>
            <div className={ns.e('icon-container')}>
              <div
                className={ns.e('icon-item')}
                title={'收起侧栏'}
                onClick={() => switchSidebarCollapse()}
              >
                <SiderbarSvg />
              </div>
              <div
                className={ns.e('icon-item')}
                title={'新建对话'}
                onClick={() => globalNewTopic()}
              >
                <NewDialogueSvg />
              </div>
              {props.controller.isTempChat.value === false ? (
                <div
                  className={ns.e('icon-item')}
                  title={'进入临时会话'}
                  onClick={() => switchTempChatState(true)}
                >
                  <TempChatSvg />
                </div>
              ) : (
                <div
                  className={ns.e('icon-item')}
                  title={'退出临时会话'}
                  onClick={() => switchTempChatState(false)}
                >
                  <TempChatSelectedSvg />
                </div>
              )}
            </div>
            <ChatSearch
              value={query.value}
              placeholder='搜索话题'
              onChange={handleChange.bind(this)}
            />
          </div>
          <div ref={containerRef} className={ns.e('main')}>
            {topics.value && topics.value.length > 0 ? (
              topics.value.map(topic => {
                if (topic.isShow === false) return null;
                return (
                  <ChatTopicItem
                    key={topic.id}
                    topic={topic}
                    controller={props.controller}
                    onClick={() => itemClick(topic)}
                    onAction={(action: string, event: MouseEvent) =>
                      handleTopicAction(action, topic, event)
                    }
                  />
                );
              })
            ) : (
              <div className={ns.e('empty')}>暂无话题</div>
            )}
          </div>
          <div className={ns.e('footer')}>
            <div
              title='清空会话'
              className={ns.e('action')}
              onClick={() => props.controller.clearTopic()}
            >
              <RemoveSvg />
              <span>清空会话</span>
            </div>
          </div>
        </Fragment>
      )}
    </div>
  );
};
