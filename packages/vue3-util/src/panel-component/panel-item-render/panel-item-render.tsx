import { IPanelContainer } from '@ibiz/model-core';
import { computed, defineComponent, PropType } from 'vue';
import { useNamespace } from '../../use';
import { PanelItemRenderController } from './panel-item-render.controller';

/**
 * 面板项绘制器
 * @primary
 * @description 当面板项配置了绘制器时，面板内容由原来的组件替换为绘制器组件，绘制配置的脚本代码返回内容。
 */
export const PanelItemRender = defineComponent({
  name: 'IBizPanelItemRender',
  props: {
    /**
     * @description 面板项模型
     */
    modelData: {
      type: Object as PropType<IPanelContainer>,
      required: true,
    },
    /**
     * @description 面板项控制器
     */
    controller: {
      type: PanelItemRenderController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('panel-item-render');

    const nsType = useNamespace(
      `panel-${props.modelData.itemType?.toLowerCase()}`,
    );

    const { id } = props.modelData;

    // 类名控制
    const classArr = computed(() => {
      const result: Array<string | false> = [
        ns.b(),
        ns.m(id),
        nsType.b(),
        ns.is('hidden', !props.controller.state.visible),
      ];
      return result;
    });

    const htmlCode = computed(() => {
      return props.controller.getPanelItemCustomHtml(
        props.modelData.controlRenders!,
        props.controller.data,
      );
    });

    return { ns, classArr, htmlCode };
  },
  render() {
    return (
      <div
        class={this.classArr}
        v-html={this.htmlCode}
        onClick={event => this.controller.onClick(event)}
      ></div>
    );
  },
});
