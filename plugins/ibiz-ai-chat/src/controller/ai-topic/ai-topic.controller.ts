/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-useless-return */
import { Signal, signal } from '@preact/signals';
import { ChatTopic } from '../../entity';
import {
  IChat,
  ITopic,
  ITopicOptions,
  IRemoteSession,
  IResourceOptions,
} from '../../interface';
import { ChatController } from '../chat/chat.controller';
import { aiChatT, IndexedDBUtil } from '../../utils';
import { AIChatConst } from '../../constants';
import { getChatSessionId, getStringBeforeLastAt } from '../../utils/util/util';

/**
 * ai话题控制器
 *
 * @author tony001
 * @date 2025-02-20 16:02:01
 * @export
 * @class AiTopicController
 */
export class AiTopicController {
  /**
   * 话题清单
   *
   * @author tony001
   * @date 2025-02-20 16:02:38
   * @type {Signal<ChatTopic[]>}
   */
  readonly topics: Signal<ChatTopic[]> = signal([]);

  /**
   * 激活话题
   *
   * @author tony001
   * @date 2025-02-24 16:02:44
   * @type {(Signal<ITopic | undefined>)}
   */
  readonly activedTopic: Signal<ITopic | undefined> = signal(undefined);

  /**
   * 折叠话题侧边栏
   *
   * @author tony001
   * @date 2026-02-05 11:33:34
   * @type {Signal<boolean>}
   */
  readonly topicSidebarCollapse: Signal<boolean> = signal(false);

  /**
   * 侧边栏宽度
   * @author tony001
   * @date 2026-02-05 13:48:34
   * @type {Signal<number>}
   */
  readonly topicSidebarWidth: Signal<number> = signal(0);

  /**
   * 是否是临时会话
   *
   * @author tony001
   * @date 2026-02-05 17:26:34
   * @type {Signal<boolean>}
   */
  readonly isTempChat: Signal<boolean> = signal(false);

  /**
   * 当前话题配置备份
   *
   * @author tony001
   * @date 2025-02-24 16:02:28
   * @public
   * @type {(ITopicOptions | undefined)}
   */
  public backupOptions: ITopicOptions | undefined;

  /**
   * 上一次激活话题
   */
  public preActivedTopic: ChatTopic | undefined;

  /**
   * 远程会话列表
   */
  private remoteSessionList: IRemoteSession[] = [];

  /**
   * 资源模式
   */
  private resourceMode: 'REMOTE' | 'LOCAL' = 'LOCAL';

  /**
   * 资源选项
   */
  private resourceOptions: IResourceOptions | undefined;

  /**
   * Creates an instance of AiTopicController.
   * @author tony001
   * @date 2025-02-24 11:02:26
   * @param {ChatController} chat
   */
  constructor(private chat: ChatController) {
    this.computeTopicSidebarWidth();
  }

  /**
   * 设置激活话题
   * @param topic 话题数据
   */
  public setActivedTopic(topic: ChatTopic | undefined): void {
    this.preActivedTopic = this.activedTopic.value as ChatTopic | undefined;
    this.activedTopic.value = topic;
  }

  /**
   * 注入资源选项
   * @param resourceOptions
   */
  public injectResourceOptions(
    resourceOptions: IResourceOptions | undefined,
  ): void {
    this.resourceMode = resourceOptions?.resourceMode || 'LOCAL';
    this.resourceOptions = resourceOptions;
  }

  /**
   * 获取历史话题
   *
   * @author tony001
   * @date 2025-02-23 16:02:37
   * @return {*}  {Promise<void>}
   */
  public async fetchHistory(options: ITopicOptions): Promise<void> {
    this.topics.value = [];
    const config = options.configService(
      options.appid,
      'aitopics',
      options.type,
    );
    const configList = (await config.load()) as Array<ITopic>;
    if (configList && configList.length > 0) {
      // 同步远程会话数据
      if (this.resourceMode === 'REMOTE' && this.resourceOptions) {
        this.remoteSessionList = await this.resourceOptions.getSessionList();
        await this.asyncRemoteSession(configList);
      } else {
        configList.forEach((element: ITopic, index: number) => {
          // 初始化排序和置顶
          if (!Object.prototype.hasOwnProperty.call(element, 'sequence'))
            element.sequence = index;
          if (!Object.prototype.hasOwnProperty.call(element, 'isTop'))
            element.isTop = 0;
          this.topics.value = [...this.topics.value, new ChatTopic(element)];
        });
      }
    }
  }

