import { useNamespace } from '@ibiz-template/vue3-util';
import {
  defineComponent,
  PropType,
  resolveComponent,
  h,
  onMounted,
  onBeforeUnmount,
} from 'vue';
import { IDBChartPortlet } from '@ibiz/model-core';
import { ChartPortletController, ControlType } from '@ibiz-template/runtime';

export const ChartPortlet = defineComponent({
  name: 'IBizChartPortlet',
  props: {
    modelData: {
      type: Object as PropType<IDBChartPortlet>,
      required: true,
    },
    controller: {
      type: ChartPortletController,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace(
      `portlet-${props.modelData.portletType?.toLowerCase()}`,
    );

    const chart = props.modelData.controls?.find(item => {
      return item.controlType === ControlType.CHART;
    });

    let timerTag: NodeJS.Timeout | undefined;

    onMounted(() => {
      const timer = props.controller.model.timer;
      if (timer && timer > 0) {
        timerTag = setInterval(() => {
          props.controller.refresh();
        }, timer);
      }
    });

    onBeforeUnmount(() => {
      clearInterval(timerTag);
    });

    return { ns, chart };
  },

  render() {
    const classArr: string[] = [
      this.ns.b(),
      this.ns.m(this.modelData.codeName),
      ...this.controller.containerClass,
    ];
    const { context, params } = this.controller;
    return (
      <iBizPortletLayout controller={this.controller} class={classArr}>
        {h(resolveComponent('IBizControlShell'), {
          context,
          params,
          modelData: this.chart,
        })}
      </iBizPortletLayout>
    );
  },
});
