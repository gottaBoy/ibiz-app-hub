import { BarConverterBase } from './base';

/**
 * @description 堆叠条形图转换器
 * @export
 * @class StackBarConverter
 * @extends {BarConverterBase}
 */
export class StackBarConverter extends BarConverterBase {
  /**
   * @description 仿真模型
   * @type {IModel}
   * @memberof StackBarConverter
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
   * @memberof StackBarConverter
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

  /**
   * @description 转化数据到报表
   * @param {IData[]} items
   * @returns {*}  {({ model: IModel; options: IData; data: IData[] } | undefined)}
   * @memberof StackBarConverter
   */
  translateDataToReport(
    items: IData[],
  ): { model: IModel; options: IData; data: IData[] } | undefined {
    const report = super.translateDataToReport(items);
    if (report) {
      const { model } = report;
      // 处理序列参数-添加堆叠参数
      model.dechartSerieses?.forEach((series: IData) => {
        Object.assign(series.userParam, {
          'EC.stack': 'stackcol',
        });
      });
    }
    return report;
  }
}
