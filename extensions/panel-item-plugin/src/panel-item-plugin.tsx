import { IPanelItem } from '@ibiz/model-core';
import { computed, defineComponent, PropType } from 'vue';
import { useNamespace } from '@ibiz-template/vue3-util';
import { PanelItemPluginController } from './panel-item-plugin.controller';
import './panel-item-plugin.scss';

export const PanelItemPlugin = defineComponent({
  name: 'IBizPanelItemPlugin',
  props: {
    modelData: {
      type: Object as PropType<IPanelItem>,
      required: true,
    },
    controller: {
      type: PanelItemPluginController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('panel-item-plugin');

    // 类名控制
    const classArr = computed(() => {
      const { id } = props.modelData;
      const result: Array<string | false> = [ns.b(), ns.m(id)];
      result.push(...props.controller.containerClass);
      return result;
    });

    return {
      ns,
      classArr,
    };
  },
  render() {
    return <div class={this.classArr}>面板项插件内容</div>;
  },
});
