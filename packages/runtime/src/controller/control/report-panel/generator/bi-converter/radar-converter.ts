/* eslint-disable eqeqeq */
/* eslint-disable camelcase */
/* eslint-disable no-unused-expressions */
import { MultiSeriesConverter } from './base';

/**
 * @description 雷达图转换器
 * @export
 * @class RadarConverter
 * @extends {MultiSeriesConverter}
 */
export class RadarConverter extends MultiSeriesConverter {
  /**
   * @description 仿真模型
   * @type {IModel}
   * @memberof RadarConverter
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
   * @memberof RadarConverter
   */
  mockSerieModel: IModel = {
    echartsType: 'radar',
    seriesType: 'radar',
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
   * @memberof RadarConverter
   */
  getChartLabelParams(seriesModel: IModel, items: IData[]): IData {
    const {
      series_label_show,
      series_label_fontstyle,
      series_label_fontsize,
      series_label_fontcolor,
      series_label_position,
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
        if(param.value === ${max} || param.value === ${min}){
          return param.value;
        }
        return '';
      }`;
    }
    if (series_label_data_range && series_label_data_range === 'all') {
      options.formatter = `function(param) {
        return param.value;
      }`;
    }
    return { 'EC.label': JSON.stringify(options) };
  }

  /**
   * @description 转化数据到报表
   * @param {IData[]} items
   * @returns {*}  {({ model: IModel; options: IData; data: IData[] } | undefined)}
   * @memberof RadarConverter
   */
  translateDataToReport(
    items: IData[],
  ): { model: IModel; options: IData; data: IData[] } | undefined {
    const report = super.translateDataToReport(items);
    if (!report) return;
    const { model } = report;
    // 图表颜色
    const chartColorParams = this.getChartColorParams();
    Object.assign(model.userParam, chartColorParams);
    // 图例参数
    const legendParams = this.getChartLegendParams();
    Object.assign(model.userParam, legendParams);
    // 处理序列参数
    model.dechartSerieses?.forEach((series: IData) => {
      Object.assign(series, {
        userParam: {
          ...this.getChartLabelParams(series, items),
          'EC.name': series.serieText,
        },
      });
    });
    return report;
  }
}
