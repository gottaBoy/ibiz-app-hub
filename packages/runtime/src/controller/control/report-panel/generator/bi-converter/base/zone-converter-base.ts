import { clone } from 'ramda';
import { IAppBIReportDimension, IAppBIReportMeasure } from '@ibiz/model-core';
import { MultiSeriesConverter } from './multi-series-converter';

/**
 * @description 分区图表基类转换器
 * @export
 * @class ZoneConverterBase
 * @extends {MultiSeriesConverter}
 */
export class ZoneConverterBase extends MultiSeriesConverter {
  /**
   * @description 获取控件参数
   * @returns {*}  {IData}
   * @memberof ZoneConverterBase
   */
  getChartControlParams(): IData {
    const ctrlParams = super.getChartControlParams();
    Object.assign(ctrlParams, { ZONE: true });
    return ctrlParams;
  }

  /**
   * @description 计算X轴参数
   * @returns {*}  {IData}
   * @memberof ZoneConverterBase
   */
  getChartXAxisParams(): IData {
    const option = super.getChartXAxisParams();
    const tempOption = JSON.parse(option['EC.xAxis']);
    Object.assign(tempOption, {
      axisTick: {
        show: true, // 坐标轴刻度线，模板会计算，不是最后一个的坐标系刻度线都会隐藏
      },
    });

    return { 'EC.xAxis': JSON.stringify(tempOption) };
  }

  /**
   * @description 计算Y轴参数
   * @returns {*}  {IData}
   * @memberof ZoneConverterBase
   */
  getChartYAxisParams(): IData {
    const option = super.getChartYAxisParams();
    const tempOption = JSON.parse(option['EC.yAxis']);
    Object.assign(tempOption, {
      nameLocation: 'center',
      nameGap: 50,
    });
    Object.assign(tempOption.axisLabel, {
      width: 100,
      lineHeight: 1,
      rich: {
        top: {
          padding: [0, 0, 15, 0],
        },
        bottom: {
          padding: [10, 0, 0, 0],
        },
      },
    });

    return { 'EC.yAxis': JSON.stringify(tempOption) };
  }

  /**
   * @description 计算序列模型
   * @param {IAppBIReportMeasure[]} measures 指标
   * @param {IAppBIReportDimension} dimension 维度
   * @param {IAppBIReportDimension} [groupDimension] 分组维度
   * @returns {*}  {IModel[]}
   * @memberof ZoneConverterBase
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
        catalogName: dimension.dimensionName,
        valueField: item.measureTag!.toLowerCase(),
        catalogCodeListId: dimension.appCodeListId,
        catalogField: dimension.dimensionTag!.toLowerCase(),
      });
      // 设置分区坐标轴
      Object.assign(seriesModel.chartSeriesEncode, {
        chartXAxisId: index,
        chartYAxisId: index,
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
}
