import { useNamespace } from '@ibiz-template/vue3-util';
import { defineComponent, h, PropType, resolveComponent } from 'vue';
import { IDBPortletPart } from '@ibiz/model-core';
import { PortletPartController } from '@ibiz-template/runtime';
import { ScreenPortletController } from './screen-portlet.controller';
import './screen-portlet.scss';

const portletComponent: IData = {
  LIST: 'IBizListPortlet',
  CHART: 'IBizChartPortlet',
  VIEW: 'IBizViewPortlet',
  REPORT: 'IBizReportPortlet',
  HTML: 'IBizHtmlPortlet',
  FILTER: 'IBizFilterPortlet',
  ACTIONBAR: 'IBizActionBarPortlet',
  APPMENU: 'IBizMenuPortlet',
  CONTAINER: 'IBizContainerPortlet',
  RAWITEM: 'IBizRawItemPortlet',
};

export const ScreenPortlet = defineComponent({
  name: 'ScreenPortlet',
  props: {
    modelData: {
      type: Object as PropType<IDBPortletPart>,
      required: true,
    },
    controller: {
      type: PortletPartController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace(`screen-portlet`);
    const c = new ScreenPortletController(
      props.controller.model,
      props.controller.dashboard,
      props.controller.parent,
    );

    return { c, ns };
  },

  render() {
    const { sysImage } = this.modelData;
    const componentName =
      portletComponent[this.controller.model.portletType!] || 'IBizViewPortlet';
    const component = resolveComponent(componentName);
    const content = h(
      component,
      {
        modelData: this.modelData,
        controller: this.controller,
      },
      this.$slots.default?.(),
    );
    if (this.c.borderStyle) {
      const borderDiv = resolveComponent(this.c.borderStyle);
      let offsetY = 0;
      if (this.c.model.showTitleBar && this.c.borderMode === 'body') {
        offsetY = 58;
      }
      return h(
        borderDiv,
        {
          offsetY,
          class: [
            this.ns.b(),
            this.ns.is('full-icon', this.c.iconType === 'full'),
            this.ns.is('full-border', offsetY > 0),
            this.ns.is(
              'container',
              this.controller.model.portletType === 'CONTAINER',
            ),
          ],
        },
        content,
      );
    }
    return (
      <div
        class={[
          this.ns.b(),
          this.ns.is('full-icon', this.c.iconType === 'full'),
          this.ns.is(
            'container',
            this.controller.model.portletType === 'CONTAINER',
          ),
        ]}
      >
        {content}
        {sysImage && this.controller.model.portletType === 'CONTAINER' && (
          <iBizIcon class={this.ns.e('bg-icon')} icon={sysImage}></iBizIcon>
        )}
        {this.c.bodyBgUrl && (
          <img class={this.ns.e('body-image')} src={this.c.bodyBgUrl}></img>
        )}
      </div>
    );
  },
});