  /**
   * 同步远程会话
   * @param configList config存储数据
   */
  async asyncRemoteSession(configList: Array<ITopic>): Promise<void> {
    if (
      !this.remoteSessionList ||
      this.remoteSessionList.length === 0 ||
      !configList ||
      configList.length === 0
    ) {
      return;
    }
    this.remoteSessionList.forEach((session: IRemoteSession) => {
      const targetConfig = configList.find((config: ITopic) => {
        return config.aiChat?.sessionid === session.session_id;
      });
      if (targetConfig) {
        targetConfig.realid = session.realid;
        // 初始化排序和置顶
        targetConfig.sequence = session.sequence;
        targetConfig.isTop = session.is_top ? session.is_top : 0;
        if (session.caption) targetConfig.caption = session.caption;
        // 获取目标位置
        const topicIndex = this.topics.value.findIndex(
          item => item.aiChat?.sessionid === session.session_id,
        );
        // 不存在则新增，存在则更新
        if (topicIndex === -1) {
          this.topics.value = [
            ...this.topics.value,
            new ChatTopic(targetConfig),
          ];
        } else {
          this.topics.value.splice(topicIndex, 1, new ChatTopic(targetConfig));
          this.topics.value = [...this.topics.value];
        }
      }
    });
  }

  /**
   * 同步当前话题
   *
   * @author tony001
   * @date 2025-02-23 17:02:43
   * @param {ITopicOptions} options
   * @return {*}  {Promise<void>}
   */
  public async asyncTopic(options: ITopicOptions): Promise<void> {
    this.backupOptions = options;
    const chatTopicIndex = this.topics.value.findIndex(
      item => item.id === options.id,
    );
    const chatTopic = new ChatTopic(options);
    if (chatTopicIndex !== -1) {
      this.topics.value.splice(chatTopicIndex, 1, chatTopic);
    } else {
      this.topics.value = [...this.topics.value, chatTopic];
    }
    await this.updateTopic(options);
    // 设置激活项
    this.setActivedTopic(chatTopic);
  }

  /**
   * 获取指定标识话题
   * @param topicid
   * @returns
   */
  public getCurrentTopicByID(topicid: string): ChatTopic | undefined {
    const result = this.topics.value.find(item => item.id === topicid);
    return result && result.data
      ? new ChatTopic({ ...result.data })
      : undefined;
  }

  /**
   * 基于话题标识更新当前话题
   * @param topicid 话题标识
   */
  public async updateTopicChatByID(
    topicid: string,
    args: Record<string, any>,
  ): Promise<void> {
    if (!topicid || !args || !this.backupOptions) {
      return;
    }
    const chatTopicIndex = this.topics.value.findIndex(
      item => item.id === topicid,
    );
    if (
      chatTopicIndex === -1 ||
      !this.topics.value[chatTopicIndex].data.aiChat
    ) {
      return;
    }
    // 修正当前激活智能体标识（跟随界面选择数据）
    this.topics.value[chatTopicIndex].data.aiChat = {
      ...this.topics.value[chatTopicIndex].data.aiChat,
      ...args,
    } as IChat;
    await this.updateTopic(this.backupOptions);
  }

  /**
   * 删除话题
   *
   * @author tony001
   * @date 2025-02-24 16:02:03
   * @param {ITopicOptions} options
   * @param {object} context
   * @param {object} params
   * @param {ITopic} data
   * @param {MouseEvent} event
   * @return {*}  {Promise<void>}
   */
  public async removeTopic(
    options: ITopicOptions,
    context: object,
    params: object,
    data: ITopic,
    event: MouseEvent,
  ): Promise<void> {
    let checkResult: boolean = true;
    if (options.beforeDelete) {
      checkResult = await options.beforeDelete(context, params, data, event);
    }
    if (!checkResult) {
      return;
    }
    let result: boolean = false;
    // 禁用存储不做处理
    if (data && (data as Record<string, any>).disableStorage) {
      result = true;
    } else if (this.resourceMode === 'LOCAL') {
      result = await IndexedDBUtil.deleteData(
        AIChatConst.DATA_BASE_NAME,
        AIChatConst.DATA_TABLE_NAME,
        data.id,
      );
      // 删除远程会话数据,存在真实id，则删除远程session数据；不存在真实id，先基于sessionid查询，如果存在则删除，不存在直接删除
    } else if (this.resourceMode === 'REMOTE' && this.resourceOptions) {
      if (data.realid) {
        result = await this.resourceOptions.deleteSession(data.realid);
      } else if (data.aiChat && data.aiChat.sessionid) {
        const queryList = await this.resourceOptions.getSessionList({
          n_session_id_eq: data.aiChat.sessionid,
        });
        if (queryList && queryList.length > 0) {
          result = await this.resourceOptions.deleteSession(
            queryList[0].realid,
          );
        } else {
          result = true;
        }
      }
    }
    if (!result) return;
    const chatTopicIndex = this.topics.value.findIndex(
      item => item.id === data.id,
    );
    if (chatTopicIndex !== -1) {
      this.topics.value.splice(chatTopicIndex, 1);
      this.topics.value = [...this.topics.value];
    }
    await this.updateTopic(options);

    // 删除完后，当前激活项和删除的项不是同一个则切换到第一项
    if (
      this.topics.value.length > 0 &&
      data.id === this.activedTopic.value?.id
    ) {
      this.handleTopicChange(this.topics.value[0]);
    }
  }

