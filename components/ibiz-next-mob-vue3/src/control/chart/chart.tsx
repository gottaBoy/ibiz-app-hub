import { useControlController, useNamespace } from '@ibiz-template/vue3-util';
import {
  defineComponent,
  onBeforeUnmount,
  onMounted,
  PropType,
  ref,
  watch,
} from 'vue';
import { IDEChart } from '@ibiz/model-core';
import { init } from 'echarts';
import {
  ChartController,
  ControlVO,
  IControlProvider,
} from '@ibiz-template/runtime';
import './chart.scss';

const ChartControl = defineComponent({
  name: 'IBizChartControl',
  props: {
    /**
     * @description 图表模型数据
     */
    modelData: { type: Object as PropType<IDEChart>, required: true },
    /**
     * @description 应用上下文对象
     */
    context: { type: Object as PropType<IContext>, required: true },
    /**
     * @description 视图参数对象
     * @default {}
     */
    params: { type: Object as PropType<IParams>, default: () => ({}) },
    /**
     * @description 部件适配器
     */
    provider: { type: Object as PropType<IControlProvider> },
    /**
     * @description 部件激活模式，值为0：无激活，值为1：单击激活，值为2：双击激活
     */
    mdctrlActiveMode: { type: Number, default: undefined },
    /**
     * @description 是否默认加载数据
     * @default true
     */
    loadDefault: { type: Boolean, default: true },
    /**
     * @description 是否是简单模式，即直接传入数据，不加载数据
     */
    isSimple: { type: Boolean, required: false },
    /**
     * @description 简单模式下传入的数据
     */
    data: { type: Array<IData>, required: false },
  },
  setup(props) {
    const c = useControlController((...args) => new ChartController(...args));
    const ns = useNamespace(`control-${c.model.controlType!.toLowerCase()}`);
    const chartRef = ref();

    // 本地数据模式
    const initSimpleData = (): void => {
      if (!props.data) {
        return;
      }
      c.state.items = (props.data as IData[]).map(item => new ControlVO(item));
      c.afterLoad({}, c.state.items);
    };

    c.evt.on('onCreated', async () => {
      if (props.isSimple) {
        initSimpleData();
        c.state.isSimple = true;
        c.state.isLoaded = true;
      }
    });

    watch(
      () => props.data,
      () => {
        if (props.isSimple) {
          initSimpleData();
        }
      },
      {
        deep: true,
      },
    );

    // 容器大小变化监听器
    let resizeObserver: ResizeObserver;

    onMounted(() => {
      const chart = init(chartRef.value);
      c.initChart(chart);

      if (chartRef.value && ResizeObserver) {
        resizeObserver = new ResizeObserver(() => {
          c.resizeChart();
        });
        resizeObserver.observe(chartRef.value);
      }
    });

    onBeforeUnmount(() => {
      resizeObserver?.disconnect();
    });

    return {
      c,
      ns,
      chartRef,
    };
  },
  render() {
    return (
      <iBizControlBase controller={this.c}>
        <div ref='chartRef' class={this.ns.e('chart')}></div>
      </iBizControlBase>
    );
  },
});

export default ChartControl;
