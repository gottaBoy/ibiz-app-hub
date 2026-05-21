/* eslint-disable no-case-declarations */
/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Signal, signal } from '@preact/signals';
import { QXEvent } from 'qx-util';
import {
  AIAgent,
  ChatMessage,
  ChatMaterial,
  KnowledgeBase,
} from '../../entity';
import {
  ITopic,
  IMaterial,
  IChatStep,
  IChatMessage,
  IChatOptions,
  IChatUIAction,
  IAIAgentConfig,
  IChatSuggestion,
  IResourceOptions,
} from '../../interface';
import {
  createUUID,
  IndexedDBUtil,
  ChatStepParser,
  ChatSuggestionParser,
  MaterialResourceParser,
} from '../../utils';
import { parsePredefProtocol, TextUtil } from '../../utils/util/util';
import { AIChatConst } from '../../constants';
import { AiTopicController } from '../ai-topic/ai-topic.controller';
import { getMsgByRemoteMsg } from '../../utils/util/remote-resource-util';

/**
 * 聊天逻辑控制器
 *
 * @author chitanda
 * @date 2023-10-09 15:10:51
 * @export
 * @class AiChatController
 */
export class AiChatController {
  /**
   * 事件触发器
   * @type {EventBase}
   */
  evt: QXEvent<{
    [p: string]: (...args: any[]) => any;
  }> = new QXEvent<{
    [p: string]: (...args: any[]) => any;
  }>();

  /**
   * 聊天记录
   *
   * @author chitanda
   * @date 2023-10-16 16:10:29
   * @type {Signal<ChatMessage[]>}
   */
  readonly messages: Signal<ChatMessage[]> = signal([]);

  /**
   * 素材列表
   *
   * @author tony001
   * @date 2025-02-27 18:02:46
   * @type {Signal<IMaterial[]>}
   */
  readonly materials: Signal<IMaterial[]> = signal([]);

  /**
   * 聊天框输入值
   *
   * @author chitanda
   * @date 2023-10-16 15:10:43
   * @type {Signal<string>}
   */
  readonly input: Signal<string> = signal('');

  /**
   * 是否加载中
   *
   * @author tony001
   * @date 2025-03-10 18:03:42
   * @type {Signal<boolean>}
   */
  readonly isLoading: Signal<boolean> = signal(false);

  /**
   * 是否启用选择知识库
   *
   * @author tony001
   * @date 2026-02-03 16:38:09
   * @type {Signal<boolean>}
   */
  readonly enableKnowledgeBaseSelect: Signal<boolean> = signal(false);

  /**
   * 是否启用设置召回参数
   *
   * @author tony001
   * @date 2026-02-03 16:39:00
   * @type {Signal<boolean>}
   */
  readonly enableRecallConfigSetting: Signal<boolean> = signal(false);

  /**
   * 是否允许切换AI代理
   */
  public enableAIAgentChange: boolean = true;

  /**
   * 激活AI代理标识
   *
   * @type {(string | undefined)}
   */
  public activeAIAgentID: string | undefined;

  /**
   * AI代理列表
   *
   * @type {Signal<AIAgent[]>}
   */
  readonly agentList: Signal<AIAgent[]> = signal([]);

  /**
   * 视图参数
   *
   * @author tony001
   * @date 2025-02-24 14:02:23
   * @type {object}
   */
  readonly context: object;

  /**
   * 视图参数
   *
   * @author tony001
   * @date 2025-02-24 14:02:32
   * @type {object}
   */
  readonly params: object;

  /**
   * 应用实体标记
   *
   * @author tony001
   * @date 2025-02-24 14:02:10
   * @type {string}
   */
  readonly appDataEntityId: string;

  /**
   * 话题标识
   *
   * @author tony001
   * @date 2025-02-24 18:02:02
   * @type {(string | undefined)}
   */
  readonly topicId: string | undefined = undefined;

  /**
   * 话题数据
   *
   * @author tony001
   * @date 2025-03-10 16:03:26
   * @type {(ITopic | undefined)}
   */
  readonly topic: ITopic | undefined = undefined;

  /**
   * 话题控制器
   */
  readonly aiTopic: AiTopicController | undefined = undefined;

  /**
   * @description 聊天sessionid
   * @type {string}
   * @memberof AiChatController
   */
  chatSessionid: string = '';

  /**
   * 模式参数，用于业务区分
   */
  chatMode: string | undefined;

  /**
   * 摘要是否正在处理完成
   */
  private isDigestProcessed: boolean = false;

  /**
   * 知识库列表
   */
  private knowledgeBasesList: KnowledgeBase[] = [];

  /**
   * 选中知识库
   */
  selectionKnowledgeBases: Signal<string[]> = signal([]);

  /**
   * 当前可选知识库
   */
  knowledgeBases: Signal<KnowledgeBase[]> = signal([]);

  /**
   * 智能体召回配置
   */
  reCallConfig: Signal<IAIAgentConfig> = signal({
    chunkrerank: 2,
    maxchunks: 10,
    chunkthreshold: 0.4,
  });

  /**
   * AI资源模式
   */
  get resourceMode(): 'REMOTE' | 'LOCAL' {
    return this.resourceOptions?.resourceMode || 'LOCAL';
  }

  /**
   * 当前话题是否禁止存储
   */
  get currentTopicDisableStorage(): boolean {
    if (this.topicId && this.aiTopic) {
      const currentTopic = this.aiTopic.getCurrentTopicByID(this.topicId);
      if (currentTopic && currentTopic.disableStorage) {
        return true;
      }
    }
    return false;
  }

  /**
   * 当前话题标题模式
   */
  get sessionCaptionMode(): 'default' | 'snippet' | 'summary' {
    if (this.aiTopic && this.topicId) {
      const currentTopic = this.aiTopic.getCurrentTopicByID(this.topicId);
      if (currentTopic && currentTopic.captionMode) {
        return currentTopic.captionMode;
      }
    }
    return 'default';
  }

