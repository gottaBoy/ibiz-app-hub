import { PanelContainerController } from '@ibiz-template/runtime';
import { IPanelContainer } from '@ibiz/model-core';
import { defineComponent, h, PropType, resolveComponent } from 'vue';
import { useNamespace } from '../../use';
import './panel-container-tabs.scss';

/**
 * 分页容器
 * @primary
 * @description 以分页的形式呈现容器内容，每个分页下为面板分页组件。
 */
export const PanelContainerTabs = defineComponent({
  name: 'IBizPanelContainerTabs',
  props: {
    /**
     * @description 分页容器模型
     */
    modelData: {
      type: Object as PropType<IPanelContainer>,
      required: true,
    },
    /**
     * @description 分页容器控制器
     */
    controller: {
      type: PanelContainerController,
      required: true,
    },
  },
  setup() {
    const ns = useNamespace('panel-container-tabs');

    return { ns };
  },
  render() {
    // 完全用面板容器绘制，只加一个类名
    return h(
      resolveComponent('IBizPanelContainer') as string,
      {
        ...this.$props,
        ...this.$attrs,
        class: this.ns.b(),
      },
      this.$slots,
    );
  },
});
