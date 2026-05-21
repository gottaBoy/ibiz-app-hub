/* eslint-disable no-param-reassign */
import { clone } from 'ramda';
import { IAppBIReport, IAppBIReportMeasure } from '@ibiz/model-core';
import { IChartModelParams } from '../interface';
import { deepHandData, formatField, handleSeriesCodeList } from '../util';
import { BaseConverter } from './base-converter';

/**
 * 雷达图转换器
 *
 * @export
 * @class RadarConverter
 * @extends {BaseConverter}
 */
export class RadarConverter extends BaseConverter {
  /**
   * 数据转模型
   *
   * @param {(IAppBIReport | undefined)} data
   * @param {IModel} model
   * @param {IData} [opts={}]
   * @return {*}  {(Promise<IModel | undefined>)}
   * @memberof RadarConverter
   */
  async translateDataToModel(
    data: IAppBIReport | undefined,
    model: IModel,
    opts: IData = {},
  ): Promise<IModel | undefined> {
    const { appDataEntityId, items, mode, chartid } = opts;
    if (!data || !model || !appDataEntityId) return;
    if (!data.appBIReportDimensions || !data.appBIReportMeasures) return model;
    const input = {
      appId: data.appId || ibiz.env.appId,
      appDataEntityId,
      caption: data.name,
      catalog: data.appBIReportDimensions[0].dimensionTag!,
      value: data.appBIReportMeasures[0].measureTag!,
    };
    deepHandData(model, (str: string) => {
      return formatField(str, input);
    });
    model.dechartSerieses = [];
    const serieModel = {
      caption: 'srfSerieText',
      catalogField: 'srfCatalogField',
      echartsType: 'radar',
      chartCoordinateSystemId: '0',
      chartDataSetId: '0',
      seriesLayoutBy: 'column',
      seriesType: 'radar',
      valueField: 'srfValue',
      enableChartDataSet: true,
      id: 'radar_0',
      appId: 'srfAppId',
    };
    const models = handleSeriesCodeList(data.appBIReportMeasures, serieModel, {
      appDataEntityId,
      caption: data.name,
      dimension: data.appBIReportDimensions[0],
      appId: data.appId || ibiz.env.appId,
    });
    model.dechartSerieses.push(...models);
    if (data) {
      const { params, seriesParams } = this.transformStyle(data) || {};
      Object.assign(model, { userParam: params });

      model.dechartSerieses?.forEach((series: IData) => {
        Object.assign(series, {
          userParam: {
            ...this.computeMaxMin(seriesParams, items, series),
          },
        });
      });
      const tempParams: IData = {};
      if (mode === 'CONTENT') {
        const tempDetails = data.appBIReportMeasures.map(
          (item: IAppBIReportMeasure) => {
            return {
              name: item.measureTag,
              isDrill: !!item.drillDetailAppViewId,
            };
          },
        );
        Object.assign(tempParams, {
          ENABLEDRILLDETAIL: tempDetails,
        });
      }
      Object.assign(model, {
        controlParam: {
          ctrlParams: {
            ...tempParams,
            chartid,
          },
        },
      });
    }
    return model;
  }

  /**
   * 计算最大最小值
   *
   * @param {IData} seriesParams
   * @param {IData} _items
   * @param {string} _valueCode
   * @return {*}
   * @memberof RadarConverter
   */
  computeMaxMin(seriesParams: IData, _items: IData, series: IData) {
    const option: IData = clone(JSON.parse(seriesParams['EC.label']));
    if (option && option.scope !== 'all') {
      const _valueCode = series.valueField;
      // 只显示最大最小值
      const numbers = _items
        .filter((_item: IData) =>
          Object.prototype.hasOwnProperty.call(_item, _valueCode),
        )
        .map((item: IData) => Number(item[_valueCode]));
      const max = Math.max(...numbers);
      const min = Math.min(...numbers);
      option.formatter = `function(param) {
        if(param.value === ${max} || param.value === ${min}){
          if('${series.jsonFormat}' !== 'undefined'){
            value = ibiz.util.text.format(String(param.value), '${series.jsonFormat}')
            return value;
          } 
          return param.value;
        }
        return '';
          }`;
    }
    if (option && option.scope === 'all') {
      option.formatter = `function(param) {
        if('${series.jsonFormat}' !== 'undefined'){
          value = ibiz.util.text.format(String(param.value), '${series.jsonFormat}')
          return value;
        }  
        return param.value;
      }`;
    }
    return {
      ...seriesParams,
      'EC.label': JSON.stringify(option),
    };
  }

  /**
   * 转换雷达图样式
   *
   * @param {IAppBIReport} config 报表模型
   * @return {*}  {IChartModelParams}
   * @memberof RadarConverter
   */
  transformStyle(config: IAppBIReport): IChartModelParams {
    const params: IData = {};
    const seriesParams: IData = {};
    const axisParams: IData = {};

    let style;
    const { reportUIModel } = config;
    if (reportUIModel) {
      const reportUIModelObject = JSON.parse(reportUIModel);
      if (reportUIModelObject.style) {
        style = reportUIModelObject.style;
      }
    }

    seriesParams['EC.areaStyle'] = JSON.stringify({});
    params['EC.title'] = JSON.stringify({ show: false });
    if (style) {
      const { graphics, label, legend } = style;
      if (graphics) {
        if (Array.isArray(graphics.color) && graphics.color.length) {
          params['EC.color'] = JSON.stringify(graphics.color);
        }
      }
      if (label) {
        const options: IData = {
          show: !!label.show,
          scope: label.scope,
          ...label.font,
        };
        seriesParams['EC.label'] = JSON.stringify(options);
        if (label.scope !== 'all') {
          const labelLayout = function (_params: IData) {
            if (_params.text === '') {
              return {
                fontSize: 0,
                height: 0,
                labelLinePoints: [0, 0],
              };
            }
          };
          seriesParams['EC.labelLayout'] = labelLayout;
        }
      }
      if (legend) {
        const options: IData = {
          show: !!legend.show,
          textStyle: legend.font,
          icon: 'circle',
        };
        if (legend.position) {
          Object.assign(options, this.getLegendOPtions(legend.position));
        }
        params['EC.legend'] = JSON.stringify(options);
      }
    }

    return {
      params,
      seriesParams,
      axisParams,
    };
  }
}
