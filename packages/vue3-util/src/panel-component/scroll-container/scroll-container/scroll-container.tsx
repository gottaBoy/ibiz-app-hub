/* eslint-disable no-restricted-syntax */
import { IPanelContainer } from '@ibiz/model-core';
import { computed, defineComponent, PropType, VNode } from 'vue';
import { useNamespace } from '../../../use';
import { ScrollContainerController } from './scroll-container.controller';
import './scroll-container.scss';

/**
 * 滚动容器
 * @primary
 * @description 撑满父容器，并为内部元素提供超出滚动效果，可配置上下左右元素。
 */
export const ScrollContainer = defineComponent({
  name: 'IBizScrollContainer',
  props: {
    /**
     * @description 滚动容器模型
     */
    modelData: {
      type: Object as PropType<IPanelContainer>,
      required: true,
    },
    /**
     * @description 滚动容器控制器
     */
    controller: {
      type: ScrollContainerController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('scroll-container');
    const { id } = props.modelData;

    // 类名控制
    const classArr = computed(() => {
      const result: Array<string | false> = [
        ns.b(),
        ns.m(id),
        ...props.controller.containerClass,
        ns.is('hidden', !props.controller.state.visible),
      ];
      return result;
    });

    return { ns, classArr };
  },
  render() {
    let left: VNode | null = null;
    let top: VNode | null = null;
    let right: VNode | null = null;
    let bottom: VNode | null = null;
    let center: VNode | null = null;

    const slotStylle: IData = {};

    // 内容区默认插槽处理,处理滚动容器项
    const defaultSlots: VNode[] = this.$slots.default?.() || [];
    defaultSlots.forEach(slot => {
      const props = slot.props as IData;
      if (!props || !props.controller) {
        return;
      }

      const { width, height } = props.controller.state.layout;
      switch (props.modelData.layoutPos.layoutPos) {
        case 'WEST':
          left = slot;
          slotStylle.left = { width };
          break;
        case 'EAST':
          right = slot;
          slotStylle.right = { width };
          break;
        case 'NORTH':
          top = slot;
          slotStylle.top = { height };
          break;
        case 'SOUTH':
          bottom = slot;
          slotStylle.bottom = { height };
          break;
        case 'CENTER':
          center = slot;
          break;
        default:
          ibiz.log.debug(
            ibiz.i18n.t('vue3Util.panelComponent.unadaptedLayout', {
              layoutPos: props.modelData.layoutPos.layoutPos,
            }),
          );
          break;
      }
    });

    // 如果配了高宽，默认给压缩比为0
    for (const key in slotStylle) {
      if (slotStylle[key].width || slotStylle[key].height) {
        slotStylle[key].flexShrink = 0;
      }
    }

    return (
      <div class={this.classArr} v-loading={this.controller.state.loading} element-loading-text={this.controller.state.loadingText}>
        <div class={[this.ns.e('header')]} style={slotStylle.top}>
          {top}
        </div>
        <div class={[this.ns.b('content')]}>
          <div class={this.ns.be('content', 'left')} style={slotStylle.left}>
            {left}
          </div>
          <div class={this.ns.be('content', 'center')}>{center}</div>
          <div class={this.ns.be('content', 'right')} style={slotStylle.right}>
            {right}
          </div>
        </div>
        <div class={[this.ns.e('footer')]} style={slotStylle.bottom}>
          {bottom}
        </div>
      </div>
    );
  },
});
