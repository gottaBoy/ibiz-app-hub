/* eslint-disable eqeqeq */
/* eslint-disable camelcase */
/* eslint-disable no-unused-expressions */
import { ChartUtil } from '../utils';
import { MultiSeriesConverter } from './multi-series-converter';

/**
 * @description 条形图转换器基类
 * @export
 * @class BarConverterBase
 * @extends {MultiSeriesConverter}
 */
export class BarConverterBase extends MultiSeriesConverter {
  /**
   * @description 获取控件参数
   * @returns {*}  {IData}
   * @memberof BarConverterBase
   */
  getChartControlParams(): IData {
    const ctrlParams = super.getChartControlParams();
    Object.assign(ctrlParams, { MODE: 'ROW' });
    return ctrlParams;
  }

  /**
   * @description 计算X轴参数
   * @returns {*}  {IData}
   * @memberof BarConverterBase
   */
  getChartXAxisParams(): IData {
    const option = super.getChartXAxisParams();
    const tempOption = JSON.parse(option['EC.xAxis']);
    Object.assign(tempOption, {
      type: 'value',
      nameLocation: 'center',
    });
    Object.assign(tempOption.nameTextStyle, {
      lineHeight: 60,
    });
    tempOption.axisLabel.formatter = null;
    return { 'EC.xAxis': JSON.stringify(tempOption) };
  }

  /**
   * @description 计算Y轴参数
   * @returns {*}  {IData}
   * @memberof BarConverterBase
   */
  getChartYAxisParams(): IData {
    const { yaxis_name } = this.reportUIModel;
    const option = super.getChartYAxisParams();
    const tempOption = JSON.parse(option['EC.yAxis']);
    // 显示标题时，传undefined,实际标题由模板进行拼接,传递 空字符串 ，不显示标题
    let tempName: string | undefined = '';
    if (yaxis_name == '1') {
      tempName = undefined;
    }
    Object.assign(tempOption, {
      type: 'category',
      name: tempName,
    });
    Object.assign(tempOption.axisLabel, {
      ...ChartUtil.xAxisLabel(),
    });

    return { 'EC.yAxis': JSON.stringify(tempOption) };
  }

  /**
   * @description 获取标签参数
   * @param {IModel} seriesModel
   * @param {IData[]} items
   * @returns {*}  {IData}
   * @memberof BarConverterBase
   */
  getChartLabelParams(seriesModel: IModel, items: IData[]): IData {
    const {
      series_label_show,
      series_label_fontsize,
      series_label_position,
      series_label_fontstyle,
      series_label_fontcolor,
      series_label_data_range,
    } = this.reportUIModel;

    const options: IData = {
      show: series_label_show == '1',
      position: series_label_position,
    };

    // 标签（字体样式）
    if (series_label_fontstyle) {
      series_label_fontstyle === 'bold'
        ? (options.fontWeight = series_label_fontstyle)
        : (options.fontStyle = series_label_fontstyle);
    }

    if (series_label_fontsize) {
      options.fontSize = Number(series_label_fontsize);
    }
    if (series_label_fontcolor) {
      options.color = series_label_fontcolor;
    }

    // 显示数据范围
    if (series_label_data_range && series_label_data_range !== 'all') {
      const { min, max } = this.calcMaxMin(seriesModel, items);
      options.formatter = `function(param) {      
        if(param.value[0] === ${max} || param.value[0] === ${min}){
          return param.value[0];
        }
        return '';
      }`;
    }
    if (series_label_data_range && series_label_data_range === 'all') {
      options.formatter = `function(param) {
        return param.value[0];
      }`;
    }
    return { 'EC.label': JSON.stringify(options) };
  }
}
