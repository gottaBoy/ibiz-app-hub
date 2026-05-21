import { useNamespace } from '@ibiz-template/vue3-util';
import { defineComponent, PropType } from 'vue';
import { IDBHtmlPortletPart } from '@ibiz/model-core';
import { HtmlPortletController } from '@ibiz-template/runtime';
import './html-portlet.scss';

export const HtmlPortlet = defineComponent({
  name: 'IBizHtmlPortlet',
  props: {
    modelData: {
      type: Object as PropType<IDBHtmlPortletPart>,
      required: true,
    },
    controller: {
      type: HtmlPortletController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace(
      `portlet-${props.modelData.portletType?.toLowerCase()}`,
    );

    return { ns };
  },

  render() {
    const classArr: string[] = [
      this.ns.b(),
      this.ns.m(this.modelData.codeName),
      ...this.controller.containerClass,
    ];
    return (
      <iBizPortletLayout controller={this.controller} class={classArr}>
        <iframe src={this.modelData.pageUrl}></iframe>
      </iBizPortletLayout>
    );
  },
});
