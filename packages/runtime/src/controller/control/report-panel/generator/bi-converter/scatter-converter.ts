import { MultiSeriesConverter } from './base';

/**
 * @description 散点图转换器
 * @export
 * @class ScatterConverter
 * @extends {MultiSeriesConverter}
 */
export class ScatterConverter extends MultiSeriesConverter {
  /**
   * @description 仿真模型
   * @type {IModel}
   * @memberof ScatterConverter
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
    id: this.appBIReport.id,
    showBusyIndicator: true,
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
   * @memberof ScatterConverter
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
    chartDataSetId: '0',
    seriesType: 'scatter',
    echartsType: 'scatter',
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
   * @memberof ScatterConverter
   */
  getChartLabelParams(seriesModel: IModel, items: IData[]): IData {
    const options = super.getChartLabelParams(seriesModel, items);
    const tempObj = JSON.parse(options['EC.label']);
    // 散点图标签位置固定在顶部
    tempObj.position = 'top';
    return { 'EC.label': JSON.stringify(tempObj) };
  }
}
