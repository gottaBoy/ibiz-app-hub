import {
  ref,
  watch,
  reactive,
  PropType,
  onMounted,
  onUnmounted,
  defineComponent,
} from 'vue';
import dayjs from 'dayjs';
import { clone } from 'ramda';
import { useNamespace } from '@ibiz-template/vue3-util';
import {
  IInternalMessageProvider,
  getInternalMessageProvider,
  IInternalMessageController,
} from '@ibiz-template/runtime';
import { IInternalMessage, IPortalMessage } from '@ibiz-template/core';
import './internal-message-tab.scss';

export interface IMessage extends IInternalMessage {
  /**
   * @description 工作流消息是否启用链接
   * @type {boolean}
   * @memberof IMessage
   */
  enableLink?: boolean;
}

export const InternalMessageTab = defineComponent({
  name: 'IBizInternalMessageTab',
  props: {
    controller: {
      type: Object as PropType<IInternalMessageController>,
      required: true,
    },
    showPopover: {
      type: Boolean,
      required: true,
    },
  },
  emits: {
    hiddenPopover: () => true,
  },
  setup(props, { emit }) {
    const ns = useNamespace('internal-message-tab');

    /**
     * @description 关闭气泡
     */
    const hiddenPopover = (): void => {
      // 默认信息点击关闭
      emit('hiddenPopover');
    };

    /**
     * @description 标记已读
     * @param {(IInternalMessage & {
     *         children?: IInternalMessage[] | undefined;
     *       })} message
     * @returns {*}  {Promise<void>}
     */
    const onMarkRead = async (
      message: IInternalMessage & {
        children?: IInternalMessage[] | undefined;
      },
      filter?: IInternalMessage,
    ): Promise<void> => {
      if (message.children?.length) {
        // 如果是分组，标记分组下的所有消息
        await Promise.all(
          message.children
            .filter(child => child.id !== filter?.id)
            .map(child => ibiz.hub.notice.internalMessage.markRead(child)),
        );
      } else {
        await ibiz.hub.notice.internalMessage.markRead(message);
      }
    };

    /**
     * @description 分组关闭
     */
    const onGroupClose = async (
      message: IInternalMessage & {
        children?: IInternalMessage[] | undefined;
      },
      filter?: IInternalMessage,
    ): Promise<void> => {
      hiddenPopover();
      // 分组触发的关闭说明打开视图了，需标记所有的子项已读(排除触发关闭逻辑的消息)
      await onMarkRead(message, filter);
    };

    const c = props.controller;

    const unreadOnlyTag = `${ibiz.appData?.context.srfsystemid}-unreadOnly`;

    const hasNotice = ref(false);
    ibiz.mc.command.internalMessage.on(async (msg: IPortalMessage) => {
      ibiz.log.debug('mqtt internalMessage: ', msg);
      if (msg.subtype === 'INTERNALMESSAGE') {
        hasNotice.value = true;
      }
    });

    // 当通知过后，打开popover时重新加载
    watch(
      () => props.showPopover,
      newVal => {
        if (newVal && hasNotice.value) {
          c.load();
          c.refreshUnreadCount();
          hasNotice.value = false;
        }
      },
    );

    const allItems = ref<IMessage[]>([]);

    const messages = ref<
      (IMessage & {
        children?: IInternalMessage[];
      })[]
    >([]);

    const state = reactive({
      total: 0,
      pageSize: 0,
      unreadOnly: c.unreadOnly,
    });

    /**
     * @description 处理消息分组
     */
    const handleMessageGroup = (): void => {
      // 初始化分组对象和未分组数组
      const grouped: {
        [key: string]: (IMessage & {
          children?: IMessage[];
        })[];
      } = {};

      const ungrouped: IMessage[] = [];

      // 遍历数组进行分类
      allItems.value.forEach(item => {
        const url = ibiz.env.isMob ? item.mobile_url : item.url;
        const key = `${item.message_type}${url}`;

        // 检查是否应分组 (存在key，未读，非 TodoNotify 消息)
        const shouldGroup =
          key &&
          item.status === 'RECEIVED' &&
          item.message_type !== 'TodoNotify';

        if (shouldGroup) {
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push({ ...item });
        } else {
          ungrouped.push({ ...item });
        }
      });

      // 处理分组和未分组数据
      const finalResult = [...ungrouped];

      Object.values(grouped).forEach(group => {
        if (group.length === 1) {
          // 只有一个项目，直接加入结果
          finalResult.push({ ...group[0] });
        } else {
          // 多个项目，创建分组
          const parent = { ...group[0] };
          parent.children = group.map(item => ({ ...item }));
          finalResult.push(parent);
        }
      });

      // 返回合并结果
      finalResult.sort((a, b) => {
        return dayjs(a.update_time).isAfter(b.update_time) ? -1 : 1;
      });

      // 处理工作流消息是否启用链接
      const todoNotifySeen = new Set<string>();
      finalResult
        .filter(
          msg =>
            msg.message_type === 'TodoNotify' && msg.content_type === 'JSON',
        )
        .forEach(msg => {
          try {
            const data: IData = JSON.parse(msg.content);
            const key = `${data.bizkey}_${data.param02}`;
            if (data.todoid && !todoNotifySeen.has(key)) {
              msg.enableLink = true;
              todoNotifySeen.add(key);
            }
          } catch (error) {
            ibiz.log.error(error);
          }
        });
      messages.value = finalResult;
    };

    /**
     * 从控制器里更新数据
     * @author lxm
     * @date 2024-01-26 10:51:17
     */
    const updateData = () => {
      state.total = c.total;
      state.pageSize = c.size;
      allItems.value = clone(c.messages);
      handleMessageGroup();
    };

    // 第一次计算数据
    updateData();
    const updateUnreadOnlyChange = (val: boolean) => {
      state.unreadOnly = val;
    };

    c.evt.on('dataChange', updateData);
    c.evt.on('unreadOnlyChange', updateUnreadOnlyChange);

    onUnmounted(() => {
      c.evt.off('dataChange', updateData);
      c.evt.off('unreadOnlyChange', updateUnreadOnlyChange);
    });

    const showMore = () => {
      c.loadMore();
    };

    const switchChange = () => {
      c.toggleUnReadOnly();
      localStorage.setItem(unreadOnlyTag, c.unreadOnly.toString());
    };

    const initUnreadOnly = (): void => {
      const unreadOnlyStr = localStorage.getItem(unreadOnlyTag);
      if (unreadOnlyStr) {
        if (unreadOnlyStr === 'true') {
          state.unreadOnly = true;
          c.unreadOnly = true;
        } else {
          state.unreadOnly = false;
          c.unreadOnly = false;
        }
      }
    };

    onMounted(() => {
      initUnreadOnly();
      c.load();
    });

    return {
      ns,
      state,
      allItems,
      messages,
      showMore,
      onMarkRead,
      onGroupClose,
      switchChange,
      hiddenPopover,
    };
  },
  render() {
    const restLength = this.state.total - this.allItems.length;

    return (
      <div class={[this.ns.b()]}>
        <div class={this.ns.b('content')}>
          {this.allItems.length > 0 &&
            this.messages.map(msg => {
              let provider: IInternalMessageProvider | undefined;
              try {
                provider = getInternalMessageProvider(msg);
              } catch (error) {
                ibiz.log.error(error);
              }
              if (provider)
                return msg.children?.length ? (
                  <iBizInternalMessageGroup
                    message={msg}
                    provider={provider}
                    class={this.ns.e('group')}
                    onRead={this.onMarkRead}
                    onClose={(filter?: IInternalMessage) =>
                      this.onGroupClose(msg, filter)
                    }
                  />
                ) : (
                  provider.render({
                    message: msg,
                    class: this.ns.e('item'),
                    onClose: this.hiddenPopover,
                    onRead: () => this.onMarkRead(msg),
                  })
                );
              return (
                <div class={this.ns.e('item')}>
                  {ibiz.i18n.t(
                    'panelComponent.userMessage.internalMessageTab.noSupportType',
                    { type: msg.content_type },
                  )}
                </div>
              );
            })}
          {this.allItems.length === 0 && (
            <div class={this.ns.e('nodata')}>
              {ibiz.i18n.t(
                'panelComponent.userMessage.internalMessageTab.notificationYet',
              )}
            </div>
          )}
          {restLength > 0 && (
            <div class={this.ns.e('load-more')} onClick={this.showMore}>
              {ibiz.i18n.t(
                'panelComponent.userMessage.internalMessageTab.loadMore',
                { length: restLength },
              )}
            </div>
          )}
        </div>
        <div class={this.ns.b('footer')}>
          <el-switch
            value={this.state.unreadOnly}
            onChange={this.switchChange}
            class={this.ns.be('footer', 'switch')}
          />
          {ibiz.i18n.t(
            'panelComponent.userMessage.internalMessageTab.onlyShowUnread',
          )}
        </div>
      </div>
    );
  },
});
