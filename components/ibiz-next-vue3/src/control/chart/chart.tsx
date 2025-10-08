import {
  hasEmptyPanelRenderer,
  IBizCustomRender,
  useControlController,
  useNamespace,
} from '@ibiz-template/vue3-util';
import {
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  PropType,
  ref,
  watch,
} from 'vue';
import { IDEChart } from '@ibiz/model-core';
import { init } from 'echarts';
import { createUUID } from 'qx-util';
import { isArray } from 'lodash-es';
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
     * @description 部件激活模式，值为0：表示无激活,1：表示单击激活,2：表示双击激活
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
  emits: ['drillDetail'],
  setup(props, { emit }) {
    const c = useControlController((...args) => new ChartController(...args));
    const ns = useNamespace(`control-${c.model.controlType!.toLowerCase()}`);
    const chartRef = ref();
    const maxHeight = ref(0); // 图表表格的高度,后续会根据表格位置进行计算
    const uuid = createUUID();

    const showCheck = ref(false);
    const drillDetailPos = ref({}); // 数据反查框位置
    const drillDetailRef = ref(); // 数据反查框
    let tempParams: IData; // 点击的图表回调事件参数

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

    // 设置表格的高
    const setHeight = async () => {
      await nextTick();
      const el = document.getElementById(uuid);
      if (el) {
        if (
          c.state.gridPosition === 'bottom' ||
          c.state.gridPosition === 'top'
        ) {
          maxHeight.value = el.offsetHeight / 2 - 8;
        } else {
          maxHeight.value = el.offsetHeight - 16;
        }
      }
    };

    // 获取表格的数据
    const getGridData = () => {
      return c.state.gridData || [];
    };

    // 计算数据反查按钮的位置
    const computedDrillDetailPos = (params: IParams) => {
      if (params.event) {
        const event: PointerEvent = params.event.event;
        const { offsetX, offsetY } = params.event;
        const { clientWidth } = event.target as HTMLDivElement;
        if (offsetX + 160 > clientWidth) {
          // 放在左边
          drillDetailPos.value = {
            top: `${offsetY - 20}px`,
            left: `${offsetX - 160}px`,
          };
        } else {
          // 放在右边
          drillDetailPos.value = {
            top: `${offsetY}px`,
            left: `${offsetX + 16}px`,
          };
        }
      }
    };

    // 设置反查按钮显隐状态
    const setDrillState = () => {
      showCheck.value = false;
    };

    // 设置tooltip显示配置
    const setTipState = () => {
      if (!showCheck.value) {
        c.changeTooltipState(true);
      }
    };

    // 容器大小变化监听器
    let resizeObserver: ResizeObserver;

    onMounted(() => {
      const chart = init(chartRef.value);
      c.initChart(chart);
      window.addEventListener('resize', setHeight);
      window.addEventListener('pointerdown', setDrillState);
      window.addEventListener('click', setTipState);
      if (chartRef.value && ResizeObserver) {
        resizeObserver = new ResizeObserver(() => {
          c.resizeChart();
        });
        resizeObserver.observe(chartRef.value);
      }
      setHeight();
      let drillDetails =
        props.modelData.controlParam?.ctrlParams?.ENABLEDRILLDETAIL ||
        c.controlParams.enabledrilldetail;
      if (drillDetails && !isArray(drillDetails)) {
        try {
          drillDetails = JSON.parse(drillDetails);
        } catch (error) {
          ibiz.log.error(error);
          drillDetails = undefined;
        }
      }
      if (drillDetails?.length) {
        // 开启数据反查，重写chart的click事件
        chart.on('click', (params: IData) => {
          const serieModel = c.computedClickSerieModel(params);
          if (!serieModel || ibiz.fullscreenUtil.isFullScreen) {
            // 序列模型不存在或者全屏状态，不显示反查按钮
            return;
          }
          const tempDrill = drillDetails.find((item: IData) => {
            return item.name === serieModel.valueField;
          });
          if (!tempDrill || !tempDrill.isDrill) {
            return;
          }
          tempParams = params;
          computedDrillDetailPos(params); // 计算反查按钮位置
          chart.dispatchAction({ type: 'hideTip' }); // 隐藏Tip提示框
          c.changeTooltipState(false); // 关闭提示配置
          showCheck.value = true; // 显示反查按钮
        });
      }
    });

    // 查看明细
    const openDrillDetail = (_event: MouseEvent) => {
      _event.stopPropagation();
      _event.preventDefault();
      showCheck.value = false;
      c.changeTooltipState(true);
      // 计算反查需要的指标和维度数据
      const param = c.computedDrillDetailParam(tempParams);
      emit('drillDetail', param);
    };

    // 表格显示时计算表格的高度
    watch(
      () => c.state.showGrid,
      () => {
        setHeight();
      },
      {
        immediate: true,
      },
    );

    // 绘制表格
    const renderGrid = () => {
      return (
        <el-table
          ref='tableRef'
          data={getGridData()}
          border
          style={{ width: '100%' }}
          max-height={maxHeight.value}
          span-method={c.spanMethod.bind(c)}
          header-row-class-name={ns.e('grid-header')}
        >
          {c.state.gridHeaders.map((column: IData) => {
            return (
              <el-table-column
                prop={column.id}
                align='center'
                label={column.name}
              ></el-table-column>
            );
          })}
        </el-table>
      );
    };

    const renderNoData = () => {
      if (c.state.items.length === 0) {
        const noDataSlots: IParams = {};
        if (hasEmptyPanelRenderer(c)) {
          Object.assign(noDataSlots, {
            customRender: () => (
              <IBizCustomRender controller={c}></IBizCustomRender>
            ),
          });
        }
        return (
          <iBizNoData
            text={c.model.emptyText}
            emptyTextLanguageRes={c.model.emptyTextLanguageRes}
            hideNoDataImage={c.state.hideNoDataImage}
          >
            {noDataSlots}
          </iBizNoData>
        );
      }
    };

    onBeforeUnmount(() => {
      window.removeEventListener('resize', setHeight);
      window.removeEventListener('pointerdown', setDrillState);
      window.removeEventListener('click', setTipState);
      resizeObserver?.disconnect();
    });

    return {
      c,
      ns,
      chartRef,
      uuid,
      showCheck,
      drillDetailPos,
      drillDetailRef,
      openDrillDetail,
      renderGrid,
      renderNoData,
    };
  },
  render() {
    return (
      <iBizControlBase controller={this.c}>
        <div id={this.uuid} class={this.ns.b('chart-container')}>
          {this.renderNoData()}
          <div
            class={[
              this.ns.e('chart-grid'),
              this.ns.is('no-data', this.c.state.items.length === 0),
              this.ns.is('show-grid', this.c.state.showGrid),
              {
                [this.ns.em('chart-grid', this.c.state.gridPosition)]:
                  this.c.state.showGrid,
              },
            ]}
          >
            <div
              class={[
                this.ns.e('chart-grid-container'),
                this.ns.is(this.c.state.gridPosition, this.c.state.showGrid),
                this.ns.is('no-grid', !this.c.state.showGrid),
              ]}
            >
              <div ref='chartRef' class={[this.ns.e('chart')]}>
                {ibiz.i18n.t('control.chart.chartPlaceholder')}
              </div>
              {this.showCheck ? (
                <div
                  ref='drillDetailRef'
                  class={this.ns.e('drill-detail')}
                  style={this.drillDetailPos}
                  onPointerdown={this.openDrillDetail}
                >
                  <div class={this.ns.em('drill-detail', 'item')}>
                    <svg
                      viewBox='0 0 16 16'
                      xmlns='http://www.w3.org/2000/svg'
                      height='1em'
                      width='1em'
                      focusable='false'
                      fill='currentColor'
                    >
                      <g
                        id='aspnormal/preview'
                        stroke-width='1'
                        fill-rule='evenodd'
                      >
                        <path
                          d='M11.626 0c1.057 0 1.923.818 2 1.855l.005.15v3.411a.6.6 0 0 1-1.192.097l-.008-.097.001-1.348V2.005c0-.41-.31-.749-.705-.799l-.101-.006h-9.62c-.41 0-.75.308-.8.704l-.006.101v11.989c0 .41.308.75.705.8l.101.006h5.906l.017-.004.016-.003h2.074a.598.598 0 1 1 .107 1.187l-.095.01V16H2.006a2.006 2.006 0 0 1-2-1.856L0 13.994V2.005C0 .948.818.082 1.856.005L2.006 0h9.62zm-1.595 6.328a3.669 3.669 0 0 1 3.665 3.665c0 .79-.251 1.523-.678 2.123l2.412 2.412a.6.6 0 1 1-.848.85l-2.41-2.412a3.646 3.646 0 0 1-2.14.692 3.67 3.67 0 0 1-3.667-3.665 3.67 3.67 0 0 1 3.666-3.665zm-5.106 5.29a.6.6 0 0 1 .097 1.191l-.097.008H2.85a.6.6 0 0 1-.097-1.192l.097-.008h2.074zm5.106-4.09a2.468 2.468 0 0 0-2.466 2.465 2.468 2.468 0 0 0 2.466 2.466 2.47 2.47 0 0 0 2.466-2.466 2.469 2.469 0 0 0-2.466-2.465zm-4.815-.126a.6.6 0 0 1 .097 1.193l-.097.007h-2.35A.6.6 0 0 1 2.77 7.41l.098-.008h2.349zm5.58-4a.6.6 0 0 1 .097 1.192l-.097.008H2.867A.6.6 0 0 1 2.77 3.41l.097-.008h7.929z'
                          id='asp合并形状'
                        ></path>
                      </g>
                    </svg>
                    <div class={this.ns.em('drill-detail', 'item-text')}>
                      {ibiz.i18n.t('control.chart.drillDetail')}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            {this.c.state.showGrid ? (
              <div class={this.ns.e('grid')}>{this.renderGrid()}</div>
            ) : null}
          </div>
        </div>
      </iBizControlBase>
    );
  },
});

export default ChartControl;