  /**
   * 当前话题标题
   */
  get sessionDefaultCaption(): string {
    if (this.aiTopic && this.topicId) {
      const currentTopic = this.aiTopic.getCurrentTopicByID(this.topicId);
      if (currentTopic && currentTopic.caption) {
        return currentTopic.caption;
      }
    }
    return this.opts.caption || '新会话';
  }

  /**
   * Creates an instance of AiChatController.
   *
   * @author chitanda
   * @date 2023-10-15 19:10:34
   * @param {IChatOptions} opts 聊天配置
   * @param {IChatOptions} resourceOptions 资源配置
   */
  constructor(
    readonly opts: IChatOptions,
    readonly resourceOptions: IResourceOptions | undefined,
  ) {
    this.context = opts.context;
    this.params = opts.params;
    this.appDataEntityId = opts.appDataEntityId;
    this.aiTopic = opts.aiTopic;
    this.topicId = opts.topicId;
    this.topic = opts.topic;
    this.activeAIAgentID = opts.activeAIAgentID;
    this.enableAIAgentChange = !!opts.enableAIAgentChange;
    this.chatMode = opts.srfMode;
    this.chatSessionid = opts.sessionid;
    this.enableKnowledgeBaseSelect.value = !!opts.enableKnowledgeBaseSelect;
    this.enableRecallConfigSetting.value = !!opts.enableRecallConfigSetting;
    this.initAIChat();
  }

  /**
   * 初始化
   */
  private async initAIChat(): Promise<void> {
    this.messages.value = [];
    await this.initAIChatAgent();
    await this.initAIChatKnowledge();
    await this.fecthHistory();
  }

  /**
   * 初始化AI代理列表
   */
  private async initAIChatAgent(): Promise<void> {
    if (this.opts.aiAgentlist && this.opts.aiAgentlist.length > 0) {
      this.opts.aiAgentlist.forEach(item => {
        this.agentList.value = [
          ...this.agentList.value,
          new AIAgent(item, {
            chunkrerank: this.opts.reRankDefaultValue,
            maxchunks: this.opts.maxChunksDefaultValue,
            chunkthreshold: this.opts.chunkThresholdDefaultValue,
          }),
        ];
      });
    }
    // 不允许设置召回参数则无需计算智能体召回配置
    if (!this.enableRecallConfigSetting.value) return;

    const agent = this.agentList.value.find(a => a.id === this.activeAIAgentID);
    if (agent)
      this.reCallConfig.value = {
        chunkrerank: agent.rerank,
        maxchunks: agent.maxchunks,
        chunkthreshold: agent.chunkthreshold,
      };
  }

  /**
   * 初始化AI知识库
   */
  private async initAIChatKnowledge(): Promise<void> {
    // 不允许选择知识库则无需初始化AI知识库相关内容
    if (!this.enableKnowledgeBaseSelect.value) return;

    if (this.opts.aiknowledgeBasesList?.length)
      this.knowledgeBasesList = this.opts.aiknowledgeBasesList.map(
        k => new KnowledgeBase(k),
      );
    this.computeSelectedKnowledge();
  }

  /**
   * 计算选中知识库
   */
  private computeSelectedKnowledge(): void {
    // 不允许选择知识库则无需初始化AI知识库相关内容
    if (!this.enableKnowledgeBaseSelect.value) return;

    const agent = this.agentList.value.find(a => a.id === this.activeAIAgentID);
    // 可用知识库：无 agent 或 允许任意 → 全量；否则仅 agent 指定的
    this.knowledgeBases.value =
      !agent || agent.allow_any_knowledge_base
        ? [...this.knowledgeBasesList]
        : agent.knowledge_bases?.map(
            k =>
              new KnowledgeBase({
                id: k.ai_knowledge_base_id,
                name: k.ai_knowledge_base_name,
              }),
          ) || [];

    // 有选中知识库ID则使用选中知识库id设置默认选中
    if (this.opts.selectAIKnowledgeBaseId) {
      this.selectionKnowledgeBases.value = this.knowledgeBases.value
        .filter(k => this.opts.selectAIKnowledgeBaseId?.includes(k.id))
        .map(k => k.id);
    } else if (agent) {
      // 否则将智能体绑定的知识库默认选中
      this.selectionKnowledgeBases.value =
        agent.knowledge_bases?.map(k => k.ai_knowledge_base_id) || [];
    }
  }

  /**
   * 获取历史记录存储key(用于适配不同智能体存在不同的历史记录)
   * @param topicId 话题标识
   * @returns 历史存储key
   */
  private getHistoryStoreKey(topicId: string): string {
    return `${topicId}`;
  }

  /**
   * 获取查询知识库数据ID字符集
   *
   * @returns string | undefined
   */
  private getQueryKnowledgeBases(): string | undefined {
    return this.enableKnowledgeBaseSelect.value
      ? this.selectionKnowledgeBases.value.join(',')
      : undefined;
  }

  /**
   * 获取召回配置参数
   *
   * @returns IAIAgentConfig | undefined
   */
  private getQueryRecallConfig(): IAIAgentConfig | undefined {
    return this.enableRecallConfigSetting.value
      ? this.reCallConfig.value
      : undefined;
  }

