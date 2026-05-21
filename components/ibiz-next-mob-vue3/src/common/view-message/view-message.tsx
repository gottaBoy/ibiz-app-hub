import { PropType, defineComponent, ref, watch } from 'vue';
import { IViewMessage, ViewMsgController } from '@ibiz-template/runtime';
import { useNamespace } from '@ibiz-template/vue3-util';
import { createUUID } from 'qx-util';
import './view-message.scss';

export const ViewMessage = defineComponent({
  name: 'ViewMessage',
  props: {
    messages: {
      type: Array<IViewMessage>,
    },
    scroll: {
      type: Boolean,
      default: false,
    },
    context: {
      type: Object as PropType<IContext>,
      required: false,
    },
    params: {
      type: Object as PropType<IParams>,
      required: false,
    },
    controller: {
      type: Object as PropType<ViewMsgController>,
    },
  },
  setup(props) {
    const ns = useNamespace('view-message');

    // 消息类型映射
    const getTypeIcon = (messageType?: string): string => {
      switch (messageType) {
        case 'WARN':
          return 'warning-o';
        case 'ERROR':
          return 'close';
        default:
          return 'info-o';
      }
    };

    // 消息列表
    const items = ref<(IViewMessage & { hidden?: boolean })[]>([]);

    // 默认展示信息索引
    const initialIndex = ref(0);

    // 横向滚动容器唯一标识
    const uuid = ref('');

    // 是否隐藏消息容器
    const isHiddenContainer = ref(false);

    watch(
      () => props.messages,
      () => {
        initialIndex.value = 0;
        uuid.value = createUUID();
        if (Array.isArray(props.messages)) {
          items.value = props.messages
            .filter(
              item =>
                item.title || item.message || (item.layoutPanel && item.data),
            )
            .map(item => {
              return { ...item };
            });
          isHiddenContainer.value = false;
        } else {
          items.value = [];
          isHiddenContainer.value = true;
        }
      },
      { immediate: true },
    );

    const container = ref<HTMLElement | null>(null);

    // 横向滚动容器高度
    const carouselHeight = ref('');

    // 处理消息关闭事件
    const handleAlertClose = (index: number) => {
      // 关闭对应的消息
      items.value[index].hidden = true;
      // 所有消息关闭后，隐藏横向滚动容器
      const isHiddenCarouse = items.value.every(item => item.hidden);
      if (isHiddenCarouse) {
        isHiddenContainer.value = true;
      }
      uuid.value = createUUID();
      const item = items.value[index];
      props.controller?.setMsgRemoveModeStorage(item);
    };

    // 处理激活消息索引变化事件
    const handleChange = (index: number) => {
      initialIndex.value = index;
    };

    return {
      ns,
      getTypeIcon,
      items,
      container,
      carouselHeight,
      initialIndex,
      uuid,
      isHiddenContainer,
      handleAlertClose,
      handleChange,
    };
  },
  render() {
    // 绘制布局面板
    const renderLayoutPanel = (item: IViewMessage) => {
      return (
        <iBizControlShell
          data={item.data}
          modelData={item.layoutPanel}
          context={this.context}
          params={this.params}
        ></iBizControlShell>
      );
    };

    // 平铺展示消息
    const renderMessages = () => {
      return (
        <div
          class={[this.ns.b(), this.isHiddenContainer && this.ns.m('hidden')]}
        >
          {this.items.map((item: IViewMessage, index: number) => {
            return (
              <van-notice-bar
                class={[this.ns.b('item'), item.sysCss?.cssName]}
                type={item.messageType?.toLowerCase()}
                wrapable={!this.scroll}
                scrollable={this.scroll}
                mode={item.removeMode !== 0 ? 'closeable' : ''}
                left-icon={this.getTypeIcon(item.messageType)}
                onClose={() => {
                  this.handleAlertClose(index);
                }}
                onChange={this.handleChange}
              >
                {item.layoutPanel && item.data ? (
                  renderLayoutPanel(item)
                ) : (
                  <div
                    class={this.ns.be('alert', 'message')}
                    v-html={item.message || ''}
                  ></div>
                )}
              </van-notice-bar>
            );
          })}
        </div>
      );
    };

    if (!this.items.length) {
      return;
    }

    return renderMessages();
  },
});
