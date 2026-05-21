/* eslint-disable vue/no-dupe-keys */
/* eslint-disable camelcase */
import { computed, defineComponent, PropType } from 'vue';
import { IInternalMessage, showTitle } from '@ibiz-template/core';
import { useNamespace } from '@ibiz-template/vue3-util';
import { IInternalMessageProvider } from '@ibiz-template/runtime';
import './internal-message-container.scss';

export type ToolbarItem = {
  /**
   * 提示文本信息
   * @author lxm
   * @date 2024-01-30 03:27:33
   * @type {string}
   */
  tooltip: string;
  /**
   * 图标名称
   * @author lxm
   * @date 2024-01-30 03:27:23
   * @type {string}
   */
  icon: string;
  /**
   * 唯一标识
   * @author lxm
   * @date 2024-01-30 03:27:16
   * @type {string}
   */
  key: string;
};

export const InternalMessageContainer = defineComponent({
  name: 'IBizInternalMessageContainer',
  props: {
    message: {
      type: Object as PropType<IInternalMessage>,
      required: true,
    },
    provider: {
      type: Object as PropType<IInternalMessageProvider>,
      required: true,
    },
    clickable: {
      type: Boolean,
      default: undefined,
    },
    isUnread: {
      type: Boolean,
      default: true,
    },
    toolbarItems: {
      type: Array<ToolbarItem>,
      default: () => [] as ToolbarItem[],
    },
  },
  emits: {
    toolbarClick: (_key: string) => true,
    close: () => true,
    read: () => true,
  },
  setup(props, { emit }) {
    const ns = useNamespace('internal-message-container');

    const isUnread = computed(() => {
      return props.isUnread && props.message.status === 'RECEIVED';
    });

    const finalToolbarItems = computed(() => {
      const toolbarItems = [...props.toolbarItems];
      if (isUnread.value) {
        toolbarItems.push({
          key: 'read',
          icon: 'checkmark-done-outline',
          tooltip: ibiz.i18n.t(
            'panelComponent.userMessage.internalMessageContainer.markAsRead',
          ),
        });
      }
      return toolbarItems;
    });

    const onToolbarClick = (event: MouseEvent, key: string) => {
      event.stopPropagation();
      if (key === 'read') {
        emit('read');
      } else {
        emit('toolbarClick', key);
      }
    };

    const isClickable = computed(() => {
      if (props.clickable === undefined) {
        return ibiz.env.isMob
          ? !!props.message.mobile_url
          : !!props.message.url;
      }
      return props.clickable;
    });

    const onClick = async (event: MouseEvent) => {
      // 标记事件必须在关闭之后
      if (isClickable.value && props.provider.onClick) {
        const isClose = await props.provider.onClick(props.message, event);
        if (isClose) emit('close');
      }
      emit('read');
    };

    return {
      ns,
      isUnread,
      isClickable,
      finalToolbarItems,
      onClick,
      onToolbarClick,
    };
  },
  render() {
    return (
      <div
        class={[
          this.ns.b(),
          this.isClickable ? this.ns.m('clickable') : '',
          this.isUnread ? this.ns.m('unread') : '',
        ]}
        onClick={this.onClick}
      >
        {this.$slots.default?.()}
        <div class={this.ns.b('toolbar')}>
          {this.finalToolbarItems.map(item => {
            return (
              <iBizIcon
                class={this.ns.be('toolbar', 'button')}
                icon={{
                  imagePath: 'svg/read.svg',
                }}
                baseDir='iconfont'
                title={showTitle(item.tooltip)}
                onClick={(e: MouseEvent) => this.onToolbarClick(e, item.key)}
              />
            );
          })}
        </div>
        <div class={this.ns.e('unread-tag')}></div>
        {this.isClickable && (
          <svg
            class={this.ns.e('click-tag')}
            viewBox='0 0 1024 1024'
            version='1.1'
            xmlns='http://www.w3.org/2000/svg'
            p-id='1618'
            width='14'
            height='14'
            fill='currentColor'
          >
            <path
              d='M256 258.133333c0-21.333333 14.933333-38.4 34.133333-42.666666H765.866667c23.466667 0 42.666667 19.2 42.666666 42.666666L810.666667 725.333333c0 10.666667-4.266667 21.333333-12.8 29.866667-8.533333 8.533333-19.2 12.8-29.866667 12.8-10.666667 0-21.333333-4.266667-29.866667-12.8-8.533333-8.533333-12.8-19.2-12.8-29.866667V360.533333L288 795.733333c-17.066667 17.066667-42.666667 17.066667-59.733333 0-17.066667-17.066667-17.066667-42.666667 0-59.733333l435.2-435.2H298.666667c-21.333333 0-38.4-14.933333-42.666667-34.133333v-8.533334z'
              p-id='1619'
            ></path>
          </svg>
        )}
      </div>
    );
  },
});