  /**
   * 获取历史记录
   *
   * @author tony001
   * @date 2025-02-24 13:02:52
   * @return {*}  {Promise<boolean>}
   */
  async fecthHistory(): Promise<boolean> {
    if (this.topicId) {
      let result: any = {};
      // 禁用存储不做处理
      if (this.currentTopicDisableStorage) {
        result.data = [];
      } else if (this.resourceMode === 'LOCAL') {
        result = await IndexedDBUtil.getData(
          AIChatConst.DATA_BASE_NAME,
          AIChatConst.DATA_TABLE_NAME,
          this.getHistoryStoreKey(this.topicId),
        );
      } else if (this.resourceMode === 'REMOTE' && this.resourceOptions) {
        const messages = await this.resourceOptions.getMessages({
          n_session_id_eq: this.chatSessionid,
        });
        if (messages && messages.length > 0) {
          const tempData: Record<string, any>[] = [];
          messages.forEach((item: any) => {
            tempData.push(getMsgByRemoteMsg(item));
          });
          result.data = tempData;
        }
      }
      if (result && result.data && result.data.length > 0) {
        result.data.forEach((item: IChatMessage) => {
          const msg = {
            messageid: item.messageid,
            state: item.state,
            type: item.type,
            role: item.role,
            islike: item.islike,
            isdislike: item.isdislike,
            feedbackcontent: item.feedbackcontent,
            content: item.content,
            suggestions: item.suggestions,
            completed: true,
            toolcalls: item.toolcalls,
            realmessageid: item.realmessageid,
            status: item.status,
            chatsteps: item.chatsteps,
            chatuiactions: item.chatuiactions,
          };
          this.addMessage(msg);
        });
        await this.afterFecthHistory();
        return true;
      }
    }
    const result = await this.opts.history(this.context, this.params, {
      appDataEntityId: this.appDataEntityId,
      appendCurData: this.opts.appendCurData,
      sessionid: this.chatSessionid,
      srfaiagent: this.activeAIAgentID,
      srfmode: this.chatMode,
    });
    if (result) {
      await this.afterFecthHistory();
    }
    return true;
  }

  /**
   * 获取历史记录后续处理
   */
  private async afterFecthHistory(): Promise<void> {
    // 存在附加内容，在请求历史记录后，需要附加当前编辑内容作为用户消息
    if (this.opts.appendCurContent) {
      this.addMessage({
        state: 30,
        messageid: createUUID(),
        role: 'USER',
        type: 'DEFAULT',
        content: this.opts.appendCurContent,
        completed: true,
        status: 'sent',
      });
    }
    // 附加资源处理
    if (this.opts.appendCurResource) {
      const { hasResources, resources } =
        MaterialResourceParser.parseMixedContent(this.opts.appendCurResource);
      if (hasResources && resources && resources.length > 0) {
        resources.forEach(resource => {
          this.replaceMaterial(resource.id, resource);
        });
      }
    }
    // 历史数据最后一个项是user时自动提问
    if (this.opts.autoQuestion !== false) {
      const lastIndex = this.messages.value.length - 1;
      const message = this.messages.value[lastIndex];
      if (message && message.role === 'USER') {
        // 附加素材资源
        const resourceText = this.stringlyMaterialResource(false);
        if (resourceText) {
          const msgContent = resourceText + message.content;
          const data = {
            ...message._origin,
            messageid: createUUID(),
            content: msgContent,
          };
          this.messages.value[lastIndex] = new ChatMessage(data);
          this.messages.value = [...this.messages.value];
        }
        // 提问
        try {
          this.isLoading.value = true;
          await this.opts.question(
            this,
            this.context,
            this.params,
            { appDataEntityId: this.appDataEntityId },
            this.getMessages(),
            this.chatSessionid,
            this.activeAIAgentID,
            this.chatMode,
            this.getQueryKnowledgeBases(),
            this.getQueryRecallConfig(),
          );
          if (this.opts.action)
            await this.opts.action('question', message.content);
        } finally {
          this.isLoading.value = false;
        }
      }
    }
    // 更新话题标题状态(新建或重置会话时默认显示新会话，如果获取到的history内容中包含user信息，则取第一条user信息截取用作标题)
    await this.updateTopicCaption();
  }

  /**
   * 更新数据到indexdb
   *
   * @author tony001
   * @date 2025-02-24 18:02:41
   * @return {*}  {Promise<void>}
   */
  async asyncToIndexDB(): Promise<void> {
    if (!this.topicId || this.resourceMode !== 'LOCAL') {
      return;
    }
    // 禁用存储不做处理
    if (this.currentTopicDisableStorage) {
      return;
    }
    const data = {
      id: this.getHistoryStoreKey(this.topicId),
      data: this.messages.value.map(item => {
        return {
          ...item._origin,
          toolcalls: item.toolcalls,
          chatsteps: item.chatsteps,
          chatuiactions: item.chatuiactions,
        };
      }),
      timestamp: new Date().getTime(),
    };
    await IndexedDBUtil.updateData(
      AIChatConst.DATA_BASE_NAME,
      AIChatConst.DATA_TABLE_NAME,
      data,
    );
  }

  /**
   * 设置聊天框值
   *
   * @author chitanda
   * @date 2023-10-16 16:10:21
   * @param {string} input
   */
  setInput(input: string): void {
    this.input.value = input || '';
  }

  /**
   * 新增聊天记录
   *
   * @author chitanda
   * @date 2023-10-09 15:10:15
   * @param {IMessage} data
   */
  addMessage(data: IChatMessage): void {
    const chatMsg = this.messages.value.find(
      item => item.messageid === data.messageid,
    );
    if (chatMsg) {
      chatMsg.update(data);
      this.messages.value = [...this.messages.value];
    } else {
      const tempMsg = new ChatMessage(data);
      tempMsg.update({ ...data, content: '' });
      this.messages.value = [...this.messages.value, tempMsg];
    }
    this.asyncToIndexDB();
  }

  /**
   * 更新消息完成状态
   *
   * @author tony001
   * @date 2025-02-25 17:02:19
   * @param {string} id
   * @param {boolean} completed
   */
  async completeMessage(id: string, completed: boolean): Promise<void> {
    const chatMsg = this.messages.value.find(item => item.messageid === id);
    if (chatMsg) {
      chatMsg.updateCompleted(completed);
      this.messages.value = [...this.messages.value];
      await this.asyncToIndexDB();
    }

    // AI回答完成时自动回填
    if (this.opts.autoFill === true) {
      const message =
        chatMsg || this.messages.value[this.messages.value.length - 1];
      if (message.role === 'ASSISTANT' && message.state === 30)
        this.backfill(message);
    }

    this.evt.emit('onCompleteMessage', {
      messageid: id,
      completed,
    });
  }

