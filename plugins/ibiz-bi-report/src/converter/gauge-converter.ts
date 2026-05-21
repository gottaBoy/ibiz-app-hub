import { IAppBIReport, IAppBIReportMeasure } from '@ibiz/model-core';
import { IChartModelParams } from '../interface';
import { deepHandData, formatField } from '../util';
import { BaseConverter } from './base-converter';

/**
 * 仪表盘转化器
 *
 * @export
 * @class GaugeConverter
 * @implements {IChartConverter}
 */
export class GaugeConverter extends BaseConverter {
  /**
   * 翻译数据到模型
   *
   * @param {(IAppBIReport | undefined)} data
   * @param {IModel} model
   * @param {IData} [opts={}]
   * @return {*}  {(Promise<IModel | undefined>)}
   * @memberof GaugeConverter
   */
  async translateDataToModel(
    data: IAppBIReport | undefined,
    model: IModel,
    opts: IData = {},
  ): Promise<IModel | undefined> {
    const { appDataEntityId, items, mode } = opts;
    if (!appDataEntityId || !model || !data) return;
    if (!data.appBIReportMeasures) return model;
    const input = {
      appId: data.appId || ibiz.env.appId,
      appDataEntityId,
      caption: data.name,
      catalog: '$catalog',
      value: data.appBIReportMeasures?.[0].measureTag!,
    };
    deepHandData(model, (str: string) => {
      return formatField(str, input);
    });
    if (data) {
      const { params, seriesParams } = this.transform(data, items);
      Object.assign(model, { userParam: params });

      model.dechartSerieses?.forEach((series: IData) => {
        Object.assign(series, {
          userParam: seriesParams,
        });
      });
    }
    if (mode === 'CONTENT') {
      const tempDetails = data.appBIReportMeasures.map(
        (item: IAppBIReportMeasure) => {
          return {
            name: item.measureTag,
            isDrill: !!item.drillDetailAppViewId,
          };
        },
      );
      Object.assign(model, {
        controlParam: {
          ctrlParams: { ENABLEDRILLDETAIL: tempDetails },
        },
      });
    }

    return model;
  }

  /**
   * 转换模型自定义参数
   *
   * @param {IAppBIReport} config
   * @param {IData[]} _items
   * @return {*}  {IChartModelParams}
   * @memberof GaugeConverter
   */
  transform(config: IAppBIReport, _items: IData[]): IChartModelParams {
    const params: IData = {
      'EC.color': JSON.stringify([]),
    };
    const { reportUIModel, appBIReportMeasures } = config;
    let tag = false;
    if (appBIReportMeasures![0].jsonFormat) {
      tag = true;
    }
    const seriesParams: IData = {
      'EC.type': 'gauge',
      'EC.radius': '90%',
      'EC.startAngle': '220',
      'EC.endAngle': '-40',
      'EC.splitNumber': '4',
      'EC.tooltip': `{
        formatter:function(param){
          let value = param.value[0];
          if(${tag}){
            value = ibiz.util.text.format(String(value), '${
              appBIReportMeasures![0].jsonFormat
            }') || value;
          }
          return "<div style='min-width:150px'><div>"+ param.seriesId +"</div><div><span style='margin-right:16px'>"+ param.marker + param.name+"</span>"+ value+"</div></div>"
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
    const axisParams: IData = {};

    let style;
    if (reportUIModel) {
      const reportUIModelObject = JSON.parse(reportUIModel);
      if (reportUIModelObject.style) {
        style = reportUIModelObject.style;
      }
    }

    if (style) {
      const { graphics, fontSetting, featureSetting } = style;
      if (graphics) {
        if (graphics.color && typeof graphics.color === 'string') {
          params['EC.color'] = JSON.stringify([graphics.color]);
        }
        if (Array.isArray(graphics.color)) {
          params['EC.color'] = JSON.stringify(graphics.color);
        }
      }
      if (fontSetting) {
        const { fontWeight, fontStyle, fontSize, color } =
          fontSetting.font || {};
        seriesParams['EC.detail'] = JSON.stringify({
          offsetCenter: [0, '60%'],
          fontWeight,
          fontStyle,
          fontSize,
          color,
          formatter: `function (value) {
            let tempValue = value;
            if('${appBIReportMeasures![0].jsonFormat}' !== 'undefined'){
              tempValue = ibiz.util.text.format(String(value), '${
                appBIReportMeasures![0].jsonFormat
              }')
            }
            return tempValue;
          }`,
        });
      }
      if (featureSetting) {
        const { endpoint } = featureSetting;
        seriesParams['EC.max'] = JSON.stringify(endpoint);
        seriesParams['EC.axisLabel'] = JSON.stringify({
          distance: 76,
          color: '#333',
          fontSize: 12,
          formatter: `function (num){return (num * 100) / '${endpoint}' + '%' }`,
        });
      }
    }

    return {
      params,
      seriesParams,
      axisParams,
    };
  }
}