  /**
   * 处理选中变化
   *
   * @author tony001
   * @date 2025-02-20 19:02:27
   * @param {ChatTopic} item
   */
  public handleTopicChange(item: ChatTopic): void {
    if (this.activedTopic.value?.id === item.id) {
      return;
    }
    this.setActivedTopic(item);
    this.chat.switchAiChatController(item);
  }

  /**
   * 处理话题行为
   *
   * @author tony001
   * @date 2025-02-24 16:02:58
   * @param {string} action
   * @param {ChatTopic} topic
   * @param {MouseEvent} event
   * @return {*}  {Promise<void>}
   */
  public async handleTopicAction(
    action: string,
    topic: ChatTopic,
    event: MouseEvent,
  ): Promise<void> {
    const trigerTopic = this.topics.value.find(item => {
      return item.id === topic.id;
    });
    if (this.backupOptions && trigerTopic && trigerTopic.aiChat) {
      const { context, params } = trigerTopic.aiChat;

      switch (action) {
        case 'DELETE':
          await this.removeTopic(
            this.backupOptions,
            context,
            params,
            trigerTopic,
            event,
          );
          break;
        case 'RENAME':
        case 'PINNED':
          // 置顶行为
          if (action === 'PINNED') {
            // 更改置顶状态
            topic.data.isTop = topic.data.isTop === 0 ? 1 : 0;
            // 强制更新UI
            this.topics.value = [...this.topics.value];
          }
          // 禁用存储不做处理
          if (topic && !topic.disableStorage) {
            await this.updateTopic(this.backupOptions);
            // 更新远程会话数据,存在真实id，则更新远程session数据；不存在真实id，先基于sessionid查询，如果存在则更新，不存在则不处理
            if (
              topic &&
              this.resourceMode === 'REMOTE' &&
              this.resourceOptions
            ) {
              if (topic.realid) {
                await this.resourceOptions.updateSession(topic.realid, {
                  caption: topic.caption,
                  is_top: topic.isTop,
                });
              } else if (topic.aiChat && topic.aiChat.sessionid) {
                const queryList = await this.resourceOptions.getSessionList({
                  n_session_id_eq: topic.aiChat.sessionid,
                });
                if (queryList && queryList.length > 0) {
                  await this.resourceOptions.updateSession(
                    queryList[0].realid,
                    {
                      caption: topic.caption,
                      is_top: topic.isTop,
                    },
                  );
                }
              }
            }
          }
          break;
        default:
          break;
      }
      this.backupOptions.action?.(action, context, params, topic, event);
    }
  }

  /**
   * 清空指定话题的消息
   * @param topicID
   * @returns
   */
  public async clearMessagesByTopicId(topicID: string): Promise<boolean> {
    let result: boolean = true;
    if (!topicID || !this.backupOptions) {
      return result;
    }
    const chatTopicIndex = this.topics.value.findIndex(
      item => item.id === topicID,
    );
    if (chatTopicIndex === -1 || !this.topics.value[chatTopicIndex].data) {
      return result;
    }
    const currentTopic = this.topics.value[chatTopicIndex];
    if (!currentTopic) {
      return result;
    }
    // 禁用存储不做处理
    if (currentTopic.disableStorage) return result;
    // 远程更新(存在真实id，直接清空，不存在，先查询，存在则清空，不存在则不处理)
    if (this.resourceMode === 'REMOTE' && this.resourceOptions) {
      if (currentTopic.realid) {
        result = await this.resourceOptions.clearAllMessageBySessionId(
          currentTopic.realid,
        );
      } else if (currentTopic.aiChat && currentTopic.aiChat.sessionid) {
        const queryList = await this.resourceOptions.getSessionList({
          n_session_id_eq: currentTopic.aiChat.sessionid,
        });
        if (queryList && queryList.length > 0) {
          result = await this.resourceOptions.clearAllMessageBySessionId(
            queryList[0].realid,
          );
        }
      }
      if (!result) return result;
    }
    return result;
  }

