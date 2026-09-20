import { useNamespace } from '@ibiz-template/vue3-util';
import { IPanelTabPanel } from '@ibiz/model-core';
import { computed, defineComponent, PropType, VNode } from 'vue';
import './panel-tab-panel.scss';
import { PanelTabPanelController } from './panel-tab-panel.controller';

/**
 * 分页面板
 * @primary
 * @description 使用el-tabs组件，以分页的形式展示面板内容，每个分页都是一个独立的面板容器。
 */
export const PanelTabPanel = defineComponent({
  name: 'IBizPanelTabPanel',
  props: {
    /**
     * @description 分页面板模型数据
     */
    modelData: {
      type: Object as PropType<IPanelTabPanel>,
      required: true,
    },
    /**
     * @description 分页面板控制器
     */
    controller: {
      type: PanelTabPanelController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('panel-tab-panel');
    const { state } = props.controller;
    // 类名控制
    const classArr = computed(() => {
      const { id } = props.modelData;
      const result: Array<string | false> = [ns.b(), ns.m(id)];
      result.push(...props.controller.containerClass);
      return result;
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    const onTabClick = (tabIns: IData, event: MouseEvent) => {
      props.controller.onTabChange(tabIns.props.name);
    };

    return {
      ns,
      state,
      classArr,
      onTabClick,
    };
  },
  render() {
    // 动态控制显示
    if (!this.controller.state.visible) {
      return null;
    }
    // 内容区默认插槽处理，封装app-col
    const defaultSlots: VNode[] = this.$slots.default?.() || [];
    return (
      <el-tabs
        class={[
          this.ns.b(),
          this.ns.m(this.modelData.codeName),
          ...this.controller.containerClass,
        ]}
        model-value={this.state.activeTab}
        onTabClick={this.onTabClick}
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
            <el-tab-pane
              class={this.ns.b('tab-item')}
              label={c.model.caption}
              name={c.model.id}
              lazy
            >
              {this.state.activeTab === c.model.id && slot}
            </el-tab-pane>
          );
        })}
      </el-tabs>
    );
  },
});
