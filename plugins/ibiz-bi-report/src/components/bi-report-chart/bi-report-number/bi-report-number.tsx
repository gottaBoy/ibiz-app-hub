/* eslint-disable @typescript-eslint/no-explicit-any */
import { PropType, computed, defineComponent, ref, watch } from 'vue';
import { IBIReportChartController } from '../../../interface';
import { useNamespace } from '../../../use';
import './bi-report-number.scss';
import { biReportT } from '../../../locale';

export default defineComponent({
  name: 'IBizBIReportNumber',
  props: {
    c: {
      type: Object as PropType<IBIReportChartController>,
      required: true,
    },
    enableDrillDetail: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['drillDetail'],
  setup(props, { emit }) {
    const controller = props.c;
    const ns = useNamespace('amount');
    // 统一管理所有响应式数据
    const uiState = ref({
      visible: false, // 查看明细是否显示
      yoy: 0, // 同比差异值,年与年比较
      qoq: 0, // 环比差异值,月与月比较
      currentTotal: 0, // 当前总数
      yoyTotal: 0, // 同比总数
      qoqTotal: 0, // 环比总数
    });

    // 报表模型
    const reportModel = computed(() => {
      return controller.state.reportModel;
    });

    // 处理比较数据
    const handleCompareData = () => {
      const codeName = reportModel.value?.appBIReportMeasures?.[0]?.measureTag;
      if (codeName) {
        controller.state.items.forEach((item: IData) => {
          if (item && item.srfperiodtype === 'PoP1') {
            uiState.value.qoqTotal = Number.isNaN(Number(item[codeName]))
              ? 0
              : Number(item[codeName]);
          } else if (item && item.srfperiodtype === 'YoY1') {
            uiState.value.yoyTotal = Number.isNaN(Number(item[codeName]))
              ? 0
              : Number(item[codeName]);
          } else if (item && item[codeName]) {
            uiState.value.currentTotal = Number.isNaN(Number(item[codeName]))
              ? 0
              : Number(item[codeName]);
          }
        });
        uiState.value.qoq = uiState.value.currentTotal - uiState.value.qoqTotal;
        uiState.value.yoy = uiState.value.currentTotal - uiState.value.yoyTotal;
      }
    };

    // 样式对象
    const reportUIModelStyle = computed(() => {
      if (reportModel.value?.reportUIModel) {
        const reportUIModelObject = JSON.parse(
          reportModel.value?.reportUIModel,
        );
        if (reportUIModelObject.style) {
          return reportUIModelObject.style;
        }
      }
      return {};
    });

    // 数字的样式
    const style = computed(() => {
      const tempstyle: IData = {};
      if (
        reportUIModelStyle.value &&
        reportUIModelStyle.value.font &&
        reportUIModelStyle.value.font.font
      ) {
        const { fontWeight, fontStyle, fontSize, color } =
          reportUIModelStyle.value.font.font;
        Object.assign(tempstyle, {
          fontWeight,
          fontStyle,
          fontSize: `${fontSize}px`,
          color,
        });
      }
      return tempstyle;
    });

    // 单位的样式
    const miniStyle = computed(() => {
      const tempstyle: IData = {};
      if (
        reportUIModelStyle.value &&
        reportUIModelStyle.value.font &&
        reportUIModelStyle.value.font.font
      ) {
        const { fontWeight, fontStyle, fontSize, color } =
          reportUIModelStyle.value.font.font;
        Object.assign(tempstyle, {
          fontWeight,
          fontStyle,
          fontSize: `${fontSize / 5}px`,
          color,
        });
      }
      return tempstyle;
    });

    // 监听报表模型以及数据值的改变
    watch(
      () => [reportModel.value, controller.state.items],
      () => {
        uiState.value.yoy = 0;
        uiState.value.qoq = 0;
        uiState.value.currentTotal = 0; // 当前总数
        uiState.value.yoyTotal = 0; // 同比总数
        uiState.value.qoqTotal = 0; // 环比总数
        handleCompareData();
      },
      {
        immediate: true,
        deep: true,
      },
    );

    // 绘制上升图标
    const renderUpIcon = () => {
      return (
        <svg
          viewBox='0 0 16 16'
          xmlns='http://www.w3.org/2000/svg'
          height='1em'
          width='1em'
          focusable='false'
          fill='currentColor'
          style='transform: rotate(180deg);'
        >
          <g
            id='aft1.Base基础/1.icon图标/5.navigation/caret-down'
            stroke-width='1'
            fill-rule='evenodd'
          >
            <path
              d='M5.02 8.233l5.952-5.952a.6.6 0 0 1 1.025.424v5.952a.6.6 0 0 1-.6.6H5.445a.6.6 0 0 1-.424-1.024z'
              id='aft路径'
              transform='rotate(45 7.997 5.257)'
            ></path>
          </g>
        </svg>
      );
    };

    // 绘制下降图标
    const renderDownIcon = () => {
      return (
        <svg
          viewBox='0 0 16 16'
          xmlns='http://www.w3.org/2000/svg'
          height='1em'
          width='1em'
          focusable='false'
          fill='currentColor'
        >
          <g
            id='aft1.Base基础/1.icon图标/5.navigation/caret-down'
            stroke-width='1'
            fill-rule='evenodd'
          >
            <path
              d='M5.02 8.233l5.952-5.952a.6.6 0 0 1 1.025.424v5.952a.6.6 0 0 1-.6.6H5.445a.6.6 0 0 1-.424-1.024z'
              id='aft路径'
              transform='rotate(45 7.997 5.257)'
            ></path>
          </g>
        </svg>
      );
    };

    // 绘制升降图标与升降数值
    const renderUpDownResult = (baseValue: number, targetValue: number) => {
      if (baseValue === 0) {
        if (targetValue === 0) {
          return <span>-</span>;
        }
        return (
          <div class={ns.e('up')}>
            {renderUpIcon()}
            <span>100%</span>
          </div>
        );
      }
      const temp = targetValue - baseValue;
      const percentage = ((Math.abs(temp) / baseValue) * 100).toFixed(0);
      if (temp < 0) {
        return (
          <div class={ns.e('down')}>
            {renderDownIcon()}
            <span>{percentage}%</span>
          </div>
        );
      }
      if (temp === 0) {
        return <span>-</span>;
      }
      return (
        <div class={ns.e('up')}>
          {renderUpIcon()}
          <span>{percentage}%</span>
        </div>
      );
    };

    // 抛出反查事件
    const onDrillDetail = () => {
      uiState.value.visible = false;
      emit('drillDetail', {
        measure: {
          name: reportModel.value?.appBIReportMeasures?.[0]?.measureTag,
        },
      });
    };

    // 处理值格式化
    const handleFormat = (value: number) => {
      const format = reportModel.value?.appBIReportMeasures?.[0]?.jsonFormat;
      if (format) {
        return ibiz.util.text.format(String(value), format);
      }
      return value;
    };

    // 计算反查按钮显隐状态
    const visibleComp = computed({
      get() {
        return (
          uiState.value.visible &&
          props.enableDrillDetail &&
          props.c.mode === 'CONTENT' &&
          !ibiz.fullscreenUtil.isFullScreen
        );
      },
      set(value: boolean) {
        uiState.value.visible = value;
      },
    });

    return {
      ns,
      controller,
      uiState,
      style,
      renderUpDownResult,
      miniStyle,
      reportUIModelStyle,
      onDrillDetail,
      handleFormat,
      visibleComp,
    };
  },

  render() {
    if (
      !this.controller.state.isCreated ||
      !this.controller.state.refreshFlag
    ) {
      return null;
    }
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('content')}>
          <el-popover
            trigger='click'
            v-model:visible={this.visibleComp}
            popper-class={this.ns.e('check-detail')}
            placement='right-start'
            width={200}
          >
            {{
              default: () => {
                return (
                  <div
                    onClick={this.onDrillDetail}
                    class={this.ns.em('check-detail', 'item')}
                  >
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
                    <span class={this.ns.em('check-detail', 'text')}>
                      {biReportT('viewDetails')}
                    </span>
                  </div>
                );
              },
              reference: () => {
                return (
                  <div class={this.ns.em('content', 'number')}>
                    <span
                      class={this.ns.em('content', 'number-text')}
                      style={this.style}
                    >
                      {this.handleFormat(this.uiState.currentTotal)}
                    </span>
                    <span
                      class={this.ns.em('content', 'number-unit')}
                      style={this.miniStyle}
                    >
                      {/* 天 */}
                    </span>
                  </div>
                );
              },
            }}
          </el-popover>
          <div class={this.ns.em('content', 'compare')}>
            {this.reportUIModelStyle.yoy?.show && (
              <div class={this.ns.em('content', 'yoy')}>
                <div class={this.ns.em('content', 'compare-number')}>
                  <span>{biReportT('yoy')}</span>
                  <span
                    class={[
                      this.ns.em('content', 'yoy-yoyTotal'),
                      this.ns.is(
                        'show',
                        this.reportUIModelStyle.yoy?.yoy?.includes('orgin'),
                      ),
                    ]}
                  >
                    {this.uiState.yoyTotal}
                  </span>
                  <span
                    class={[
                      this.ns.em('content', 'yoy-value'),
                      this.ns.is(
                        'show',
                        this.reportUIModelStyle.yoy?.yoy?.includes(
                          'difference',
                        ),
                      ),
                    ]}
                  >
                    ({this.uiState.yoy > 0 ? '+' : ''}
                    {this.uiState.yoy})
                  </span>
                </div>
                <div class={this.ns.em('content', 'icon')}>
                  {this.renderUpDownResult(
                    this.uiState.yoyTotal,
                    this.uiState.currentTotal,
                  )}
                </div>
              </div>
            )}

            {this.reportUIModelStyle.qoq?.show && (
              <div class={this.ns.em('content', 'qoq')}>
                <div class={this.ns.em('content', 'compare-number')}>
                  <span>{biReportT('qoq')}</span>
                  <span
                    class={[
                      this.ns.em('content', 'qoq-qoqTotal'),
                      this.ns.is(
                        'show',
                        this.reportUIModelStyle.qoq?.qoq?.includes('orgin'),
                      ),
                    ]}
                  >
                    {this.uiState.qoqTotal}
                  </span>
                  <span
                    class={[
                      this.ns.em('content', 'qoq-value'),
                      this.ns.is(
                        'show',
                        this.reportUIModelStyle.qoq?.qoq?.includes(
                          'difference',
                        ),
                      ),
                    ]}
                  >
                    ({this.uiState.qoq > 0 ? '+' : ''}
                    {this.uiState.qoq})
                  </span>
                </div>
                <div class={this.ns.em('content', 'icon')}>
                  {this.renderUpDownResult(
                    this.uiState.qoqTotal,
                    this.uiState.currentTotal,
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
});
