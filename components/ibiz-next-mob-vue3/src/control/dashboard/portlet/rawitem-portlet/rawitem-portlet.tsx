import { useNamespace } from '@ibiz-template/vue3-util';
import { defineComponent, PropType, resolveComponent, h } from 'vue';
import { IDBRawItemPortletPart } from '@ibiz/model-core';
import { RawItemPortletController } from '@ibiz-template/runtime';
import './rawitem-portlet.scss';

export const RawItemPortlet = defineComponent({
  name: 'IBizRawItemPortlet',
  props: {
    modelData: {
      type: Object as PropType<IDBRawItemPortletPart>,
      required: true,
    },
    controller: {
      type: RawItemPortletController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace(
      `portlet-${props.modelData.portletType?.toLowerCase()}`,
    );

    const rawItem = props.modelData;

    return { ns, rawItem };
  },

  render() {
    const classArr: string[] = [
      this.ns.b(),
      this.ns.m(this.modelData.codeName),
      ...this.controller.containerClass,
    ];
    return (
      <iBizPortletLayout controller={this.controller} class={classArr}>
        {h(resolveComponent('iBizRawItem'), {
          rawItem: this.rawItem,
        })}
      </iBizPortletLayout>
    );
  },
});
