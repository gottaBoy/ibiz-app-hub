/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {
  defineComponent,
  onActivated,
  onDeactivated,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  VNode,
  watch,
} from 'vue';
import {
  getInternalMessageProvider,
  IInternalMessageProvider,
} from '@ibiz-template/runtime';
import { getRawProps, useNamespace } from '@ibiz-template/vue3-util';
import {
  clone,
  IInternalMessage,
  IPortalMessage,
  showTitle,
} from '@ibiz-template/core';
import { MobUserMessageController } from './user-message.controller';
import './user-message.scss';
import { InternalMessageDefaultProvider } from './common';

/**
 * 用户消息
 * @primary
 * @description 用户消息组件，用于显示网站内关于用户的通知消息。
 */
export const MobUserMessage = defineComponent({
  name: 'MobUserMessage',
  props: getRawProps<MobUserMessageController>(),
  setup() {
    const ns = useNamespace('user-message');
    const noticeController = ibiz.hub.notice;
    noticeController.internalMessage.ns = ns;
    noticeController.internalMessage.provider =
      new InternalMessageDefaultProvider();
    const c = noticeController.internalMessage;

    // 当前分页
    const activeTab = ref('');

    const unreadOnlyTag = `${ibiz.appData?.context.srfsystemid}-unreadOnly`;

    // 是否显示消息列表
    const isActive = ref(true);
    const hasNotice = ref(false);

    const refresh = () => {
      if (isActive.value && hasNotice.value) {
        c.load();
        c.refreshUnreadCount();
        hasNotice.value = false;
      }
    };

    ibiz.mc.command.internalMessage.on(async (msg: IPortalMessage) => {
      ibiz.log.debug('mqtt internalMessage: ', msg);
      if (msg.subtype === 'INTERNALMESSAGE') {
        hasNotice.value = true;
        refresh();
      }
    });

    // 激活且存在变更时重新加载
    watch(
      () => isActive.value,
      () => {
        refresh();
      },
    );

    const allItems = ref<IInternalMessage[]>([]);
    const state = reactive({
      total: 0,
      pageSize: 0,
      unreadOnly: c.unreadOnly,
    });

    /**
     * 从控制器里更新数据
     * @author lxm
     * @date 2024-01-26 10:51:17
     */
    const updateData = () => {
      allItems.value = clone(c.messages);
      state.total = c.total;
      state.pageSize = c.size;
    };

    // 第一次计算数据
    updateData();
    const updateUnreadOnlyChange = (val: boolean) => {
      state.unreadOnly = val;
    };

    c.evt.on('dataChange', updateData);
    c.evt.on('unreadOnlyChange', updateUnreadOnlyChange);

    onUnmounted(() => {
      isActive.value = false;
      c.evt.off('dataChange', updateData);
      c.evt.off('unreadOnlyChange', updateUnreadOnlyChange);
    });

    const switchChange = (name: string) => {
      const bol = name === 'unread';
      c.toggleUnReadOnly(bol);
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

    const onBatchReadClick = () => {
      c.batchMarkRead();
    };

    const showMore = () => {
      c.loadMore();
    };

    onActivated(() => {
      isActive.value = true;
    });

    onDeactivated(() => {
      isActive.value = false;
    });

    onMounted(() => {
      initUnreadOnly();
      isActive.value = true;
      c.load();
    });

    const renderNoData = (): VNode => {
      // 未加载不显示无数据
      return (
        <iBizNoData
          class={ns.e('nodata')}
          text={ibiz.i18n.t(
            'panelComponent.userMessage.internalMessageTab.notificationYet',
          )}
        ></iBizNoData>
      );
    };

    const renderItems = () => {
      if (allItems.value.length === 0) {
        return renderNoData();
      }
      return allItems.value.map(msg => {
        let provider: IInternalMessageProvider | undefined;
        try {
          provider = getInternalMessageProvider(msg);
        } catch (error) {
          ibiz.log.error(error);
        }
        if (provider) {
          return provider.render({
            class: [ns.e('item')],
            message: msg,
          });
        }
        return (
          <div class={ns.e('item')}>
            {ibiz.i18n.t(
              'panelComponent.userMessage.internalMessageTab.noSupportType',
              { type: msg.content_type },
            )}
          </div>
        );
      });
    };

    return {
      ns,
      allItems,
      state,
      activeTab,
      showMore,
      renderItems,
      switchChange,
      onBatchReadClick,
    };
  },
  render() {
    const restLength = this.state.total - this.allItems.length;
    const loadmore =
      restLength > 0 ? (
        <div class={this.ns.e('load-more')} onClick={this.showMore}>
          {ibiz.i18n.t(
            'panelComponent.userMessage.internalMessageTab.loadMore',
            { length: restLength },
          )}
        </div>
      ) : null;

    return (
      <div class={[this.ns.b()]}>
        <iBizIcon
          class={this.ns.e('icons-read')}
          icon={{
            imagePath: 'svg/read.svg',
          }}
          baseDir='iconfont'
          title={showTitle(ibiz.i18n.t('panelComponent.userMessage.allRead'))}
          onClick={this.onBatchReadClick}
        />
        <van-tabs v-model:active={this.activeTab} onChange={this.switchChange}>
          <van-tab
            title={ibiz.i18n.t('panelComponent.userMessage.all')}
            name='all'
          >
            {{
              default: () => {
                return (
                  <div class={this.ns.e('content')}>
                    {this.renderItems()}
                    {loadmore}
                  </div>
                );
              },
            }}
          </van-tab>
          <van-tab
            title={ibiz.i18n.t('panelComponent.userMessage.unread')}
            name='unread'
          >
            {{
              default: () => {
                return (
                  <div class={this.ns.e('content')}>
                    {this.renderItems()}
                    {loadmore}
                  </div>
                );
              },
            }}
          </van-tab>
        </van-tabs>
      </div>
    );
  },
});
