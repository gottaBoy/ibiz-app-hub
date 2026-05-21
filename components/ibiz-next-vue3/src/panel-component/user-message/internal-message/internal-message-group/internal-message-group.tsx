/* eslint-disable camelcase */
import { computed, defineComponent, PropType, ref } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import { IInternalMessage, showTitle } from '@ibiz-template/core';
import {
  IInternalMessageProvider,
  getInternalMessageProvider,
} from '@ibiz-template/runtime';
import { parseHtml } from '../../../../util';
import './internal-message-group.scss';

export const InternalMessagGroup = defineComponent({
  name: 'IBizInternalMessageGroup',
  props: {
    message: {
      type: Object as PropType<
        IInternalMessage & { children?: IInternalMessage[] }
      >,
      required: true,
    },
    provider: {
      type: Object as PropType<IInternalMessageProvider>,
      required: true,
    },
  },
  emits: {
    close: (_msg?: IInternalMessage) => true,
    read: (_msg: IInternalMessage) => true,
  },
  setup(props, { emit }) {
    const ns = useNamespace('internal-message-group');

    /**
     * 展开状态
     */
    const isExpand = ref(false);

    /**
     * @description 展开改变
     */
    const onExpandChange = (): void => {
      isExpand.value = !isExpand.value;
    };

    /**
     * 内容
     */
    const html = computed(() => {
      const { content_type, content } = props.message;
      if (content_type === 'JSON')
        return content ? (JSON.parse(content).html as string) : content;
      if (content === 'HTML') return parseHtml(content);
      return content;
    });

    /**
     * @description 关闭
     */
    const onClose = (msg?: IInternalMessage): void => {
      emit('close', msg);
    };

    /**
     * @description 标记
     */
    const onRead = (msg: IInternalMessage): void => {
      emit('read', msg);
    };

    /**
     * @description 项点击
     * @param {MouseEvent} event
     */
    const onClick = async (event: MouseEvent): Promise<void> => {
      // 分组必须能点击打开才标记已读
      if (props.provider.onClick) {
        const isClose = await props.provider.onClick(props.message, event);
        if (isClose) onClose();
      }
    };

    return {
      ns,
      html,
      isExpand,
      onRead,
      onClose,
      onClick,
      onExpandChange,
    };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('content')}>
          <div
            v-html={this.html}
            onClick={this.onClick}
            class={this.ns.em('content', 'html')}
          ></div>
          <div class={this.ns.e('action')}>
            <ion-icon
              class={this.ns.em('action', 'item')}
              title={showTitle(
                this.isExpand
                  ? ibiz.i18n.t(
                      'panelComponent.userMessage.internalMessageGroup.collapse',
                    )
                  : ibiz.i18n.t(
                      'panelComponent.userMessage.internalMessageGroup.expand',
                    ),
              )}
              name={
                this.isExpand
                  ? 'chevron-down-outline'
                  : 'chevron-forward-outline'
              }
              onClick={this.onExpandChange}
            ></ion-icon>
            <iBizBadge
              class={this.ns.e('badge')}
              value={this.message.children?.length}
            />
            <iBizIcon
              baseDir='iconfont'
              icon={{
                imagePath: 'svg/read.svg',
              }}
              class={[
                this.ns.em('action', 'item'),
                this.ns.em('action', 'read'),
              ]}
              title={showTitle(
                ibiz.i18n.t(
                  'panelComponent.userMessage.internalMessageContainer.markAsRead',
                ),
              )}
              onClick={() => this.onRead(this.message)}
            />
          </div>
        </div>
        {this.isExpand && (
          <div class={this.ns.e('children')}>
            {this.message.children?.map(msg => {
              let provider: IInternalMessageProvider | undefined;
              try {
                provider = getInternalMessageProvider(msg);
              } catch (error) {
                ibiz.log.error(error);
              }
              if (provider)
                return provider.render({
                  message: msg,
                  class: this.ns.em('children', 'item'),
                  onClose: () => this.onClose(msg),
                  onRead: () => this.onRead(msg),
                });
              return (
                <div class={this.ns.em('children', 'item')}>
                  {ibiz.i18n.t(
                    'panelComponent.userMessage.internalMessageTab.noSupportType',
                    { type: msg.content_type },
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  },
});
