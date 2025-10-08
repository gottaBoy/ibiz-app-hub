import { useNamespace } from '@ibiz-template/vue3-util';
import { IPanelTabPanel } from '@ibiz/model-core';
import { computed, defineComponent, PropType, VNode } from 'vue';
import { PanelTabPanelController } from './panel-tab-panel.controller';
import './panel-tab-panel.scss';

/**
 * 分页部件
 * @primary
 * @description 可显示多个分页，每个分页有自己的内容。
 */
export const PanelTabPanel = defineComponent({
  name: 'IBizPanelTabPanel',
  props: {
    /**
     * @description 分页部件模型数据
     */
    modelData: {
      type: Object as PropType<IPanelTabPanel>,
      required: true,
    },
    /**
     * @description 分页部件控制器
     */
    controller: {
      type: PanelTabPanelController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('panel-tab-panel');

    // 类名控制
    const classArr = computed(() => {
      const { id } = props.modelData;
      const result: Array<string | false> = [ns.b(), ns.m(id)];
      result.push(...props.controller.containerClass);
      return result;
    });

    const onTabClick = (args: {
      name: string;
      title: string;
      event: MouseEvent;
      disabled: boolean;
    }) => {
      const { name } = args;
      props.controller.onTabChange(name);
    };

    return {
      ns,
      classArr,
      onTabClick,
    };
  },
  render() {
    // 动态控制显示
    if (!this.controller.state.visible) {
      return;
    }
    // 内容区默认插槽处理，封装app-col
    const defaultSlots: VNode[] = this.$slots.default?.() || [];
    return (
      <van-tabs
        class={[
          this.ns.b(),
          this.ns.m(this.modelData.codeName),
          ...this.controller.containerClass,
        ]}
        lazy-render
        model-value={this.controller.state.activeTab}
        onClickTab={this.onTabClick}
      >
        {defaultSlots!.map(slot => {
          const props = slot.props as IData;
          if (!props || !props.controller) {
            return slot;
          }
          const c = props.controller;
          // 不显示且不用保活时直接不绘制
          if (!c.state.visible && !c.state.keepAlive) {
            return null;
          }
          return (
            <van-tab
              class={this.ns.b('tab-item')}
              title={c.model.caption}
              name={c.model.id}
            >
              {slot}
            </van-tab>
          );
        })}
      </van-tabs>
    );
  },
});