  /**
   * 替换已经存在的聊天消息
   *
   * @author chitanda
   * @date 2023-10-16 22:10:49
   * @param {IChatMessage} data
   */
  replaceMessage(data: IChatMessage, isRecommendPrompt: boolean = true): void {
    // 聊天内容预处理
    let tempChatsteps: IChatStep[] = [];
    if (data.content) {
      const content = data.content;
      // 1.修正附加uiaction字符串
      const uiActionStartIndex: number = content.indexOf('<chatuiaction>');
      const uiActionEndIndex: number = content.indexOf('</chatuiaction>');
      if (
        uiActionStartIndex !== -1 &&
        uiActionEndIndex !== -1 &&
        uiActionStartIndex < uiActionEndIndex
      ) {
        // 排除chatuiaction标签的内容
        data.content = content.replace(
          /\<chatuiaction\>[^]*?\<\/chatuiaction\>/gs,
          '',
        );
      }
      // 2.修正附加chatstep字符串
      const stepStartIndex: number = content.indexOf('<chatstep>');
      const stepEndIndex: number = content.indexOf('</chatstep>');
      if (
        stepStartIndex !== -1 &&
        stepEndIndex !== -1 &&
        stepStartIndex < stepEndIndex
      ) {
        // 获取chatstep集合
        tempChatsteps = ChatStepParser.parse(data.content);
        // 排除chatstep标签的内容
        data.content = content.replace(/\<chatstep\>[^]*?\<\/chatstep\>/gs, '');
      }
    }
    const cloneData = { ...data };
    const i = this.messages.value.findIndex(
      item => item.messageid === data.messageid,
    );
    if (i !== -1) {
      // 更新chatstep集合
      if (tempChatsteps.length > 0) {
        this.messages.value[i].chatsteps?.push(...tempChatsteps);
      }
      cloneData.toolcalls = this.messages.value[i].toolcalls;
      cloneData.chatsteps = this.messages.value[i].chatsteps;
      cloneData.chatuiactions = this.messages.value[i].chatuiactions;
      this.messages.value[i].replace(data);
      this.messages.value = [...this.messages.value];
    } else {
      // 更新chatstep集合
      if (tempChatsteps.length > 0) {
        if (!data.chatsteps) data.chatsteps = [];
        data.chatsteps.push(...tempChatsteps);
      }
      this.messages.value = [...this.messages.value, new ChatMessage(data)];
    }
    this.asyncToIndexDB();
    // 响应成功且存在推荐提示回调，则获取推荐提示
    if (
      data.type === 'DEFAULT' &&
      this.opts.recommendPrompt &&
      isRecommendPrompt
    ) {
      this.opts
        .recommendPrompt(this.context, this.params, {
          appDataEntityId: this.appDataEntityId,
          message: {
            messages: [
              {
                ...data,
                content: data.content.replace(
                  /\<think\>[^]*?\<\/think\>/gs,
                  '',
                ),
              },
            ],
            sessionid: this.chatSessionid,
            srfaiagent: this.activeAIAgentID,
          },
        })
        .then(suggestions => {
          if (suggestions && (suggestions as any).content) {
            this.updateRecommendPrompt(cloneData, (suggestions as any).content);
          }
        });
    }
  }

  /**
   * 终止消息
   *
   * @author tony001
   * @date 2025-03-10 14:03:17
   * @param {IChatMessage} data
   */
  async stopMessage(data: IChatMessage): Promise<void> {
    const i = this.messages.value.findIndex(
      item => item.messageid === data.messageid,
    );
    data.content = data.content || '用户中断';
    if (i !== -1) {
      this.messages.value[i].replace(data);
      this.messages.value = [...this.messages.value];
    } else {
      this.messages.value = [...this.messages.value, new ChatMessage(data)];
    }
    await this.asyncToIndexDB();
  }

  /**
   * 数据对象转 XML 字符串
   *
   * @author tony001
   * @date 2025-03-03 11:03:55
   * @return {*}  {string}
   */
  public stringlyMaterialResource(clearable: boolean = true): string {
    let resources: string = '';
    const materialItems: IMaterial[] = [];
    if (this.materials.value && this.materials.value.length > 0) {
      this.materials.value.forEach(item => {
        // 上传成功的文件才需附加到提示词里面
        if (item.type === 'ossfile') {
          const metaData = item.metadata as any;
          if (metaData.state && metaData.state === 'successed') {
            materialItems.push(item);
          }
        } else {
          materialItems.push(item);
        }
      });
      if (clearable) {
        this.materials.value = [];
      }
    }
    if (materialItems && materialItems.length > 0) {
      resources = MaterialResourceParser.stringify(materialItems);
    }
    return resources;
  }

  /**
   * @description 获取当前会话的消息集合
   * @private
   * @returns {*}  {IChatMessage[]}
   * @memberof AiChatController
   */
  private getMessages(): IChatMessage[] {
    const messages: IChatMessage[] = this.messages.value
      .filter(item => item.type !== 'ERROR' && item.status !== 'canceled')
      .map(item => item._origin);
    messages.forEach(item => {
      item.content = item.content
        .replace(/\<tool_call\>[^]*?\<\/tool_call\>/gs, '')
        .replace(/\<think\>[^]*?\<\/think\>/gs, '')
        .trim();
    });
    return messages;
  }

  /**
   * 获取完整消息集合
   * @returns
   */
  public getAllMessages(): IChatMessage[] {
    return this.messages.value.map(item => {
      return item._origin;
    });
  }

