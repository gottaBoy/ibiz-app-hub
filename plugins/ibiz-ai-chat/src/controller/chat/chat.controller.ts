/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, h } from 'preact';
import { ChatContainer } from '../../components';
import { IContainerOptions, IResourceOptions } from '../../interface';
import { AiTopicController } from '../ai-topic/ai-topic.controller';
import { AiChatController } from '../ai-chat/ai-chat.controller';
import { ChatTopic } from '../../entity';
import { IndexedDBUtil } from '../../utils';
import { AIChatConst } from '../../constants';
import { getChatSessionId } from '../../utils/util/util';

/**
 * 聊天器控制器
 *
 * @author chitanda
 * @date 2023-10-13 17:10:47
 * @export
 * @class ChatController
 */
export class ChatController {
  /**
   * 聊天框容器
   *
   * @author chitanda
   * @date 2023-10-13 17:10:03
   * @protected
   * @type {HTMLDivElement}
   */
  protected container?: HTMLDivElement;

  /**
   * 默认模式（聊天框）和话题模式（支持多话题切换），聊天框为默认模式
   *
   * @author tony001
   * @date 2025-02-20 16:02:50
   * @protected
   * @type {('DEFAULT' | 'TOPIC')}
   */
  protected mode: 'DEFAULT' | 'TOPIC' = 'DEFAULT';

  /**
   * 资源配置数据
   */
  resourceOptions!: IResourceOptions | undefined;

  /**
   * 容器配置备份
   *
   * @author tony001
   * @date 2025-02-24 11:02:49
   * @protected
   * @type {(IContainerOptions | undefined)}
   */
  protected backupChatOptions: IContainerOptions | undefined;

  /**
   * 话题控制器
   *
   * @author tony001
   * @date 2025-02-23 16:02:56
   * @public
   * @type {AiTopicController}
   */
  public aiTopic: AiTopicController;

  /**
   * 聊天控制器
   *
   * @readonly
   * @type {(AiChatController | undefined)}
   * @memberof ChatController
   */
  public get aiChat(): AiChatController | undefined {
    return this.aiTopicMap.get(`${this.aiTopic.activedTopic.value?.id}`);
  }

  /**
   * 话题map
   *
   * @private
   * @type {Map<string, AiChatController>}
   * @memberof ChatController
   */
  private aiTopicMap: Map<string, AiChatController> = new Map();

  /**
   * Creates an instance of ChatController.
   * @author tony001
   * @date 2025-02-24 11:02:20
   */
  constructor() {
    this.aiTopic = new AiTopicController(this);
  }

  /**
   * 初始化IndexDB
   *
   * @author tony001
   * @date 2025-02-24 18:02:50
   * @return {*}  {Promise<void>}
   */
  async initIndexDB(): Promise<void> {
    const bol = await IndexedDBUtil.checkTableExists(
      AIChatConst.DATA_BASE_NAME,
      AIChatConst.DATA_TABLE_NAME,
    );
    if (!bol) {
      await IndexedDBUtil.createTable(
        AIChatConst.DATA_BASE_NAME,
        AIChatConst.DATA_TABLE_NAME,
        AIChatConst.DATA_TABLE_KEY_NAME,
        false,
      );
    }
  }