  /**
   * 新建对话
   *
   * @author tony001
   * @date 2025-03-18 18:03:49
   * @return {*}  {Promise<void>}
   */
  public async newTopic(
    topicid: string,
    args: Record<string, any>,
  ): Promise<void> {
    if (!topicid) return;
    const activedTopic = this.getCurrentTopicByID(topicid);
    if (!activedTopic) return;

    // 构建仿真数据（克隆源头数据，修改id（源头数据id@当前时间戳）和caption（源头数据标题_当前话题数量））
    // 当前激活话题的源头数据id
    const activedBaseTopicID = getStringBeforeLastAt(activedTopic.id);
    const activedTopics = this.topics.value.filter(item => {
      return item.id.startsWith(activedBaseTopicID);
    });
    // 修正当前数据（新建对话需要跟随智能体标识和会话标识）
    if (args && activedTopic.aiChat) {
      activedTopic.data.aiChat = {
        ...activedTopic.aiChat,
        ...args,
      };
    }
    // 处理话题标题
    let caption = '';
    if (activedTopic.captionMode === 'default') {
      caption = `${activedTopic.sourceCaption?.split('_')[0]}_${
        activedTopics.length
      }`;
    } else {
      caption = aiChatT('newChat');
    }
    const maxSequence = Math.max(
      ...this.topics.value.map(item => item.sequence),
    );

    const options = {
      appid: activedTopic.appid,
      // 源头数据id@当前时间戳
      id: `${activedBaseTopicID}@${Date.now()}`,
      type: activedTopic.type,
      captionMode: activedTopic.captionMode,
      caption,
      sourceCaption: activedTopic.sourceCaption,
      url: activedTopic.url,
      aiChat: activedTopic.aiChat,
      sequence: maxSequence + 1,
      isTop: 0,
      disableStorage: activedTopic.disableStorage,
    } as ITopic;
    const chatTopic = new ChatTopic(options);
    this.topics.value = [...this.topics.value, chatTopic];
    if (this.backupOptions) {
      await this.updateTopic(this.backupOptions);
    }
    // 切换激活
    this.handleTopicChange(chatTopic);
  }

  /**
   * 清空话题
   * - 当前激活项不清空
   * @return {*}  {Promise<void>}
   * @memberof AiTopicController
   */
  public async clearTopic(): Promise<void> {
    const actived = this.topics.value.find(
      item => item.id === this.activedTopic.value?.id,
    );
    if (!this.backupOptions || !actived) return;
    let checkResult: boolean = true;
    if (this.backupOptions.beforeDelete) {
      checkResult = await this.backupOptions.beforeDelete(
        actived.aiChat!.context,
        actived.aiChat!.params,
        actived,
        undefined,
        true,
      );
    }
    if (!checkResult) return;
    let result: boolean = false;
    // 删除非激活项本地缓存
    if (this.resourceMode === 'LOCAL') {
      await Promise.all(
        this.topics.value.map(topic => {
          if (topic.id !== actived?.id && !topic.disableStorage)
            return IndexedDBUtil.deleteData(
              AIChatConst.DATA_BASE_NAME,
              AIChatConst.DATA_TABLE_NAME,
              topic.id,
            );
          return;
        }),
      );
      result = true;
    } else if (this.resourceMode === 'REMOTE') {
      if (actived && this.resourceOptions) {
        const excludeSessionID = actived.aiChat?.sessionid;
        if (excludeSessionID) {
          result = await this.resourceOptions.clearAllSession(excludeSessionID);
        } else {
          result = true;
        }
      } else {
        result = true;
      }
    }
    if (!result) return;

    // 话题列表只保留激活项
    this.topics.value = actived ? [actived] : [];
    // 存储数据
    await this.updateTopic(this.backupOptions);
  }

