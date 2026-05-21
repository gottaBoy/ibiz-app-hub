import { useNamespace } from '@ibiz-template/vue3-util';
import { PropType, VNode, computed, defineComponent } from 'vue';
import { IPanelContainer } from '@ibiz/model-core';
import { SplitContainerController } from './split-container.controller';
import './split-container.scss';

/**
 * 分割容器
 * @primary
 * @description 将容器根据固定比例或像素分割为左右或上下两个区域，两个区域的大小可以通过拖拽改变。
 */
export const SplitContainer = defineComponent({
  name: 'IBizSplitContainer',
  props: {
    /**
     * @description 分割容器容器模型
     */
    modelData: {
      type: Object as PropType<IPanelContainer>,
      required: true,
    },
    /**
     * @description 分割容器控制器
     */
    controller: {
      type: SplitContainerController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('split-container');
    const { id } = props.modelData;

    const classArr = computed(() => {
      let result: Array<string | false> = [ns.b(), ns.m(id)];
      result = [
        ...result,
        ...props.controller.containerClass,
        ns.is('hidden', !props.controller.state.visible),
        ns.is('hidden-trigger', props.controller.state.isHiddenTrigger),
      ];
      return result;
    });

    return {
      ns,
      classArr,
    };
  },
  render() {
    const defaultSlots: VNode[] = this.$slots.default?.() || [];
    return (
      <div class={this.classArr} v-loading={this.controller.state.loading}>
        <iBizSplit
          v-model={this.controller.state.splitValue}
          mode={this.controller.splitMode}
        >
          {{
            left: () => defaultSlots[0],
            right: () => defaultSlots[1],
            top: () => defaultSlots[0],
            bottom: () => defaultSlots[1],
          }}
        </iBizSplit>
      </div>
    );
  },
});