  /**
   * 提问
   *
   * @author chitanda
   * @date 2023-10-09 20:10:43
   * @return {*}  {Promise<void>}
   */
  async question(input: string): Promise<void> {
    try {
      this.isLoading.value = true;
      // 清空所有推荐提示
      this.messages.value.forEach((item, index) => {
        const messageOrigin = item._origin;
        if (messageOrigin.suggestions) {
          messageOrigin.suggestions = undefined;
          this.messages.value[index].replace(messageOrigin);
        }
      });
      this.messages.value = [...this.messages.value];
      this.asyncToIndexDB();
      // 附加素材资源
      let inputText = this.stringlyMaterialResource(true);
      if (inputText) {
        inputText += `\n${input}`;
      } else {
        inputText = input;
      }
      // 添加提问信息
      this.addMessage({
        state: 30,
        messageid: createUUID(),
        role: 'USER',
        type: 'DEFAULT',
        content: inputText,
        status: 'sent',
      });
      // 提问
      await this.opts.question(
        this,
        this.context,
        this.params,
        { appDataEntityId: this.appDataEntityId },
        this.getMessages(),
        this.chatSessionid,
        this.activeAIAgentID,
        this.chatMode,
        this.getQueryKnowledgeBases(),
        this.getQueryRecallConfig(),
      );
      // 更新话题标题状态(历史数据没有用户信息则取第一次用户信息去计算标题，是否更新状态由话题控制器维护)
      await this.updateTopicCaption();
      if (this.opts.action) {
        this.opts.action('question', input);
      }
      this.isLoading.value = false;
    } finally {
      this.isLoading.value = false;
    }
  }

  /**
   * 中断请求
   *
   * @author tony001
   * @date 2025-03-10 14:03:48
   */
  async abortQuestion(): Promise<void> {
    try {
      await this.opts.abortQuestion(this, this.context, this.params, {
        appDataEntityId: this.appDataEntityId,
        sessionid: this.chatSessionid,
        srfaiagent: this.activeAIAgentID,
        srfmode: this.chatMode,
      });
    } finally {
      this.isLoading.value = false;
    }
  }

  /**
   * 回填选中的消息
   *
   * @author chitanda
   * @date 2023-10-16 18:10:19
   * @param {IChatMessage} message
   */
  backfill(message: IChatMessage): void {
    if (this.opts.action) {
      this.opts.action('backfill', message);
    }
  }

  /**
   *
   * 删除指定消息，如果是用户提问的刷新调用的删除，则需要删除从问题开始到最后的所有记录
   * @param {IChatMessage} message
   * @param {boolean} [isuser=false]
   * @memberof AiChatController
   */
  async deleteMessage(message: IChatMessage): Promise<void> {
    const i = this.messages.value.findIndex(
      item => item.messageid === message.messageid,
    );
    if (i !== -1) {
      this.messages.value.splice(i, 1);
      this.messages.value = [...this.messages.value];
    }
    this.asyncToIndexDB();
    // 远程模式删除消息
    if (this.resourceMode === 'REMOTE' && this.resourceOptions) {
      if (message.realmessageid) {
        await this.resourceOptions.deleteMessage(message.realmessageid);
      }
    }
    if (this.opts.action) {
      this.opts.action('deletemsg', message);
    }
  }

  /**
   * 刷新当前消息
   *
   * @memberof AiChatController
   */
  async refreshMessage(message: IChatMessage, isuser: boolean = false) {
    this.isLoading.value = true;
    try {
      const i = this.messages.value.findIndex(
        item => item.messageid === message.messageid,
      );

      if (isuser) {
        // 更正用户状态
        if (message.state === 40) {
          const tempMessage: IChatMessage = {
            ...(message as ChatMessage)._origin,
            state: 30,
          };
          this.replaceMessage(tempMessage, false);
        }
        this.messages.value.splice(i + 1, this.messages.value.length - i - 1);
        this.messages.value = [...this.messages.value];
        await this.opts.question(
          this,
          this.context,
          this.params,
          { appDataEntityId: this.appDataEntityId },
          this.getMessages(),
          this.chatSessionid,
          this.activeAIAgentID,
          this.chatMode,
          this.getQueryKnowledgeBases(),
          this.getQueryRecallConfig(),
        );
      } else if (i === this.messages.value.length - 1) {
        this.messages.value.pop();
        this.messages.value = [...this.messages.value];
        await this.opts.question(
          this,
          this.context,
          this.params,
          { appDataEntityId: this.appDataEntityId },
          this.getMessages(),
          this.chatSessionid,
          this.activeAIAgentID,
          this.chatMode,
          this.getQueryKnowledgeBases(),
          this.getQueryRecallConfig(),
        );
      } else {
        const lastques = this.messages.value[i - 1].content;
        this.messages.value.splice(i - 1, 2);
        this.question(lastques);
      }
      this.asyncToIndexDB();
      if (this.opts.action) {
        this.opts.action('refreshmsg', message);
      }
    } finally {
      this.isLoading.value = false;
    }
  }

  /**
   * 复制消息
   *
   * @param {IChatMessage} message
   * @memberof AiChatController
   */
  copyMessage(message: IChatMessage) {
    const text = message.realcontent;
    TextUtil.copy(text!);
    if (this.opts.action) {
      this.opts.action('copymsg', message);
    }
  }

  /**
   * 重置对话（清空当前对话、查询历史）
   * @returns
   */
  async resetTopic(): Promise<boolean> {
    let result: boolean = true;
    // 清空对话
    result = await this.clearTopic();
    if (!result) return result;

    // 获取历史记录
    await this.fecthHistory();
    return result;
  }

  /**
   * 清空对话
   * @returns
   */
  async clearTopic(): Promise<boolean> {
    let result: boolean = true;
    // 中断请求
    await this.abortQuestion();
    // 清除缓存
    if (this.topicId) {
      // 禁用存储不做处理
      if (this.topicId && this.aiTopic) {
        if (this.currentTopicDisableStorage) {
          result = true;
        } else if (this.resourceMode === 'LOCAL') {
          result = await IndexedDBUtil.deleteData(
            AIChatConst.DATA_BASE_NAME,
            AIChatConst.DATA_TABLE_NAME,
            this.getHistoryStoreKey(this.topicId),
          );
        } else if (this.resourceMode === 'REMOTE') {
          // 存在话题，清空会话，若不存在话题，需通过sessionid查询会话，存存在会话，则清空会话
          result = await this.aiTopic.clearMessagesByTopicId(this.topicId);
        }
      }
    } else if (this.resourceMode === 'REMOTE' && this.resourceOptions) {
      const queryList = await this.resourceOptions.getSessionList({
        n_session_id_eq: this.chatSessionid,
      });
      if (queryList && queryList.length > 0) {
        result = await this.resourceOptions.clearAllMessageBySessionId(
          queryList[0].realid,
        );
      }
    }
    if (!result) return result;
    // 清空消息
    this.messages.value = [];
    return result;
  }

