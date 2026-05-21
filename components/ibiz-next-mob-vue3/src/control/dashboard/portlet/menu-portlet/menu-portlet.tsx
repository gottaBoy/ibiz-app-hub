import { useNamespace } from '@ibiz-template/vue3-util';
import { defineComponent, PropType } from 'vue';
import { IAppMenu, IDBAppMenuPortletPart } from '@ibiz/model-core';
import { MenuPortletController } from '@ibiz-template/runtime';

export const MenuPortlet = defineComponent({
  name: 'IBizMenuPortlet',
  props: {
    modelData: {
      type: Object as PropType<IDBAppMenuPortletPart>,
      required: true,
    },
    controller: {
      type: MenuPortletController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace(
      `portlet-${props.modelData.portletType?.toLowerCase()}`,
    );
    const menu: IAppMenu | undefined = props.modelData.controls?.find(item => {
      return item.controlType === 'APPMENU';
    });
    return { ns, menu };
  },

  render() {
    const classArr: string[] = [
      this.ns.b(),
      this.ns.m(this.modelData.codeName),
    ];
    const { context } = this.controller;
    return (
      <iBizPortletLayout controller={this.controller} class={classArr}>
        {this.menu && (
          <iBizControlShell
            modelData={this.menu}
            context={context}
            params={{}}
          ></iBizControlShell>
        )}
      </iBizPortletLayout>
    );
  },
});
