import { IPanelContainer } from '@ibiz/model-core';
import { computed, defineComponent, PropType, VNode } from 'vue';
import { useNamespace } from '../../../use';
import { ScrollContainerItemController } from './scroll-container-item.controller';
import './scroll-container-item.scss';

/**
 * 面板滚动容器项
 * @primary
 * @description 用于绘制面板滚动容器项。
 */
export const ScrollContainerItem = defineComponent({
  name: 'IBizScrollContainerItem',
  props: {
    /**
     * @description 面板滚动容器项模型数据
     */
    modelData: {
      type: Object as PropType<IPanelContainer>,
      required: true,
    },
    /**
     * @description 面板滚动容器项控制器
     */
    controller: {
      type: ScrollContainerItemController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('scroll-container-item');
    const { id } = props.modelData;

    // 类名控制
    const classArr = computed(() => {
      const result: Array<string | false> = [
        ns.b(),
        ns.m(id),
        ns.is('hidden', !props.controller.state.visible),
      ];
      return result;
    });

    return { ns, classArr };
  },
  render() {
    // 内容区默认插槽处理，封装app-col
    const defaultSlots: VNode[] = this.$slots.default?.() || [];

    return (
      <iBizRow
        class={this.classArr}
        layout={{ layout: 'FLEX' }}
        v-loading={this.controller.state.loading}
      >
        {defaultSlots.map(slot => {
          const props = slot.props as IData;
          if (!props || !props.controller) {
            return slot;
          }

          props.modelData.layoutPos.layout = 'FLEX';
          return (
            <iBizCol
              layoutPos={props.modelData.layoutPos}
              state={props.controller.state}
            >
              {slot}
            </iBizCol>
          );
        })}
      </iBizRow>
    );
  },
});
