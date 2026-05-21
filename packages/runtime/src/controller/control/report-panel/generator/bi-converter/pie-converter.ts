/* eslint-disable eqeqeq */
/* eslint-disable camelcase */
/* eslint-disable func-names */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { MultiSeriesConverter } from './base';

/**
 * @description 饼图转换器
 * @export
 * @class PieConverter
 * @extends {MultiSeriesConverter}
 */
export class PieConverter extends MultiSeriesConverter {
  /**
   * @description 仿真模型
   * @type {IModel}
   * @memberof PieConverter
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
   * @memberof PieConverter
   */
  mockSerieModel: IModel = {
    seriesType: 'pie',
    echartsType: 'pie',
    chartCoordinateSystemId: '0',
    chartDataSetId: '0',
    seriesLayoutBy: 'column',
    enableChartDataSet: true,
    appId: this.appBIReport.appId,
  };

  /**
   * @description 转化数据到报表
   * @param {IData[]} items
   * @returns {*}  {({ model: IModel; options: IData; data: IData[] } | undefined)}
   * @memberof PieConverter
   */
  translateDataToReport(
    items: IData[],
  ): { model: IModel; options: IData; data: IData[] } | undefined {
    const report = super.translateDataToReport(items);
    if (!report) return;
    const { model } = report;
    // 图例参数
    const legendParams = this.getChartLegendParams();
    Object.assign(model.userParam, legendParams);

    // 图表颜色
    const chartColorParams = this.getChartColorParams();
    Object.assign(model.userParam, chartColorParams);

    // 处理序列参数
    model.dechartSerieses?.forEach((series: IData) => {
      Object.assign(series, {
        userParam: {
          ...this.getChartLabelParams(series, items),
        },
      });
    });
    return report;
  }

  /**
   * @description  获取标签参数
   * @param {IModel} seriesModel
   * @param {IData[]} items
   * @returns {*}  {IData}
   * @memberof PieConverter
   */
  getChartLabelParams(seriesModel: IModel, items: IData[]): IData {
    const { series_label_data_range, series_label_percentage } =
      this.reportUIModel;
    const tempOption = super.getChartLabelParams(seriesModel, items);
    const options = JSON.parse(tempOption['EC.label']);
    const labelLayoutOption: IData = {};
    delete options.position;
    if (series_label_data_range && series_label_data_range !== 'all') {
      // 展示最大最小值的时候没有展示的label要连同引导线一起不展示
      const labelLayout = function (_params: IData) {
        if (_params.text == '') {
          return {
            height: 0,
            labelLinePoints: [0, 0],
          };
        }
      };
      Object.assign(labelLayoutOption, { 'EC.labelLayout': labelLayout });
      const { min, max } = this.calcMaxMin(seriesModel, items);
      options.formatter = `function(param) {
        let tempName = param.name;
        const { data } = param;
        if(param.value[0] === ${max} || param.value[0] === ${min}){
          if(${series_label_percentage} == '1'){
            return tempName + '：（' + param.percent + '%' + '）';
          }
          return tempName + '：' + param.value[0];
        }
        return '';
      }`;
    }
    if (series_label_data_range && series_label_data_range === 'all') {
      options.formatter = `function(param) {
        let tempName = param.name;
        const { data } = param;        
        if(${series_label_percentage} == '1'){
          return tempName + '：（' + param.percent + '%' + '）';
        }
        return tempName + '：' + param.value[0];
      }`;
    }
    return {
      'EC.label': JSON.stringify(options),
      ...labelLayoutOption,
    };
  }
}
