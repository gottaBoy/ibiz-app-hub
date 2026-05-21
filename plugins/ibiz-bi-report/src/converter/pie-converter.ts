/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-param-reassign */
import { clone } from 'ramda';
import {
  IAppBIReport,
  IAppBIReportDimension,
  IAppBIReportMeasure,
} from '@ibiz/model-core';
import { IChartModelParams } from '../interface';
import {
  deepHandData,
  formatField,
  handlePieSerieGroupTip,
  handleSeriesCodeList,
} from '../util';
import { BaseConverter } from './base-converter';

/**
 * 饼图转化器
 *
 * @author tony001
 * @date 2024-06-06 15:06:12
 * @export
 * @class PieConverter
 * @implements {IChartConverter}
 */
export class PieConverter extends BaseConverter {
  /**
   * 通过数据翻译模型
   *
   * @author tony001
   * @date 2024-06-06 16:06:46
   * @param {(IAppBIReport | undefined)} data
   * @param {IModel} model
   * @param {IData} [opts={}]
   * @return {*}  {(IModel | undefined)}
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
      caption: data!.name,
      catalog: data.appBIReportDimensions[0].dimensionTag!,
      value: data.appBIReportMeasures[0].measureTag!,
    };
    deepHandData(model, (str: string) => {
      return formatField(str, input);
    });
    model.dechartSerieses = [];
    const serieModel = {
      caption: 'srfCaption',
      catalogField: 'srfCatalogField',
      echartsType: 'pie',
      chartCoordinateSystemId: '0',
      chartDataSetId: '0',
      chartSeriesEncode: {
        category: 'srfCatalogField',
        value: 'srfValue',
        type: 'NONE',
        name: '坐标系编码',
        id: '0',
        appId: 'srfAppId',
      },
      seriesLayoutBy: 'column',
      seriesType: 'pie',
      valueField: 'srfValue',
      enableChartDataSet: true,
      id: 'pie_0',
      appId: 'srfAppId',
    };
    const models = handleSeriesCodeList(data.appBIReportMeasures, serieModel, {
      appDataEntityId,
      caption: data!.name,
      dimension: data.appBIReportDimensions[0],
      appId: data.appId || ibiz.env.appId,
    });
    model.dechartSerieses.push(...models);
    if (data) {
      const { params, seriesParams } =
        this.transformStyle(data, data.appBIReportDimensions[0], chartid) || {};
      Object.assign(model, { userParam: params });

      model.dechartSerieses?.forEach((series: any) => {
        Object.assign(series, {
          userParam: {
            ...this.computeMaxMin(seriesParams, items, series),
            ...handlePieSerieGroupTip(
              series,
              data.appBIReportMeasures!,
              data.appBIReportDimensions![0],
            ),
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
   *计算最大，最小值
   *
   * @param {*} series
   * @param {IData} seriesParams
   * @param {IData} _items
   * @param {string} _valueCode
   * @return {*}
   * @memberof PieConverter
   */
  computeMaxMin(seriesParams: IData, _items: IData, series: IData) {
    const option: IData = clone(JSON.parse(seriesParams['EC.label']));

    if (option && option.scope !== 'all') {
      const _valueCode = series.valueField;
      // 只显示最大最小值
      const numbers = _items
        .filter((item: IData) =>
          Object.prototype.hasOwnProperty.call(item, _valueCode),
        )
        .map((item: IData) => Number(item[_valueCode]));
      const max = Math.max(...numbers);
      const min = Math.min(...numbers);
      option.formatter = `function(param) {
        let tempName = param.name;
        const { data } = param;
        const getOrigin = (origin) => {
          if (origin && origin.$origin) {
            return getOrigin(origin.$origin);
          }
          return origin;
        };
        const origin = getOrigin(data.value[1].$origin);
        const chartData = JSON.parse(localStorage.getItem(data.value[1]._chartid));
        if(origin){
          const field = Object.keys(origin).find(key => {
            return origin[key] === param.name;
          })
          if(field && chartData && chartData[field]){
            tempName = chartData[field][param.name];
          }
        }else if(chartData){
          const _tempname = Object.keys(chartData).find(_chart => {
            return  chartData[_chart][param.name]
          })
          if(_tempname){
            tempName = chartData[_tempname][param.name]
          }
        }

        if(param.value[0] === ${max} || param.value[0] === ${min}){
          if(${option.percentage}){
            return tempName + '：（' + param.percent + '%' + '）';
          }
          if('${series.jsonFormat}' !== 'undefined'){
            value = ibiz.util.text.format(String(param.value[0]), '${series.jsonFormat}')
            return tempName + '：' + value;
          } 
          return tempName + '：' + param.value[0];
        }
        return '';
      }`;
    }
    if (option && option.scope === 'all') {
      option.formatter = `function(param) {
        let tempName = param.name;
        const { data } = param;
        const getOrigin = (origin) => {
          if (origin && origin.$origin) {
            return getOrigin(origin.$origin);
          }
          return origin;
        };
        const origin = getOrigin(data.value[1].$origin);
        const chartData = JSON.parse(localStorage.getItem(data.value[1]._chartid));
        if(origin){
          const field = Object.keys(origin).find(key => {
            return origin[key] === param.name;
          })
          if(field && chartData && chartData[field]){
            tempName = chartData[field][param.name];
          }
        }else if(chartData){
          const _tempname = Object.keys(chartData).find(_chart => {
            return  chartData[_chart][param.name]
          })
          if(_tempname){
            tempName = chartData[_tempname][param.name]
          }
        }

        if(${option.percentage}){
          return tempName + '：（' + param.percent + '%' + '）';
        }
        if('${series.jsonFormat}' !== 'undefined'){
          value = ibiz.util.text.format(String(param.value[0]), '${series.jsonFormat}')
          return tempName + '：' + value;
        } 
        return tempName + '：' + param.value[0];
      }`;
    }
    return {
      ...seriesParams,
      'EC.label': JSON.stringify(option),
    };
  }

