/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { clone } from 'ramda';
import { IAppBIReportDimension, IAppBIReportMeasure } from '@ibiz/model-core';
import { EchartConverterBase } from './base/echart-converter-base';

/**
 * @description 仪表盘转换器
 * @export
 * @class GaugeConverter
 * @extends {EchartConverterBase}
 */
export class GaugeConverter extends EchartConverterBase {
  /**
   * @description 仿真模型
   * @type {IModel}
   * @memberof GaugeConverter
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
   * @memberof GaugeConverter
   */
  mockSerieModel: IModel = {
    seriesType: 'gauge',
    echartsType: 'gauge',
    chartDataSetId: '0',
    seriesLayoutBy: 'column',
    enableChartDataSet: true,
    chartCoordinateSystemId: '0',
    appId: this.appBIReport.appId,
  };

  /**
   * @description 计算序列模型
   * @param {IAppBIReportMeasure[]} measures
   * @param {IAppBIReportDimension} dimension
   * @param {IAppBIReportDimension} [groupDimension]
   * @returns {*}  {IModel[]}
   * @memberof GaugeConverter
   */
  calcSeriesModel(
    measures: IAppBIReportMeasure[],
    dimension: IAppBIReportDimension,
    groupDimension?: IAppBIReportDimension,
  ): IModel[] {
    const seriesModels: IModel[] = [];
    measures.forEach((item, index) => {
      const seriesModel = clone(this.mockSerieModel);
      Object.assign(seriesModel, {
        id: `${seriesModel.seriesType}_${index}`,
        caption: item.measureName,
        serieText: item.measureName,
        catalogName: item.measureName,
        valueField: item.measureTag!.toLowerCase(),
        catalogField: item.measureTag!.toLowerCase(),
      });
      // 分组维度
      if (groupDimension)
        Object.assign(seriesModel, {
          seriesCodeListId: groupDimension.appCodeListId,
          seriesField: groupDimension.dimensionTag!.toLowerCase(),
        });
      seriesModels.push(seriesModel);
    });
    return seriesModels;
  }

  /**
   * @description 转化数据到报表
   * @param {IData[]} items
   * @returns {*}  {({ model: IModel; options: IData; data: IData[] } | undefined)}
   * @memberof GaugeConverter
   */
  translateDataToReport(
    items: IData[],
  ): { model: IModel; options: IData; data: IData[] } | undefined {
    if (!this.measures.length) return;
    const model = clone(this.mockModel);
    const seriesModels = this.calcSeriesModel(
      this.measures,
      this.dimensions[0],
      this.groupDimension,
    );
    if (model.dechartSerieses) model.dechartSerieses.push(...seriesModels);
    // 图表颜色
    const chartColorParams = this.getChartColorParams();
    Object.assign(model.userParam, chartColorParams);
    // 处理序列参数
    const serieParam = this.commputeSeriesParam();
    model.dechartSerieses?.forEach((series: IData) => {
      Object.assign(series, {
        userParam: serieParam,
      });
    });
    return { model, options: {}, data: items };
  }

  /**
   * @description 计算序列参数
   * @returns {*}  {IData}
   * @memberof GaugeConverter
   */
  commputeSeriesParam(): IData {
    const {
      series_max,
      series_detail_fontsize,
      series_detail_fontstyle,
      series_detail_fontcolor,
    } = this.reportUIModel;
    const seriesParams: IData = {
      'EC.radius': '90%',
      'EC.startAngle': '220',
      'EC.endAngle': '-40',
      'EC.splitNumber': '4',
      'EC.tooltip': `{
          formatter:function(param){
            return "<div style='min-width:150px'><div>"+ param.seriesId +"</div><div><span style='margin-right:16px'>"+ param.marker + param.name+"</span>"+ param.value+"</div></div>"
          }
        }`,
      'EC.axisTick':
        '{"splitNumber":5,"distance":5,"lineStyle":{"width":2,"color":"#ddd"}}',
      'EC.splitLine':
        '{"length":10,"distance":5,"lineStyle":{"width":2,"color":"#ddd"}}',
      'EC.title': '{"show":false}',
      'EC.pointer': '{"length":"50%"}',
      'EC.detail': '{"offsetCenter":[0,"60%"]}',
      'EC.progress': '{"show":true,"width":60}',
      'EC.axisLine':
        '{"lineStyle":{"width":60,"color":[[1,"rgb(245, 245, 245)"]]}}',
      'EC.axisLabel':
        '{"distance":76,"color":"#333","fontSize":12,"formatter": "function (num){return (num * 100) / 100 + `%` }"}',
    };

    const options: IData = {
      offsetCenter: [0, '60%'],
      fontSize: series_detail_fontsize,
      color: series_detail_fontcolor,
    };
    if (series_detail_fontstyle) {
      if (series_detail_fontstyle === 'bold') {
        options.fontWeight = series_detail_fontstyle;
      } else {
        options.fontWeight = 'normal';
        options.fontStyle = series_detail_fontstyle;
      }
    }
    seriesParams['EC.detail'] = JSON.stringify(options);
    if (series_max) {
      seriesParams['EC.max'] = JSON.stringify(series_max);
      seriesParams['EC.axisLabel'] = JSON.stringify({
        distance: 76,
        color: '#333',
        fontSize: 12,
        formatter: `function (num){return (num * 100) / '${series_max}' + '%' }`,
      });
    }
    return seriesParams;
  }
}