  /**
   * 新增素材资源
   *
   * @author tony001
   * @date 2025-02-27 18:02:00
   * @param {IMaterial} data
   */
  addMaterial(data: IMaterial): void {
    const chatMaterial = this.materials.value.find(item => item.id === data.id);
    if (chatMaterial) {
      this.materials.value = [...this.materials.value];
    } else {
      this.materials.value = [...this.materials.value, new ChatMaterial(data)];
    }
  }

  /**
   * 替换素材资源
   *
   * @author tony001
   * @date 2025-02-28 15:02:24
   * @param {string} id
   * @param {IMaterial} data
   */
  replaceMaterial(id: string, data: IMaterial): void {
    const i = this.materials.value.findIndex(item => item.id === id);
    if (i !== -1) {
      this.materials.value[i] = new ChatMaterial(data);
      this.materials.value = [...this.materials.value];
    } else {
      this.materials.value = [...this.materials.value, new ChatMaterial(data)];
    }
  }

  /**
   * 删除指定素材资源
   *
   * @author tony001
   * @date 2025-02-27 18:02:33
   * @param {IMaterial} data
   */
  deleteMaterial(data: IMaterial): void {
    const i = this.materials.value.findIndex(item => item.id === data.id);
    if (i !== -1) {
      this.materials.value.splice(i, 1);
      this.materials.value = [...this.materials.value];
    }
  }

  /**
   * 更新指定消息推荐提示
   *
   * @author tony001
   * @date 2025-03-19 11:03:47
   * @param {IChatMessage} data
   * @param {string} suggestionStr
   */
  updateRecommendPrompt(data: IChatMessage, suggestionStr: string): void {
    if (!suggestionStr) return;
    const i = this.messages.value.findIndex(
      item => item.messageid === data.messageid,
    );
    const { suggestions } =
      ChatSuggestionParser.parseMixedContent(suggestionStr);
    if (suggestions && suggestions.length > 0) {
      data.suggestions = suggestions;
      if (i !== -1) {
        this.messages.value[i] = new ChatMessage(data);
        this.messages.value = [...this.messages.value];
      } else {
        this.messages.value = [...this.messages.value, new ChatMessage(data)];
      }
      this.asyncToIndexDB();
    }
  }

  /**
   * 清空界面操作，包含当前消息的界面行为、推荐提示
   *
   * @param message
   */
  async clearUIActions(message: IChatMessage): Promise<void> {
    const i = this.messages.value.findIndex(
      item => item.messageid === message.messageid,
    );
    if (i !== -1) {
      // 清除推荐
      const messageOrigin = this.messages.value[i]._origin;
      messageOrigin.suggestions = undefined;
      this.messages.value[i].replace(messageOrigin);
      this.messages.value = [...this.messages.value];
    }
    // 存储到前端缓存
    this.asyncToIndexDB();
  }

  /**
   * 处理建议点击
   *
   * @author tony001
   * @date 2025-03-19 12:03:25
   * @param {IChatMessage} message
   * @param {IChatSuggestion} suggestion
   * @param {MouseEvent} event
   * @return {*}  {Promise<void>}
   */
  async handleSuggestionClick(
    message: IChatMessage,
    suggestion: IChatSuggestion,
    event: MouseEvent,
  ): Promise<void> {
    await this.clearUIActions(message);
    // 执行具体建议逻辑
    const { type, metadata } = suggestion;
    switch (type) {
      case 'action':
        if (this.opts.extendToolbarClick) {
          const actionID = (suggestion.data as any).actionid;
          const appId = (suggestion.data as any).appid;
          if (!actionID) {
            throw new Error('actionid不能为空');
          }
          this.addMessage({
            messageid: createUUID(),
            state: 30,
            type: 'DEFAULT',
            role: 'USER',
            content: (metadata as any).content_name,
            status: 'sent',
          });
          // 组装传出数据（和消息头传出去的格式保持一致）
          const tempData: any = { ...message };
          Object.assign(tempData, { topic: this.topic });
          tempData.msg.realcontent = message.realcontent;
          // 准备上下文数据
          const tempContext = { ...this.context };
          if ((metadata as any).action_context) {
            try {
              const contextPairs = (metadata as any).action_context.split(';');
              const expandContext = contextPairs.reduce(
                (acc: Record<string, string>, pair: string) => {
                  if (pair.trim()) {
                    const [key, value] = pair.split(':');
                    if (key && value) {
                      acc[key.trim()] = value.trim();
                    }
                  }
                  return acc;
                },
                {},
              );
              if (expandContext && Object.keys(expandContext).length > 0) {
                Object.assign(tempContext, { ...expandContext });
              }
            } catch (error) {
              throw new Error(
                'action_context参数解析异常，正确格式如:abc:123;cde:456',
              );
            }
          }
          const result: any = await this.opts.extendToolbarClick(
            event,
            {
              id: actionID,
              // 是否是插件应用(建议里面定义appid认为是插件应用的界面行为)
              isPluginApp: !!appId,
              appId: appId || (this.context as any).srfappid,
            },
            tempContext,
            this.params,
            tempData,
          );
          const newMessage = result?.data?.[0];
          if (newMessage && newMessage.content)
            this.addMessage({
              messageid: createUUID(),
              state: 30,
              type: newMessage.type || 'DEFAULT',
              role: newMessage.role || 'ASSISTANT',
              content: newMessage.content,
              status: 'sent',
            });
        }
        break;
      case 'raw':
        await this.question((suggestion.data as any).content);
        break;
      default:
        throw new Error(`不支持${type}推荐类型`);
    }
  }