  /**
   * 创建聊天窗口(会同时显示出来)
   *
   * @author tony001
   * @date 2025-02-24 12:02:58
   * @param {IContainerOptions} opts
   * @return {*}  {Promise<AiChatController>}
   */
  async create(opts: IContainerOptions): Promise<AiChatController> {
    this.resourceOptions = opts.resourceOptions;
    const resourceMode = opts.resourceOptions?.resourceMode || 'LOCAL';
    if (resourceMode === 'LOCAL') {
      await this.initIndexDB();
    }
    this.backupChatOptions = opts;
    this.close();
    this.container = document.createElement('div');
    this.container.classList.add('ibiz-ai-chat');
    document.body.appendChild(this.container);

    const chatOptions = opts.chatOptions;

    // 立即渲染初始加载状态
    render(
      h(ChatContainer, {
        mode: opts.mode ? opts.mode : 'DEFAULT',
        containerOptions: opts.containerOptions,
        caption:
          opts.mode && opts.mode === 'TOPIC' ? 'AI助手' : chatOptions.caption,
        autoClose: opts.containerOptions?.autoClose,
        openMode: opts.containerOptions?.openMode,
        hideTopicSidebar: opts.topicOptions?.hideTopicSidebar || false,
        close: () => {
          this.close();
          if (chatOptions && chatOptions.closed) {
            chatOptions.closed(chatOptions.context, chatOptions.params, []);
          }
        },
        fullscreen: (target: boolean) => {
          if (chatOptions && chatOptions.fullscreen) {
            chatOptions.fullscreen(
              target,
              chatOptions.context,
              chatOptions.params,
            );
          }
        },
        minimize: (target: boolean) => {
          if (chatOptions && chatOptions.minimize) {
            chatOptions.minimize(
              target,
              chatOptions.context,
              chatOptions.params,
            );
          }
        },
        isLoading: true,
      }),
      this.container,
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let topicOptions: any;

    // 智能体清单(由内部获取，优化打开速度)
    if (!chatOptions.aiAgentlist && chatOptions.fetchAgentList) {
      chatOptions.aiAgentlist = await chatOptions.fetchAgentList();
    }

    if (
      !chatOptions.aiknowledgeBasesList &&
      chatOptions.fetchKnowledgeBaseList &&
      chatOptions.enableKnowledgeBaseSelect
    ) {
      chatOptions.aiknowledgeBasesList =
        await chatOptions.fetchKnowledgeBaseList();
    } else {
      chatOptions.aiknowledgeBasesList = [];
    }

    if (opts.mode && opts.mode === 'TOPIC') {
      this.aiTopic.injectResourceOptions(opts.resourceOptions);
      // 加载话题历史
      await this.aiTopic.fetchHistory(opts.topicOptions!);
      // 更新当前话题
      topicOptions = opts.topicOptions!;
      Object.assign(topicOptions, {
        aiChat: {
          caption: chatOptions.caption,
          context: chatOptions.context,
          params: chatOptions.params,
          appDataEntityId: chatOptions.appDataEntityId,
          sessionid: chatOptions.sessionid,
          contentToolbarItems: chatOptions.contentToolbarItems,
          footerToolbarItems: chatOptions.footerToolbarItems,
          questionToolbarItems: chatOptions.questionToolbarItems,
          otherToolbarItems: chatOptions.otherToolbarItems,
          appendCurData: chatOptions.appendCurData,
          appendCurContent: chatOptions.appendCurContent,
          enableAIAgentChange: chatOptions.enableAIAgentChange,
          activeAIAgentID: chatOptions.activeAIAgentID,
          aiAgentlist: chatOptions.aiAgentlist,
          srfMode: chatOptions.srfMode,
          appendCurResource: chatOptions.appendCurResource,
        },
      });
      // 同步历史参数
      this.syncHistoryOptions(topicOptions, chatOptions, opts.resourceOptions);
      await this.aiTopic.asyncTopic(topicOptions);
    } else {
      this.aiTopic.setActivedTopic(undefined);
    }

    Object.assign(chatOptions, {
      topicId: topicOptions?.id,
      topic: topicOptions,
      aiTopic: this.aiTopic,
    });

    const aiChat = new AiChatController(chatOptions, this.resourceOptions);

    this.aiTopicMap.set(`${topicOptions?.id}`, aiChat);

    // 如果是临时会话
    if (opts.mode && opts.mode === 'TOPIC' && this.aiTopic.isTempChat.value) {
      this.aiTopic.enterTempChat();
    } else {
      render(
        h(ChatContainer, {
          aiChat,
          aiTopic: this.aiTopic,
          mode: opts.mode ? opts.mode : 'DEFAULT',
          containerOptions: opts.containerOptions,
          caption:
            opts.mode && opts.mode === 'TOPIC' ? 'AI助手' : chatOptions.caption,
          enableBackFill: opts.containerOptions?.enableBackFill,
          contentToolbarItems: chatOptions.contentToolbarItems,
          footerToolbarItems: chatOptions.footerToolbarItems,
          questionToolbarItems: chatOptions.questionToolbarItems,
          autoClose: opts.containerOptions?.autoClose,
          openMode: opts.containerOptions?.openMode,
          hideTopicSidebar: opts.topicOptions?.hideTopicSidebar || false,
          close: () => {
            this.close();
            if (chatOptions.closed) {
              chatOptions.closed(
                chatOptions.context,
                chatOptions.params,
                aiChat.getAllMessages(),
              );
            }
          },
          fullscreen: (target: boolean) => {
            if (chatOptions.fullscreen) {
              chatOptions.fullscreen(
                target,
                chatOptions.context,
                chatOptions.params,
              );
            }
          },
          minimize: (target: boolean) => {
            if (chatOptions.minimize) {
              chatOptions.minimize(
                target,
                chatOptions.context,
                chatOptions.params,
              );
            }
          },
          isLoading: false,
        }),
        this.container,
      );
    }

    return aiChat;
  }

  /**
   * 同步历史参数(历史激活标识、历史会话标识)
   * @param topicOptions
   * @param chatOptions
   */
  protected syncHistoryOptions(
    topicOptions: Record<string, any>,
    chatOptions: Record<string, any>,
    resourceOptions: IResourceOptions,
  ): void {
    // 禁用存储
    if (topicOptions.disableStorage) {
      // 更正session标识
      const sessionid = getChatSessionId('TEMP');
      chatOptions.sessionid = sessionid;
      topicOptions.aiChat.sessionid = sessionid;
      // 更正话题标题
      topicOptions.caption = '临时会话';
      topicOptions.sourceCaption = '临时会话';
      return;
    }
    // 计算激活话题
    const currentTopic = this.aiTopic.getCurrentTopicByID(
      topicOptions.id,
    ) as ChatTopic;

    // 附加排序和置顶字段
    if (currentTopic) {
      topicOptions.sequence = currentTopic.sequence;
      topicOptions.isTop = currentTopic.isTop;
    }

    // 计算activeAIAgentID
    if (
      currentTopic &&
      currentTopic.aiChat &&
      currentTopic.aiChat.activeAIAgentID
    ) {
      chatOptions.activeAIAgentID = currentTopic.aiChat.activeAIAgentID;
      topicOptions.aiChat.activeAIAgentID = currentTopic.aiChat.activeAIAgentID;
    } else if (chatOptions.aiAgentlist && chatOptions.aiAgentlist.length > 0) {
      if (!chatOptions.activeAIAgentID) {
        const activeAIAgent = chatOptions.aiAgentlist.find(
          (item: Record<string, any>) => item.default === 1,
        );
        if (activeAIAgent) {
          chatOptions.activeAIAgentID = activeAIAgent.id;
          topicOptions.aiChat.activeAIAgentID = activeAIAgent.id;
        } else {
          chatOptions.activeAIAgentID = chatOptions.aiAgentlist[0].id;
          topicOptions.aiChat.activeAIAgentID = chatOptions.aiAgentlist[0].id;
        }
      }
    }

    // 计算缓存会话标识
    if (currentTopic && currentTopic.aiChat && currentTopic.aiChat.sessionid) {
      chatOptions.sessionid = currentTopic.aiChat.sessionid;
      topicOptions.aiChat.sessionid = currentTopic.aiChat.sessionid;
    }

    // 计算话题标题
    const resourceMode = resourceOptions.resourceMode;
    if (resourceMode === 'LOCAL') {
      if (topicOptions.captionMode !== 'default') {
        topicOptions.sourceCaption = '新会话';
        if (currentTopic && currentTopic.caption) {
          topicOptions.caption = currentTopic.caption;
        } else {
          topicOptions.caption = '新会话';
        }
      } else {
        topicOptions.sourceCaption = topicOptions.caption;
      }
      // 远程模式不需要覆盖远程标题
    } else if (resourceMode === 'REMOTE') {
      topicOptions.sourceCaption = topicOptions.caption;
      if (currentTopic && currentTopic.caption) {
        topicOptions.caption = currentTopic.caption;
      }
    }

    // 附加标题是否计算完成
    if (currentTopic) {
      topicOptions.captionComputed = !!currentTopic.captionComputed;
    }

    // 计算话题真实标识
    if (resourceMode === 'REMOTE' && currentTopic && currentTopic.realid) {
      topicOptions.realid = currentTopic.realid;
    }
  }

  /**
   * 切换聊天控制器
   *
   * @author tony001
   * @date 2025-02-24 11:02:24
   * @param {ChatTopic} topic
   */
  public switchAiChatController(topic: ChatTopic): void {
    const opts = {
      ...this.backupChatOptions!.chatOptions,
    };
    if (topic.aiChat) {
      Object.assign(opts, {
        caption: topic.aiChat.caption,
        context: topic.aiChat.context,
        params: topic.aiChat.params,
        sessionid: topic.aiChat.sessionid,
        contentToolbarItems: topic.aiChat.contentToolbarItems,
        footerToolbarItems: topic.aiChat.footerToolbarItems,
        questionToolbarItems: topic.aiChat.questionToolbarItems,
        otherToolbarItems: topic.aiChat.otherToolbarItems,
        appendCurData: topic.aiChat.appendCurData,
        appendCurContent: topic.aiChat.appendCurContent,
        aiAgentlist: topic.aiChat.aiAgentlist,
        activeAIAgentID: topic.aiChat.activeAIAgentID,
        enableAIAgentChange: topic.aiChat.enableAIAgentChange,
        srfMode: topic.aiChat.srfMode,
        appendCurResource: topic.aiChat.appendCurResource,
        appDataEntityId: topic.aiChat.appDataEntityId,
        topicId: topic.id,
        topic,
        aiTopic: this.aiTopic,
        extendToolbarClick:
          this.backupChatOptions!.chatOptions.extendToolbarClick,
        recommendPrompt: this.backupChatOptions!.chatOptions.recommendPrompt,
        chatDigest: this.backupChatOptions!.chatOptions.chatDigest,
        openLinkView: this.backupChatOptions!.chatOptions.openLinkView,
      });
    }
    const aiChat: AiChatController = new AiChatController(
      opts,
      this.resourceOptions,
    );
    this.aiTopicMap.set(`${topic.id}`, aiChat);
    if (this.container) {
      render(null, this.container);
      render(
        h(ChatContainer, {
          aiChat,
          aiTopic: this.aiTopic,
          mode: this.backupChatOptions?.mode
            ? this.backupChatOptions.mode
            : 'DEFAULT',
          containerOptions: this.backupChatOptions?.containerOptions,
          caption:
            this.backupChatOptions?.mode &&
            this.backupChatOptions.mode === 'TOPIC'
              ? 'AI助手'
              : opts.caption,
          enableBackFill:
            this.backupChatOptions?.containerOptions?.enableBackFill,
          contentToolbarItems: opts.contentToolbarItems,
          footerToolbarItems: opts.footerToolbarItems,
          questionToolbarItems: opts.questionToolbarItems,
          autoClose: this.backupChatOptions?.containerOptions?.autoClose,
          openMode: this.backupChatOptions?.containerOptions?.openMode,
          hideTopicSidebar:
            this.backupChatOptions?.topicOptions?.hideTopicSidebar || false,
          close: () => {
            this.close();
            if (opts.closed) {
              opts.closed(opts.context, opts.params, aiChat.getAllMessages());
            }
          },
          fullscreen: (target: boolean) => {
            if (opts.fullscreen) {
              opts.fullscreen(target, opts.context, opts.params);
            }
          },
          minimize: (target: boolean) => {
            if (opts.minimize) {
              opts.minimize(target, opts.context, opts.params);
            }
          },
          isLoading: false,
        }),
        this.container,
      );
    }
  }

  /**
   * 隐藏聊天窗口(必须先创建)
   *
   * @author chitanda
   * @date 2023-10-13 17:10:55
   */
  hidden(): void {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }

  /**
   * 显示聊天窗窗口(必须先创建)
   *
   * @author chitanda
   * @date 2023-10-13 17:10:29
   */
  show(): void {
    if (this.container) {
      this.container.style.display = 'flex';
    }
  }

  /**
   * 关闭聊天窗口
   *
   * @author chitanda
   * @date 2023-10-13 17:10:10
   */
  close(): void {
    if (this.container) {
      render(null, this.container);
      this.container.remove();
      this.container = undefined;
    }
    this.aiTopicMap.forEach(aiChat => {
      aiChat.destroyed();
    });
  }
}

// 唯一实例
const chat = new ChatController();

export { chat };
