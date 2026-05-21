/* eslint-disable camelcase */
import { MultiSeriesConverter } from './base';

/**
 * @description 多序列折线图转换器
 * @export
 * @class MultiSeriesLineConverter
 * @extends {MultiSeriesConverter}
 */
export class MultiSeriesLineConverter extends MultiSeriesConverter {
  /**
   * @description 仿真模型
   * @type {IModel}
   * @memberof MultiSeriesLineConverter
   */
  mockModel: IModel = {
    userParam: {},
    dechartLegend: {
      id: 'legend',
      showLegend: false,
      appId: this.appBIReport.appId,
    },
    dechartTitle: {
      id: 'title',
      showTitle: false,
      appId: this.appBIReport.appId,
    },
    chartXAxises: [
      {
        id: '0',
        type: 'category',
        position: 'bottom',
        echartsPos: 'xAxis',
        name: 'axis_xAxis_0',
        echartsType: 'category',
        appId: this.appBIReport.appId,
      },
    ],
    chartYAxises: [
      {
        id: '0',
        type: 'numeric',
        position: 'left',
        echartsPos: 'yAxis',
        echartsType: 'value',
        name: 'axis_yAxis_0',
        appId: this.appBIReport.appId,
      },
    ],
    readOnly: true,
    autoLoad: true,
    dechartSerieses: [],
    controlType: 'CHART',
    showBusyIndicator: true,
    id: this.appBIReport.id,
    name: this.appBIReport.id,
    appId: this.appBIReport.appId,
    codeName: this.appBIReport.id,
    caption: this.appBIReport.name,
    logicName: this.appBIReport.name,
    appDataEntityId: this.appBIReport.appDataEntityId,
  };

  /**
   * @description 仿真序列模型
   * @type {IModel}
   * @memberof MultiSeriesLineConverter
   */
  mockSerieModel: IModel = {
    chartSeriesEncode: {
      id: '0',
      type: 'XY',
      name: '坐标系编码',
      chartXAxisId: '0',
      chartYAxisId: '0',
      appId: this.appBIReport.appId,
    },
    seriesType: 'line',
    echartsType: 'line',
    chartDataSetId: '0',
    seriesLayoutBy: 'column',
    enableChartDataSet: true,
    chartCoordinateSystemId: '0',
    appId: this.appBIReport.appId,
  };

  /**
   * @description 获取标签参数
   * @param {IModel} seriesModel
   * @param {IData[]} items
   * @returns {*}  {IData}
   * @memberof MultiSeriesLineConverter
   */
  getChartLabelParams(seriesModel: IModel, items: IData[]): IData {
    const { series_label_position } = this.reportUIModel;
    const options = super.getChartLabelParams(seriesModel, items);
    const tempObj = JSON.parse(options['EC.label']);
    // 折线类图标签位置只有顶部或者底部两种选择
    tempObj.position =
      series_label_position === 'bottom' ? series_label_position : 'top';
    return { 'EC.label': JSON.stringify(tempObj) };
  }
}
