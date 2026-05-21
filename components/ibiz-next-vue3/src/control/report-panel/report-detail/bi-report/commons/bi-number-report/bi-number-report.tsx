/* eslint-disable camelcase */
import { useNamespace } from '@ibiz-template/vue3-util';
import { IAppBIReportMeasure } from '@ibiz/model-core';
import { computed, defineComponent, PropType, ref } from 'vue';
import './bi-number-report.scss';

export const IBizBINumberReport = defineComponent({
  name: 'IBizBINumberReport',
  props: {
    model: { type: Object as PropType<IModel>, required: true },
    data: { type: Array<IData>, required: true },
  },
  setup(props) {
    const ns = useNamespace('bi-number-report');

    // 统一管理所有响应式数据
    const uiState = ref({
      visible: false, // 查看明细是否显示
      yoy: 0, // 同比差异值,年与年比较
      qoq: 0, // 环比差异值,月与月比较
      currentTotal: 0, // 当前总数
      yoyTotal: 0, // 同比总数
      qoqTotal: 0, // 环比总数
    });

    // 处理比较数据
    const handleCompareData = () => {
      const codeName = (
        props.model.measure as IAppBIReportMeasure
      )?.measureTag?.toLowerCase();
      if (codeName) {
        props.data.forEach((item: IData) => {
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
    handleCompareData();

    // 数字的样式
    const style = computed(() => {
      const tempStyle: IData = {};
      const { number_fontstyle, number_fontsize, number_fontcolor } =
        props.model;
      if (number_fontstyle) {
        if (number_fontstyle.includes('bold')) {
          tempStyle.fontWeight = 'bold';
        } else {
          tempStyle.fontStyle = number_fontstyle;
        }
      }
      if (number_fontsize) tempStyle.fontSize = `${number_fontsize}px`;
      if (number_fontcolor) tempStyle.color = number_fontcolor;
      return tempStyle;
    });

    // 处理值格式化
    const handleFormat = (value: number) => {
      const format = (props.model.measure as IAppBIReportMeasure)?.jsonFormat;
      if (format) return ibiz.util.text.format(String(value), format);
      return value;
    };

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

    return {
      ns,
      style,
      uiState,
      handleFormat,
      renderUpDownResult,
    };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('content')}>
          <div class={this.ns.em('content', 'number')}>
            <span
              class={this.ns.em('content', 'number-text')}
              style={this.style}
            >
              {this.handleFormat(this.uiState.currentTotal)}
            </span>
          </div>
          <div class={this.ns.em('content', 'compare')}>
            {this.model.number_yoy_show === 1 && (
              <div class={this.ns.em('content', 'yoy')}>
                <div class={this.ns.em('content', 'compare-number')}>
                  <span>同比</span>
                  <span
                    class={[
                      this.ns.em('content', 'yoy-yoyTotal'),
                      this.ns.is(
                        'show',
                        this.model.number_yoy_value?.includes('orgin'),
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
                        this.model.number_yoy_value?.includes('difference'),
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

            {this.model.number_qoq_show === 1 && (
              <div class={this.ns.em('content', 'qoq')}>
                <div class={this.ns.em('content', 'compare-number')}>
                  <span>环比</span>
                  <span
                    class={[
                      this.ns.em('content', 'qoq-qoqTotal'),
                      this.ns.is(
                        'show',
                        this.model.number_qoq_value?.includes('orgin'),
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
                        this.model.number_qoq_value?.includes('difference'),
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
