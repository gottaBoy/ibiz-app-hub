/* eslint-disable @typescript-eslint/no-explicit-any */
import { Signal, signal } from '@preact/signals';
import { ChatMaterial, ChatMessage } from '../../entity';
import {
  IChatMessage,
  IChatOptions,
  IChatSuggestion,
  IMaterial,
  ITopic,
} from '../../interface';
import {
  ChatSuggestionParser,
  createUUID,
  generateHashWithText,
  IndexedDBUtil,
  MaterialResourceParser,
} from '../../utils';
import { TextUtil } from '../../utils/util/util';
import { AIChatConst } from '../../constants';

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
   * @description 聊天sessionid
   * @type {string}
   * @memberof AiChatController
   */
  chatSessionid: string = '';

  /**
   * 聊天窗触发提问回调
   *
   * @author tony001
   * @date 2025-02-24 14:02:51
   * @param {object} context
   * @param {object} params
   * @param {object} otherParams
   * @param {IChatMessage[]} question 提问历史内容(包含当前提问)
  * @return {*}  {Promise<boolean>} 等待回答

  /**
   * Creates an instance of AiChatController.
   *
   * @author chitanda
   * @date 2023-10-15 19:10:34
   * @param {IChatOptions} opts 聊天配置
   */
  constructor(readonly opts: IChatOptions) {
    this.context = opts.context;
    this.params = opts.params;
    this.appDataEntityId = opts.appDataEntityId;
    this.topicId = opts.topicId;
    this.topic = opts.topic;
    if (this.topicId) {
      this.chatSessionid = generateHashWithText(this.topicId);
    } else {
      this.chatSessionid = generateHashWithText(createUUID());
    }
    this.fecthHistory();
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
      const result: any = await IndexedDBUtil.getData(
        AIChatConst.DATA_BASE_NAME,
        AIChatConst.DATA_TABLE_NAME,
        this.topicId,
      );
      if (result && result.data && result.data.length > 0) {
        result.data.forEach((item: IChatMessage) => {
          const msg = {
            messageid: item.messageid,
            state: item.state,
            type: item.type,
            role: item.role,
            content: item.content,
            suggestions: item.suggestions,
            completed: true,
          } as const;
          this.addMessage(msg);
        });
        return true;
      }
    }
    const result = await this.opts.history(this.context, this.params, {
      appDataEntityId: this.appDataEntityId,
      appendCurData: this.opts.appendCurData,
      sessionid: this.chatSessionid,
    });
    // 存在附加内容，在请求历史记录后，需要附加当前编辑内容作为用户消息
    if (result && this.opts.appendCurContent) {
      this.addMessage({
        state: 30,
        messageid: createUUID(),
        role: 'USER',
        type: 'DEFAULT',
        content: this.opts.appendCurContent,
        completed: true,
      });
    }
    return true;
  }

  /**
   * 更新数据到indexdb
   *
   * @author tony001
   * @date 2025-02-24 18:02:41
   * @return {*}  {Promise<void>}
   */
  async asyncToIndexDB(): Promise<void> {
    if (!this.topicId) {
      return;
    }
    const data = {
      id: this.topicId,
      data: this.messages.value.map(item => item._origin),
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
      this.messages.value = [...this.messages.value, new ChatMessage(data)];
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
  }

  /**
   * 替换已经存在的聊天消息
   *
   * @author chitanda
   * @date 2023-10-16 22:10:49
   * @param {IChatMessage} data
   */
  replaceMessage(data: IChatMessage): void {
    const i = this.messages.value.findIndex(
      item => item.messageid === data.messageid,
    );
    if (i !== -1) {
      this.messages.value[i] = new ChatMessage(data);
      this.messages.value = [...this.messages.value];
    } else {
      this.messages.value = [...this.messages.value, new ChatMessage(data)];
    }
    this.asyncToIndexDB();
    // 响应成功且存在推荐提示回调，则获取推荐提示
    if (data.type === 'DEFAULT' && this.opts.recommendPrompt) {
      this.opts
        .recommendPrompt(this.context, this.params, {
          appDataEntityId: this.appDataEntityId,
          message: { messages: [data], sessionid: this.chatSessionid },
        })
        .then(suggestions => {
          if (suggestions && (suggestions as any).content) {
            this.updateRecommendPrompt(data, (suggestions as any).content);
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
    if (i !== -1) {
      const chatMsg = this.messages.value[i];
      data.content = chatMsg.content;
      this.messages.value[i] = new ChatMessage(data);
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
  public stringlyMaterialResource(): string {
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
      this.materials.value = [];
    }
    if (materialItems && materialItems.length > 0) {
      resources = MaterialResourceParser.stringify(materialItems);
    }
    return resources;
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
          this.messages.value[index] = new ChatMessage(messageOrigin);
        }
      });
      this.messages.value = [...this.messages.value];
      this.asyncToIndexDB();
      // 附加素材资源
      let inputText = this.stringlyMaterialResource();
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
      });
      // 提问
      await this.opts.question(
        this,
        this.context,
        this.params,
        { appDataEntityId: this.appDataEntityId },
        this.messages.value
          .filter(item => item.type !== 'ERROR')
          .map(item => item._origin),
        this.chatSessionid,
      );
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
      await this.opts.abortQuestion(this);
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
  deleteMessage(message: IChatMessage): void {
    const i = this.messages.value.findIndex(
      item => item.messageid === message.messageid,
    );
    if (i !== -1) {
      this.messages.value.splice(i, 1);
      this.messages.value = [...this.messages.value];
    }
    this.asyncToIndexDB();
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
        this.messages.value.splice(i + 1, this.messages.value.length - i - 1);
        this.messages.value = [...this.messages.value];
        await this.opts.question(
          this,
          this.context,
          this.params,
          { appDataEntityId: this.appDataEntityId },
          this.messages.value
            .filter(item => item.type !== 'ERROR')
            .map(item => item._origin),
          this.chatSessionid,
        );
      } else if (i === this.messages.value.length - 1) {
        this.messages.value.pop();
        this.messages.value = [...this.messages.value];
        await this.opts.question(
          this,
          this.context,
          this.params,
          { appDataEntityId: this.appDataEntityId },
          this.messages.value
            .filter(item => item.type !== 'ERROR')
            .map(item => item._origin),
          this.chatSessionid,
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
   * 重置对话
   *
   * @memberof AiChatController
   */
  async resetTopic() {
    // 中断请求
    await this.abortQuestion();
    // 清除缓存
    if (this.topicId) {
      await IndexedDBUtil.deleteData(
        AIChatConst.DATA_BASE_NAME,
        AIChatConst.DATA_TABLE_NAME,
        this.topicId,
      );
    }
    // 清空消息
    this.messages.value = [];
    // 获取历史记录
    this.opts.history(this.context, this.params, {
      appDataEntityId: this.appDataEntityId,
      appendCurData: this.opts.appendCurData,
      sessionid: this.chatSessionid,
    });
  }

  /**
   * 清空对话
   *
   * @author tony001
   * @date 2025-03-18 17:03:57
   */
  async clearTopic() {
    // 中断请求
    await this.abortQuestion();
    // 清除缓存
    if (this.topicId) {
      await IndexedDBUtil.deleteData(
        AIChatConst.DATA_BASE_NAME,
        AIChatConst.DATA_TABLE_NAME,
        this.topicId,
      );
    }
    // 清空消息
    this.messages.value = [];
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
    // 清除推荐
    const i = this.messages.value.findIndex(
      item => item.messageid === message.messageid,
    );
    if (i !== -1) {
      const messageOrigin = this.messages.value[i]._origin;
      messageOrigin.suggestions = undefined;
      this.messages.value[i] = new ChatMessage(messageOrigin);
      this.messages.value = [...this.messages.value];
    }
    // 存储到前端缓存
    this.asyncToIndexDB();
    // 执行具体建议逻辑
    const { type } = suggestion;
    switch (type) {
      case 'action':
        if (this.opts.extendToolbarClick) {
          const actionID = (suggestion.data as any).actionid;
          if (!actionID) {
            throw new Error('actionid不能为空');
          }
          // 组装传出数据（和消息头传出去的格式保持一致）
          const tempData: any = { ...message };
          Object.assign(tempData, { topic: this.topic });
          tempData.msg.realcontent = message.realcontent;

          await this.opts.extendToolbarClick(
            event,
            { id: actionID, appId: (this.context as any).srfappid },
            this.context,
            this.params,
            tempData,
          );
        }
        break;
      case 'raw':
        await this.question((suggestion.data as any).content);
        break;
      default:
        throw new Error(`不支持${type}推荐类型`);
    }
  }
}