  /**
   * 处理用户点击界面行为
   * @param message
   * @param uiAction
   * @param event
   */
  async handleUIActionClick(
    message: IChatMessage,
    uiAction: IChatUIAction,
    event: MouseEvent,
  ): Promise<void> {
    await this.clearUIActions(message);
    const { type, data, metadata } = uiAction;
    switch (type) {
      case 'action':
        if (this.opts.extendToolbarClick) {
          const actionID = (data as any).actionid;
          const appId = (data as any).appid;
          if (!actionID) {
            throw new Error('actionid不能为空');
          }
          // this.addMessage({
          //   messageid: createUUID(),
          //   state: 30,
          //   type: 'DEFAULT',
          //   role: 'USER',
          //   content: (metadata as any).content_name,
          //   status: 'sent',
          // });
          // 组装传出数据（和消息头传出去的格式保持一致）
          const tempData: any = { ...message };
          Object.assign(tempData, { topic: this.topic });
          tempData.msg.realcontent = message.realcontent;
          // 准备上下文数据
          const tempContext = { ...this.context };
          if ((metadata as any).action_context) {
            try {
              const contextPairs = (metadata as any).action_context.split(';');
              const expandContext = contextPairs.reduce(
                (acc: Record<string, string>, pair: string) => {
                  if (pair.trim()) {
                    const [key, value] = pair.split(':');
                    if (key && value) {
                      acc[key.trim()] = value.trim();
                    }
                  }
                  return acc;
                },
                {},
              );
              if (expandContext && Object.keys(expandContext).length > 0) {
                Object.assign(tempContext, { ...expandContext });
              }
            } catch (error) {
              throw new Error(
                'action_context参数解析异常，正确格式如:abc:123;cde:456',
              );
            }
          }
          const result: any = await this.opts.extendToolbarClick(
            event,
            {
              id: actionID,
              // 是否是插件应用(建议里面定义appid认为是插件应用的界面行为)
              isPluginApp: !!appId,
              appId: appId || (this.context as any).srfappid,
            },
            tempContext,
            this.params,
            tempData,
          );
          const newMessage = result?.data?.[0];
          if (newMessage && newMessage.content)
            this.addMessage({
              messageid: createUUID(),
              state: 30,
              type: newMessage.type || 'DEFAULT',
              role: newMessage.role || 'ASSISTANT',
              content: newMessage.content,
              status: 'sent',
            });
        }
        break;
      case 'raw':
        await this.question((data as any).content);
        break;
      default:
        throw new Error(`不支持${type}推荐类型`);
    }
  }

  /**
   * 设置当前激活的AI助手ID
   * @param agentID
   */
  public async setActiveAIAgentID(agentID: string): Promise<void> {
    if (this.activeAIAgentID === agentID) return;
    this.activeAIAgentID = agentID;
    if (this.topicId && this.aiTopic) {
      this.aiTopic.updateTopicChatByID(this.topicId, {
        activeAIAgentID: agentID,
      });
    }
    // 切换智能体时重置召回配置（启用设置召回参数）
    if (this.enableRecallConfigSetting.value) {
      const agent = this.agentList.value.find(
        a => a.id === this.activeAIAgentID,
      );
      if (agent)
        this.reCallConfig.value = {
          chunkrerank: agent.rerank,
          maxchunks: agent.maxchunks,
          chunkthreshold: agent.chunkthreshold,
        };
    }
    // 切换智能体时计算选中知识库（启用选择知识库）
    if (this.enableKnowledgeBaseSelect.value) {
      this.computeSelectedKnowledge();
    }
  }

  /**
   * 设置智能体配置
   * @param config
   */
  public setAIAgentConfig(config: Record<string, any>): void {
    this.reCallConfig.value = { ...this.reCallConfig.value, ...config };
  }

  /**
   * 搜索AI智能体
   * @param query
   * @returns
   */
  public async searchAIAgent(query: string): Promise<AIAgent[]> {
    let agents: AIAgent[] = [];
    if (this.opts.fetchAgentList) {
      const list = (await this.opts.fetchAgentList(query)) || [];
      agents = list.map(
        item =>
          new AIAgent(item, {
            chunkrerank: this.opts.reRankDefaultValue,
            maxchunks: this.opts.maxChunksDefaultValue,
            chunkthreshold: this.opts.chunkThresholdDefaultValue,
          }),
      );
    } else {
      agents = this.agentList.value;
    }
    return agents;
  }

  /**
   * 设置选中知识库
   * @param ids
   */
  public setSelectionKnowledge(ids: string[]): void {
    this.selectionKnowledgeBases.value = [...ids];
  }

