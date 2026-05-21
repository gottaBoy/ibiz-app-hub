/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-param-reassign */
import { clone } from 'ramda';
import { IAppBIReport, IAppBIReportMeasure } from '@ibiz/model-core';
import { IChartModelParams } from '../interface';
import {
  deepHandData,
  formatField,
  handleGroupToSeries,
  handleSerieGroupTip,
  handleSeriesCodeList,
} from '../util';
import { BaseConverter } from './base-converter';

/**
 * 折线图转换器
 *
 * @export
 * @class MultiSeriesLineConverter
 * @implements {IChartConverter}
 */
export class MultiSeriesLineConverter extends BaseConverter {
  /**
   * 通过数据翻译模型
   *
   * @param {(IData | undefined)} data
   * @param {IModel} model
   * @param {IData} [opts={}]
   * @return {*}  {(Promise<IModel | undefined>)}
   * @memberof MultiSeriesLineConverter
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
    };
    deepHandData(model, (str: string) => {
      return formatField(str, input);
    });
    model.dechartSerieses = [];
    const serieModel = {
      caption: 'srfCaption',
      catalogField: 'srfCatalogField',
      echartsType: 'line',
      chartCoordinateSystemId: '0',
      chartDataSetId: '0',
      chartSeriesEncode: {
        chartXAxisId: '0',
        chartYAxisId: '0',
        x: ['srfCatalogField'],
        y: ['srfValue'],
        type: 'XY',
        name: '坐标系编码',
        id: '0',
        appId: 'srfAppId',
      },
      seriesLayoutBy: 'column',
      seriesType: 'line',
      valueField: 'srfValue',
      serieText: 'srfSerieText',
      catalogName: 'srfCatalogName',
      enableChartDataSet: true,
      // id: `line_${index}`,
      appId: 'srfAppId',
    };

    let uiModel: IData = {};
    if (data.reportUIModel) {
      uiModel = JSON.parse(data.reportUIModel);
    }

    let serieGroup: IData[] = [];
    if (uiModel && uiModel.group && Array.isArray(uiModel.group)) {
      serieGroup = handleGroupToSeries(
        uiModel.group,
        data.appBIReportDimensions,
        data.appId || ibiz.env.appId,
      );
    }
    const models = handleSeriesCodeList(
      data.appBIReportMeasures,
      serieModel,
      {
        appDataEntityId,
        caption: data!.name,
        dimension: data.appBIReportDimensions[0],
        appId: data.appId || ibiz.env.appId,
      },
      (_serieModel: IData): void => {
        if (serieGroup && serieGroup.length) {
          const group = serieGroup[0];
          Object.assign(_serieModel, {
            seriesCodeListId: group.appCodeListId,
            seriesField: group.measureTag,
          });
        }
      },
    );
    model.dechartSerieses.push(...models);

    if (data) {
      const { params, seriesParams } =
        this.transformStyle(data, serieGroup, chartid) || {};
      Object.assign(model, { userParam: params });
      model.dechartSerieses?.forEach((series: any) => {
        Object.assign(series, {
          userParam: {
            ...this.computeAxisLayout(series, uiModel),
            ...this.computeMaxMin(seriesParams, items, series),
            ...handleSerieGroupTip(serieGroup, series),
          },
        });
      });

      const tempCtrlParams: IData = {};
      if (mode === 'CONTENT') {
        const tempDetails = data.appBIReportMeasures.map(
          (item: IAppBIReportMeasure) => {
            return {
              name: item.measureTag,
              isDrill: !!item.drillDetailAppViewId,
            };
          },
        );
        Object.assign(tempCtrlParams, { ENABLEDRILLDETAIL: tempDetails });
      }

      let tag = false;
      const dimens = data.appBIReportDimensions
        .filter((item: IData) => {
          if (serieGroup.length && !tag) {
            const group = serieGroup[0].measureTag;
            if (item.dimensionTag !== group) {
              return true;
            }
            tag = true;
            return false;
          }
          return true;
        })
        .map((item: IData) => {
          return {
            sort: uiModel.extend?.[`sort@${item.dimensionTag}`],
            codename: item.dimensionTag,
            name: item.dimensionName,
            mode: item.appCodeListId ? 'codelist' : 'field',
            codelistId: item.appCodeListId,
          };
        });
      Object.assign(tempCtrlParams, {
        CATALOGFIELDS: JSON.stringify(dimens),
        NOSORT: true,
        chartid,
      });

      Object.assign(model, {
        controlParam: {
          ctrlParams: tempCtrlParams,
        },
      });
    }

    return model;
  }

  /**
   * 计算最大，最小值
   *
   * @param {*} series
   * @param {IData} seriesParams
   * @param {IData} _items
   * @param {string} _valueCode
   * @return {*}
   * @memberof MultiSeriesLineConverter
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
        .map((item: IData) => Number(item[_valueCode]) || 0);
      const max = Math.max(...numbers) || 0;
      const min = Math.min(...numbers) || 0;
      option.formatter = `function(param) {
        if(param.value[1] === ${max} || param.value[1] === ${min}){
          if('${series.jsonFormat}' !== 'undefined'){
            value = ibiz.util.text.format(String(param.value[1]), '${series.jsonFormat}')
            return value;
          } 
          return param.value[1];
        }
        return '';
          }`;
    }
    if (option && option.scope === 'all') {
      option.formatter = `function(param) {
        if('${series.jsonFormat}' !== 'undefined'){
          value = ibiz.util.text.format(String(param.value[1]), '${series.jsonFormat}')
          return value;
        }  
        return param.value[1];
      }`;
    }
    return { ...seriesParams, 'EC.label': JSON.stringify(option) };
  }

  /**
   * 转化折线图样式
   *
   * @param {IData} config
   * @return {*}  {IChartModelParams}
   * @memberof MultiSeriesLineConverter
   */
  transformStyle(
    config: IData,
    serieGroup: IData[] | undefined,
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
      const { graphics, label, legend, xAxis, yAxis } = style;
      if (graphics) {
        if (Array.isArray(graphics.color) && graphics.color.length) {
          params['EC.color'] = JSON.stringify(graphics.color);
        }
      }
      if (label) {
        const options: IData = {
          show: !!label.show,
          scope: label.scope,
          formatter: `function(param) {
            return param.value[1];
          }`,
          position: label.position,
          ...label.font,
        };

        seriesParams['EC.label'] = JSON.stringify(options);
      }
      if (legend) {
        let groupId: string | undefined = '';
        if (serieGroup && serieGroup.length > 0) {
          groupId = serieGroup[0].measureTag;
        }
        const options: IData = {
          show: !!legend.show,
          textStyle: legend.font,
          icon: 'circle',
          formatter: `function(param){
            const chartData = JSON.parse(localStorage.getItem('${chartid}'));
            let legendtext = param;
            if('${groupId}' && chartData && chartData['${groupId}']){
              legendtext = chartData['${groupId}'][param]
            }
            return legendtext;
          }`,
        };
        if (legend.position) {
          Object.assign(options, this.getLegendOPtions(legend.position));
        }
        params['EC.legend'] = JSON.stringify(options);
      }
      if (xAxis) {
        const {
          show,
          showTitle,
          titleFont,
          showLabel,
          labelFont,
          showAxisline,
          axisline,
          showGridline,
          gridline,
          enableLabelInterval,
          labelInterval,
        } = xAxis;
        let tempname: string | undefined = '';
        if (showTitle) {
          // 显示标题时，传undefined,实际标题由模板进行拼接
          tempname = undefined; //
        } else {
          // 传递 空字符串 ，不显示标题
          tempname = '';
        }
        const options: IData = {
          show: !!show,
          type: 'category',
          name: tempname,
          nameTextStyle: {
            ...titleFont,
          },
          axisLabel: {
            show: !!showLabel, // 显示轴标签
            interval: enableLabelInterval ? labelInterval : 'auto',
            ...this.axisLabel(),
            ...labelFont,
            ...this.computeLabelEllipsis(enableLabelInterval, labelInterval),
          },
          axisLine: {
            show: !!showAxisline, // 显示轴线
            lineStyle: {
              type:
                axisline.borderStyle === 'doubleDashed'
                  ? [15]
                  : axisline.borderStyle, // 将轴线设置为虚线
              width: axisline.borderSize,
              color: axisline.color, // 轴线颜色
            },
          },
          splitLine: {
            show: !!showGridline,
            lineStyle: {
              type:
                gridline.borderStyle === 'doubleDashed'
                  ? [15]
                  : gridline.borderStyle, // 将轴线设置为虚线
              width: gridline.borderSize,
              color: gridline.color, // 轴线颜色
            },
          },
        };
        params['EC.xAxis'] = JSON.stringify(options);
      }
      if (yAxis) {
        const {
          show,
          showTitle,
          titleFont,
          showLabel,
          labelFont,
          showAxisline,
          axisline,
          showGridline,
          gridline,
        } = yAxis;
        const options: IData = {
          show: !!show,
          type: 'value',
          showTitle,
          nameTextStyle: {
            ...titleFont,
          },
          axisLabel: {
            show: !!showLabel, // 显示轴标签
            ...labelFont,
          },
          axisLine: {
            show: !!showAxisline, // 显示轴线
            lineStyle: {
              type:
                axisline.borderStyle === 'doubleDashed'
                  ? [15]
                  : axisline.borderStyle, // 将轴线设置为虚线
              width: axisline.borderSize,
              color: axisline.color, // 轴线颜色
            },
          },
          splitLine: {
            show: !!showGridline,
            lineStyle: {
              type:
                gridline.borderStyle === 'doubleDashed'
                  ? [15]
                  : gridline.borderStyle, // 将轴线设置为虚线
              width: gridline.borderSize,
              color: gridline.color, // 轴线颜色
            },
          },
        };
        params['EC.yAxis'] = JSON.stringify(options);
      }
      params['EC.grid'] = this.getDefaultGridOptions(legend?.position);
    }

    return {
      params,
      seriesParams,
      axisParams,
    };
  }
}