  /**
   * 转换饼图样式
   *
   * @author tony001
   * @date 2024-06-12 18:06:38
   * @param {IAppBIReport} config
   * @return {*}  {IChartModelParams}
   */
  transformStyle(
    config: IAppBIReport,
    dimension: IAppBIReportDimension,
    chartid: string,
  ): IChartModelParams {
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
          percentage: label.percentage,
          ...label.font,
        };
        if (label.percentage) {
          options.formatter = `function(param) {
            let tempName = param.name;
            const { data } = param;
            const getOrigin = (origin) => {
              if (origin && origin.$origin) {
                return getOrigin(origin.$origin);
              }
              return origin;
            };
            const origin = getOrigin(data.value[1].$origin);
            const chartData = JSON.parse(localStorage.getItem(data.value[1]._chartid));
            const field = Object.keys(origin).find(key => {
              return origin[key] === param.name;
            })
            if(field && chartData[field]){
              tempName = chartData[field][param.name];
            }

            return tempName + '：（' + param.percent + '%' + '）';
            }`;
        } else {
          options.formatter = `function(param) {
            let tempName = param.name;
            const { data } = param;
            const getOrigin = (origin) => {
              if (origin && origin.$origin) {
                return getOrigin(origin.$origin);
              }
              return origin;
            };
            const origin = getOrigin(data.value[1].$origin);
            const chartData = JSON.parse(localStorage.getItem(data.value[1]._chartid));
            const field = Object.keys(origin).find(key => {
              return origin[key] === param.name;
            })
            if(field && chartData[field]){
              tempName = chartData[field][param.name];
            }

            return tempName + '：' + param.value[0];
          }`;
        }
        seriesParams['EC.label'] = JSON.stringify(options);
        if (label.scope !== 'all') {
          const labelLayout = function (_params: any) {
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
        if (!label.show) {
          seriesParams['EC.emphasis'] = JSON.stringify({
            label: false,
          });
        }
      }
      if (legend) {
        const options: IData = {
          show: !!legend.show,
          textStyle: legend.font,
          icon: 'circle',
          formatter: `function(param){
            const chartData = JSON.parse(localStorage.getItem('${chartid}'));
            let legendtext = param;
            if('${dimension.dimensionTag}' && chartData && chartData['${dimension.dimensionTag}']){
              legendtext = chartData['${dimension.dimensionTag}'][param]
            }
            return legendtext;
          }`,
        };
        if (legend.position) {
          Object.assign(options, this.getLegendOPtions(legend.position));
        }
        params['EC.legend'] = JSON.stringify(options);
        // 左上、右上、上时只改变底部
        if (['left-top', 'right-top', 'top'].includes(legend.position)) {
          seriesParams['EC.center'] = JSON.stringify(['50%', '60%']);
        }
        // 左下、右下、下时只改变顶部
        if (
          ['left-bottom', 'right-bottom', 'bottom'].includes(legend.position)
        ) {
          seriesParams['EC.center'] = JSON.stringify(['50%', '40%']);
        }
        // 左侧改变上下、右（饼图、雷达图）
        if (legend.position === 'left') {
          seriesParams['EC.center'] = JSON.stringify(['60%', '50%']);
        }
        // 右侧改变上下、左（饼图、雷达图）
        if (legend.position === 'right') {
          seriesParams['EC.center'] = JSON.stringify(['40%', '50%']);
        }
      }
    }

    return {
      params,
      seriesParams,
      axisParams,
    };
  }
}