  /**
   * 更新当前话题标题
   */
  public async updateTopicCaption(): Promise<void> {
    if (this.topicId && this.aiTopic) {
      const currentTopic = this.aiTopic.getCurrentTopicByID(this.topicId);
      if (currentTopic && currentTopic.captionComputed) {
        return;
      }
    }
    if (this.isDigestProcessed === true) return;
    const userMessage = this.messages.value.find(message => {
      return message.role === 'USER';
    });
    if (userMessage) {
      // 计算会话标题
      let targetCaption = '';
      if (this.sessionCaptionMode) {
        switch (this.sessionCaptionMode) {
          case 'snippet':
            const msgContent = userMessage.content;
            const { remainingText } =
              MaterialResourceParser.parseMixedContent(msgContent);
            targetCaption = remainingText.substring(0, 15);
            break;
          case 'summary':
            const suggestions = await this.opts.chatDigest(
              this.context,
              this.params,
              {
                appDataEntityId: this.appDataEntityId,
                message: {
                  messages: this.getMessages(),
                  sessionid: this.chatSessionid,
                  srfaiagent: this.activeAIAgentID,
                  mode: 'title',
                  maxtokens: this.opts.summaryMaxTokens || 30,
                },
              },
            );
            if (suggestions && (suggestions as any).content) {
              targetCaption = (suggestions as any).content;
            }
            break;
          default:
            targetCaption = this.sessionDefaultCaption;
            break;
        }
      }
      // 远程模式更新会话标题
      if (
        this.resourceMode === 'REMOTE' &&
        this.resourceOptions &&
        // 禁用存储不做处理
        !this.currentTopicDisableStorage
      ) {
        const queryList = await this.resourceOptions.getSessionList({
          n_session_id_eq: this.chatSessionid,
        });
        if (queryList && queryList.length > 0) {
          if (queryList[0].caption !== targetCaption) {
            await this.resourceOptions.updateSession(queryList[0].realid, {
              caption: targetCaption,
            });
          }
        }
      }
      // 更新话题标题
      if (this.topicId && this.aiTopic) {
        this.aiTopic.updateTopicCaption(this.topicId, targetCaption);
      }
      this.isDigestProcessed = true;
    }
  }

  /**
   * @description 消息点赞
   * @param {IChatMessage} message
   * @returns {*}  {Promise<void>}
   * @memberof AiChatController
   */
  async messageLike(message: IChatMessage): Promise<void> {
    const state = message.islike === '1';
    const messageID = message.realmessageid;
    if (!messageID || !this.resourceOptions) return;
    const result = state
      ? await this.resourceOptions.cancelFeedback(messageID)
      : await this.resourceOptions.likeMessage(messageID);
    if (result) {
      message.islike = state ? '0' : '1';
      // 点赞/点踩互斥
      if (!state && message.isdislike === '1') message.isdislike = '0';
      this.replaceMessage(message, false);
    }
  }

  /**
   * @description 消息点踩
   * @param {IChatMessage} message
   * @returns {*}  {Promise<void>}
   * @memberof AiChatController
   */
  async messageDisLike(message: IChatMessage): Promise<void> {
    const state = message.isdislike === '1';
    const messageID = message.realmessageid;
    const feedbackContent = message.feedbackcontent;
    if (!messageID || !this.resourceOptions) return;
    const result = state
      ? await this.resourceOptions.cancelFeedback(messageID)
      : await this.resourceOptions.dislikeMessage(messageID, feedbackContent);
    if (result) {
      message.isdislike = state ? '0' : '1';
      // 点赞/点踩互斥
      if (!state && message.islike === '1') message.islike = '0';
      this.replaceMessage(message, false);
    }
  }

  /**
   * 处理预定义点击
   * @param type
   * @param url
   * @param message
   * @param event
   * @returns
   */
  async handlePredefinedClick(
    type: 'chunkview' | 'view' | 'action',
    url: string,
    message: IChatMessage,
    event: MouseEvent,
  ): Promise<void> {
    switch (type) {
      case 'chunkview':
        const chunkID = url.replace('chunkview://', '');
        if (!this.opts.chunkView) {
          console.error('文档分片查看界面不存在，请确认chunkView是否配置');
          return;
        }
        if (!this.opts.chunkEntity) {
          console.error('文档分片实体标识不存在，请确认chunkEntity是否配置');
          return;
        }
        const targetUrl = `view://${this.opts.chunkView}?srfnavctx={"${this.opts.chunkEntity}":"${chunkID}"}`;
        await this.handlePredefViewClick(targetUrl, message, event);
        break;
      case 'view':
        await this.handlePredefViewClick(url, message, event);
        break;
      case 'action':
        await this.handlePredefActionClick(url, message, event);
        break;
      default:
        break;
    }
  }

  /**
   * 处理预定义视图跳转点击
   * @param url
   * @param message
   * @param event
   * @returns
   */
  async handlePredefViewClick(
    url: string,
    message: IChatMessage,
    event: MouseEvent,
  ): Promise<void> {
    if (!this.opts.openLinkView) {
      return;
    }
    await this.opts.openLinkView(url, message, event);
  }

  /**
   * 处理预定义界面行为点击
   * @param url
   * @param message
   * @param event
   * @returns
   */
  async handlePredefActionClick(
    url: string,
    message: IChatMessage,
    event: MouseEvent,
  ): Promise<void> {
    if (!this.opts.extendToolbarClick) return;
    const { typeId, context, params } = parsePredefProtocol(url);
    const actionID = typeId;
    const appId = context.appid;
    if (!actionID) {
      throw new Error('actionid不能为空');
    }
    // 组装传出数据（和消息头传出去的格式保持一致）
    const tempData: any = { ...message };
    Object.assign(tempData, { topic: this.topic });
    tempData.msg.realcontent = message.realcontent;
    // 准备上下文数据
    const tempContext = { ...this.context };
    if (context && Object.keys(context).length > 0) {
      Object.assign(tempContext, { ...context });
    }
    // 准备视图参数
    const tempParams = { ...this.params };
    if (params && Object.keys(params).length > 0) {
      Object.assign(tempParams, { ...params });
    }
    const result: any = await this.opts.extendToolbarClick(
      event,
      {
        id: actionID,
        // 是否是插件应用(建议里面定义appid认为是插件应用的界面行为)
        isPluginApp: !!appId,
        appId: appId || (this.context as any).srfappid,
      },
      tempContext,
      tempParams,
      tempData,
    );
    const newMessage = result?.data?.[0];
    if (newMessage && newMessage.content)
      this.addMessage({
        messageid: createUUID(),
        state: 30,
        type: newMessage.type || 'DEFAULT',
        role: newMessage.role || 'ASSISTANT',
        content: newMessage.content,
        status: 'sent',
      });
  }

  /**
   * 销毁
   *
   * @return {*}  {Promise<void>}
   * @memberof AiChatController
   */
  async destroyed(): Promise<void> {
    this.evt.reset();
  }
}