  /**
   * 更新话题标题
   * @param topicId
   * @param message
   */
  public async updateTopicCaption(
    topicId: string,
    newCaption: string,
  ): Promise<void> {
    const result = this.topics.value.find(item => item.id === topicId);
    if (result && result.caption !== newCaption) {
      result.data.caption = newCaption;
      result.data.captionComputed = true;
      this.topics.value = [...this.topics.value];
      // 存储数据
      if (this.backupOptions) {
        await this.updateTopic(this.backupOptions);
      }
    }
  }

  /**
   * 更新话题数据
   *
   * @param {ITopicOptions} options 话题配置
   * @return {*}  {Promise<void>}
   * @memberof AiTopicController
   */
  public async updateTopic(options: ITopicOptions): Promise<void> {
    if (!options) return;
    const result: ITopic[] = [];
    this.topics.value.forEach(item => {
      if (!item.disableStorage) {
        result.push({
          appid: item.appid,
          id: item.id,
          type: item.type,
          captionMode: item.captionMode,
          captionComputed: !!item.captionComputed,
          caption: item.caption || item.sourceCaption,
          sourceCaption: item.sourceCaption,
          url: item.url,
          aiChat: item.aiChat,
          isTop: item.isTop,
          sequence: item.sequence,
        });
      }
    });
    const config = options.configService(
      options.appid,
      'aitopics',
      options.type,
    );
    await config?.save(result);
  }

  /**
   * 计算话题侧边栏宽度
   */
  public computeTopicSidebarWidth(): void {
    this.topicSidebarWidth.value =
      this.topicSidebarCollapse.value === true ? 42 : 200;
  }

  /**
   * 切换话题侧边栏折叠状态
   */
  public switchTopicSidebarCollapse(): void {
    this.topicSidebarCollapse.value = !this.topicSidebarCollapse.value;
    this.computeTopicSidebarWidth();
  }

  /**
   * 全局新建会话
   * @returns
   */
  public globalNewTopic(): void {
    if (!this.activedTopic.value) return;
    // 非临时会话基于当前激活会话构建，临时会话先退出再基于初始化会话构建
    if (!this.isTempChat.value) {
      const aiChat = this.activedTopic.value.aiChat!;
      this.newTopic(this.activedTopic.value.id, {
        activeAIAgentID: aiChat.activeAIAgentID,
        sessionid: `${getStringBeforeLastAt(aiChat.sessionid)}@${new Date().getTime()}`,
      });
    } else {
      if (!this.backupOptions) return;
      this.exitTempChat();
      const aiChat = this.backupOptions.aiChat!;
      this.newTopic(this.backupOptions.id, {
        activeAIAgentID: aiChat.activeAIAgentID,
        sessionid: `${getStringBeforeLastAt(
          aiChat.sessionid,
        )}@${new Date().getTime()}`,
      });
    }
  }

  /**
   * 进入临时会话
   */
  public enterTempChat(): void {
    this.isTempChat.value = true;
    if (!this.backupOptions) {
      console.error(aiChatT('missingBackup'));
      return;
    }
    const backupTopicBaseID = getStringBeforeLastAt(this.backupOptions.id);
    const tempSessionid = getChatSessionId('TEMP');
    const maxSequence = Math.max(
      ...this.topics.value.map(item => item.sequence),
    );
    const backupAIChat = {
      ...this.backupOptions.aiChat,
      sessionid: tempSessionid,
    };
    const options = {
      appid: this.backupOptions.appid,
      id: `${backupTopicBaseID}@${Date.now()}`,
      type: this.backupOptions.type,
      captionMode: this.backupOptions.captionMode,
      caption: aiChatT('temporaryChat'),
      sourceCaption: aiChatT('temporaryChat'),
      url: this.backupOptions.url,
      aiChat: backupAIChat,
      sequence: maxSequence + 1,
      isTop: 0,
      disableStorage: true,
      isShow: false,
    } as ITopic;
    const chatTopic = new ChatTopic(options);
    this.topics.value = [...this.topics.value, chatTopic];
    // 切换激活
    this.handleTopicChange(chatTopic);
  }

  /**
   * 退出临时会话
   * @param isSwitchTopic 是否切换激活会话
   * @returns
   */
  public exitTempChat(): void {
    this.isTempChat.value = false;
    // 获取临时会话目标位置
    const tempTopicIndex = this.topics.value.findIndex(
      item => item.disableStorage === true && item.isShow === false,
    );
    if (tempTopicIndex !== -1) {
      this.topics.value.splice(tempTopicIndex, 1);
      this.topics.value = [...this.topics.value];
    }
  }
}
