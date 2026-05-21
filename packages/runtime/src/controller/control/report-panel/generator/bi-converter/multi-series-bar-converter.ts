import { BarConverterBase } from './base';

/**
 * @description 多序列条形图转换器
 * @export
 * @class MultiSeriesBarConverter
 * @extends {BarConverterBase}
 */
export class MultiSeriesBarConverter extends BarConverterBase {
  /**
   * @description 仿真模型
   * @type {IModel}
   * @memberof MultiSeriesBarConverter
   */
  mockModel: IModel = {
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
    userParam: {},
  };

  /**
   * @description 仿真序列模型
   * @type {IModel}
   * @memberof MultiSeriesBarConverter
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
    seriesType: 'bar',
    echartsType: 'bar',
    chartDataSetId: '0',
    seriesLayoutBy: 'column',
    enableChartDataSet: true,
    chartCoordinateSystemId: '0',
    appId: this.appBIReport.appId,
  };
}
