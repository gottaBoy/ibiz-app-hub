import { useNamespace } from '@ibiz-template/vue3-util';
import { defineComponent, PropType } from 'vue';
import { IDBPortletPart } from '@ibiz/model-core';
import { PortletPluginController } from './portlet-plugin.controller';
import './portlet-plugin.scss';

export const PortletPlugin = defineComponent({
  name: 'IBizPortletPlugin',
  props: {
    modelData: {
      type: Object as PropType<IDBPortletPart>,
      required: true,
    },
    controller: {
      type: PortletPluginController,
      required: true,
    },
  },
  setup() {
    const ns = useNamespace(`portlet-plugin`);

    return { ns };
  },

  render() {
    const classArr: string[] = [
      this.ns.b(),
      this.ns.m(this.modelData.codeName),
      ...this.controller.containerClass,
    ];
    return <div class={classArr}>门户部件插件内容</div>;
  },
});
