/* eslint-disable eqeqeq */
/* eslint-disable camelcase */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { IAppBIReportMeasure, IAppBIReportDimension } from '@ibiz/model-core';
import { clone } from 'ramda';
import { ChartUtil } from '../utils';
import { ConverterBase } from './converter-base';

/**
 * @description 图表基类转换器
 * @export
 * @abstract
 * @class EchartConverterBase
 * @extends {ConverterBase}
 */
export abstract class EchartConverterBase extends ConverterBase {
  /**
   * @description 仿真序列模型
   * @type {IModel}
   * @memberof EchartConverterBase
   */
  mockSerieModel: IModel = {};

  /**
   * @description 获取图表颜色参数
   * @returns {*}  {IData}
   * @memberof EchartConverterBase
   */
  getChartColorParams(): IData {
    const params: IData = {};
    // 图表颜色
    const { chart_color } = this.reportUIModel;
    if (chart_color) params[`EC.color`] = JSON.stringify(chart_color);
    return params;
  }

  /**
   * @description 获取图表X轴参数
   * @returns {*}  {IData}
   * @memberof EchartConverterBase
   */
  getChartXAxisParams(): IData {
    const {
      xaxis_name,
      xaxis_nametextstyle_fontstyle,
      xaxis_nametextstyle_fontsize,
      xaxis_nametextstyle_fontcolor,
      xaxis_axislabel_show,
      xaxis_axislabel_fontstyle,
      xaxis_axislabel_fontsize,
      xaxis_axislabel_fontcolor,
      xaxis_axisline_show,
      xaxis_axisline_linestyle_type,
      xaxis_axisline_linestyle_width,
      xaxis_axisline_linestyle_color,
      xaxis_splitline_show,
      xaxis_splitline_linestyle_type,
      xaxis_splitline_linestyle_width,
      xaxis_splitline_linestyle_color,
      xaxis_axislabel_interval,
    } = this.reportUIModel;

    // 显示标题时，传undefined,实际标题由模板进行拼接,传递 空字符串 ，不显示标题
    let tempName: string | undefined = '';
    if (xaxis_name == '1') {
      tempName = undefined;
    }
    const options: IData = {
      show: true,
      showTitle: xaxis_name == '1', // 分层时，模板需要根据这个字段计算对应的标题
      type: 'category',
      name: tempName, // 显示轴标题
      minorSplitLine: {
        show: false,
      },
    };
    // 横轴（轴标题）
    const nameTextStyle: IData = {};
    if (xaxis_nametextstyle_fontstyle) {
      xaxis_nametextstyle_fontstyle === 'bold'
        ? (nameTextStyle.fontWeight = xaxis_nametextstyle_fontstyle)
        : (nameTextStyle.fontStyle = xaxis_nametextstyle_fontstyle);
    }
    if (xaxis_nametextstyle_fontsize) {
      nameTextStyle.fontSize = xaxis_nametextstyle_fontsize;
    }
    if (xaxis_nametextstyle_fontcolor) {
      nameTextStyle.color = xaxis_nametextstyle_fontcolor;
    }
    options.nameTextStyle = nameTextStyle;

    // 横轴（轴标签）
    const axisLabel: IData = {
      show: xaxis_axislabel_show == '1',
      interval: xaxis_axislabel_interval || 'auto',
      ...ChartUtil.xAxisLabel(),
      ...ChartUtil.computeLabelEllipsis(xaxis_axislabel_interval),
    };
    if (xaxis_axislabel_fontstyle) {
      xaxis_axislabel_fontstyle === 'bold'
        ? (axisLabel.fontWeight = xaxis_axislabel_fontstyle)
        : (axisLabel.fontStyle = xaxis_axislabel_fontstyle);
    }

    if (xaxis_axislabel_fontsize) {
      axisLabel.fontSize = xaxis_axislabel_fontsize;
    }
    if (xaxis_axislabel_fontcolor) {
      axisLabel.color = xaxis_axislabel_fontcolor;
    }
    options.axisLabel = axisLabel;

    // 横轴（轴线）
    const axisLine: IData = {
      show: xaxis_axisline_show == '1',
      lineStyle: {
        type:
          xaxis_axisline_linestyle_type === 'doubleDashed'
            ? [15]
            : xaxis_axisline_linestyle_type,
        width: xaxis_axisline_linestyle_width,
        color: xaxis_axisline_linestyle_color, // 轴线颜色
      },
    };
    options.axisLine = axisLine;

    // 横轴（网格线）
    const splitLine: IData = {
      show: xaxis_splitline_show == '1',
      lineStyle: {
        type:
          xaxis_splitline_linestyle_type === 'doubleDashed'
            ? [15]
            : xaxis_splitline_linestyle_type,
        width: xaxis_splitline_linestyle_width,
        color: xaxis_splitline_linestyle_color, // 轴线颜色
      },
    };
    options.splitLine = splitLine;

    return { 'EC.xAxis': JSON.stringify(options) };
  }

  /**
   * @description 获取图表Y轴参数
   * @returns {*}  {IData}
   * @memberof EchartConverterBase
   */
  getChartYAxisParams(): IData {
    const {
      yaxis_name,
      yaxis_nametextstyle_fontstyle,
      yaxis_nametextstyle_fontsize,
      yaxis_nametextstyle_fontcolor,
      yaxis_axislabel_show,
      yaxis_axislabel_fontstyle,
      yaxis_axislabel_fontsize,
      yaxis_axislabel_fontcolor,
      yaxis_axisline_show,
      yaxis_axisline_linestyle_type,
      yaxis_axisline_linestyle_width,
      yaxis_axisline_linestyle_color,
      yaxis_splitline_show,
      yaxis_splitline_linestyle_type,
      yaxis_splitline_linestyle_width,
      yaxis_splitline_linestyle_color,
    } = this.reportUIModel;
    const options: IData = {
      show: true,
      type: 'value',
      showTitle: yaxis_name == '1',
      minorSplitLine: {
        show: false,
      },
    };
    // 纵轴（轴标题）
    const nameTextStyle: IData = {};
    yaxis_nametextstyle_fontstyle === 'bold'
      ? (nameTextStyle.fontWeight = yaxis_nametextstyle_fontstyle)
      : (nameTextStyle.fontStyle = yaxis_nametextstyle_fontstyle);
    if (yaxis_nametextstyle_fontsize) {
      nameTextStyle.fontSize = yaxis_nametextstyle_fontsize;
    }
    if (yaxis_nametextstyle_fontcolor) {
      nameTextStyle.color = yaxis_nametextstyle_fontcolor;
    }
    options.nameTextStyle = nameTextStyle;

    // 纵轴(轴标签)
    const axisLabel: IData = {
      show: yaxis_axislabel_show == '1',
    };
    if (yaxis_axislabel_fontstyle) {
      yaxis_axislabel_fontstyle === 'bold'
        ? (axisLabel.fontWeight = yaxis_axislabel_fontstyle)
        : (axisLabel.fontStyle = yaxis_axislabel_fontstyle);
    }

    if (yaxis_axislabel_fontsize) {
      axisLabel.fontSize = yaxis_axislabel_fontsize;
    }
    if (yaxis_axislabel_fontcolor) {
      axisLabel.color = yaxis_axislabel_fontcolor;
    }
    options.axisLabel = axisLabel;

    // 纵轴(轴线）
    const axisLine: IData = {
      show: yaxis_axisline_show == '1',
      lineStyle: {
        type:
          yaxis_axisline_linestyle_type === 'doubleDashed'
            ? [15]
            : yaxis_axisline_linestyle_type,
        width: yaxis_axisline_linestyle_width,
        color: yaxis_axisline_linestyle_color,
      },
    };
    options.axisLine = axisLine;

    // 纵轴(网格线)
    const splitLine: IData = {
      show: yaxis_splitline_show == '1',
      lineStyle: {
        type:
          yaxis_splitline_linestyle_type === 'doubleDashed'
            ? [15]
            : yaxis_splitline_linestyle_type,
        width: yaxis_splitline_linestyle_width,
        color: yaxis_splitline_linestyle_color, // 轴线颜色
      },
    };
    options.splitLine = splitLine;

    return { 'EC.yAxis': JSON.stringify(options) };
  }

  /**
   * @description 计算最大值最小值
   * @param {IModel} seriesModel
   * @param {IData[]} items
   * @returns {*}  {{ max: number; min: number }}
   * @memberof EchartConverterBase
   */
  calcMaxMin(
    seriesModel: IModel,
    items: IData[],
  ): { max: number; min: number } {
    const { valueField, catalogField, seriesField } = seriesModel;
    const catalogFields = this.dimensions.map(d =>
      d.dimensionTag!.toLowerCase(),
    );
    const count = items.reduce((acc, item) => {
      let catalogName = '';
      if (catalogFields.length) {
        catalogFields.forEach(key => {
          catalogName += item[key];
        });
      } else {
        catalogName = item[catalogField];
      }
      const name = seriesField
        ? `${item[seriesField]}_${catalogName}`
        : `${catalogName}`;
      const value = item[valueField];
      // 如果分组不存在，初始化结构
      if (!acc[name]) {
        acc[name] = {
          sum: 0,
          max: -Infinity, // 初始化为极小值
          min: Infinity, // 初始化为极大值
        };
      }
      // 更新统计值
      acc[name].sum += value;
      acc[name].max = Math.max(acc[name].max, value);
      acc[name].min = Math.min(acc[name].min, value);
      return acc;
    }, {});
    const allSums = Object.values(count).map(item => item.sum);
    const max = Math.max(...allSums);
    const min = Math.min(...allSums);
    return { max, min };
  }

  /**
   * @description 获取标签参数
   * @param {IModel} seriesModel
   * @param {IData[]} items
   * @returns {*}  {IData}
   * @memberof EchartConverterBase
   */
  getChartLabelParams(seriesModel: IModel, items: IData[]): IData {
    const {
      series_label_show,
      series_label_position,
      series_label_fontsize,
      series_label_fontstyle,
      series_label_fontcolor,
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
        if(param.value[1] === ${max} || param.value[1] === ${min}){
          return param.value[1];
        }
        return '';
      }`;
    }
    if (series_label_data_range && series_label_data_range === 'all') {
      options.formatter = `function(param) {
        return param.value[1];
      }`;
    }
    return { 'EC.label': JSON.stringify(options) };
  }

  /**
   * @description 获取图例参数
   * @returns {*}  {IData}
   * @memberof EchartConverterBase
   */
  getChartLegendParams(): IData {
    const {
      legend_show,
      legend_fontstyle,
      legend_fontsize,
      legend_fontcolor,
      legend_position,
    } = this.reportUIModel;
    const options: IData = {
      show: legend_show == '1',
      icon: 'circle',
      formatter: `function(param){
            return param;
          }`,
    };
    // 文字颜色
    const textStyle: IData = {};
    if (legend_fontstyle) {
      legend_fontstyle === 'bold'
        ? (textStyle.fontWeight = legend_fontstyle)
        : (textStyle.fontStyle = legend_fontstyle);
    }
    if (legend_fontsize) {
      textStyle.fontSize = Number(legend_fontsize);
    }
    if (legend_fontcolor) {
      textStyle.color = legend_fontcolor;
    }
    options.textStyle = textStyle;

    // 图例位置
    if (legend_position) {
      Object.assign(options, ChartUtil.getLegendPosition(legend_position));
    }
    return { 'EC.legend': JSON.stringify(options) };
  }

  /**
   * @description 获取控件参数
   * @returns {*}  {IData}
   * @memberof EchartConverterBase
   */
  getChartControlParams(): IData {
    const ctrlParams: IData = {};
    const tempdimensions = this.dimensions.map(item => {
      return {
        mode: 'field',
        name: item.dimensionName,
        codelistId: item.appCodeListId,
        codename: item.dimensionTag!.toLowerCase(),
      };
    });
    Object.assign(ctrlParams, {
      CATALOGFIELDS: JSON.stringify(tempdimensions),
      NOSORT: true,
    });
    return ctrlParams;
  }

  /**
   * @description 获取tooltip参数
   * @param {IData} series
   * @param {boolean} [isRow=false]
   * @returns {*}
   * @memberof EchartConverterBase
   */
  getTooltipParams(series: IData, isRow: boolean = false) {
    // 无分组维度时
    if (!this.groupDimension) {
      return {
        'EC.name': series.serieText,
        'EC.tooltip': JSON.stringify({
          formatter: `function(param){
            const tempdata = param.data[2];
            const names = param.name.split('_');
            const catalogData =  tempdata._catalogLevelData;
  
            let value = ${isRow} ? param.value[0] : param.value[1];
            
            // 计算维度项分层
            let dimcatalogs = '';
            catalogData.forEach((item) => {
              let text = item.valueText || '未定义'
              const dimitem = '<div style="width:100%;display:flex;justifyContent: left;alignItems:center;"><div>' + item.name + ':</div><div style="flex:0;margin-left:4px;">' +text + '</div></div>'
              dimcatalogs += dimitem;
            })  
            return  '<div style="min-width: 150px">'+ dimcatalogs +'<div style="width:100%;display:flex;justifyContent: left;alignItems:center;"><div style="flex:0">'+ param.marker + param.seriesName +':</div><div style="flex:1;margin-left:4px;">'+ value +'</div></div></div>'            
          }`,
        }),
      };
    }
    const param = {
      'EC.tooltip': JSON.stringify({
        formatter: `function(param){
          const {data} = param;        
          const catalogData = data[2]._catalogLevelData;
  
          let tempName = param.seriesName;
          const field = Object.keys(data[2]).find(key => {
            return key !== '_groupName' && data[2][key] === param.seriesName;
          })
          // 计算维度项分层
          let dimcatalogs = '';
          catalogData.forEach((item) => {
            let text = item.valueText || '未定义'
            const dimitem = '<div style="width:100%;display:flex;justifyContent: left;alignItems:center;"><div>' + item.name + ':</div><div style="flex:0;margin-left:4px;">' +text + '</div></div>'
            dimcatalogs += dimitem;
          })
  
          let value = ${isRow} ? param.value[0] : param.value[1];
          return  '<div style="min-width: 200px">' + dimcatalogs +          
          '<div style="width:100%;display:flex;justifyContent: left;alignItems:center;">'+
            '<div>${this.groupDimension.dimensionName}:</div>'+
            '<div style="flex:0">'+ tempName +'</div>'+
          '</div>' + 
          '<div style="width:100%;display:flex;justifyContent: left;alignItems:center;">'+ 
              '<div>' + param.marker + '${series.serieText}:</div>'+
              '<div style="flex:0">' + value + '</div>'+
            '</div>'+
          '</div>'
         }`,
      }),
    };
    return param;
  }

  /**
   * @description 计算序列模型
   * @param {IAppBIReportMeasure[]} measures 指标
   * @param {IAppBIReportDimension} dimension 维度
   * @param {IAppBIReportDimension[]} [groupDimension] 分组维度
   * @returns {*}  {IModel[]}
   * @memberof EchartConverterBase
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
   * @description 转化数据到模型
   * @param {IData[]} items
   * @returns {*}  {({ model: IModel; options: IData; data: IData[] } | undefined)}
   * @memberof EchartConverterBase
   */
  translateDataToReport(
    items: IData[],
  ): { model: IModel; options: IData; data: IData[] } | undefined {
    if (!this.measures.length || !this.dimensions.length) return;
    const model = clone(this.mockModel);
    const seriesModels = this.calcSeriesModel(
      this.measures,
      this.dimensions[0],
      this.groupDimension,
    );
    if (model.dechartSerieses) model.dechartSerieses.push(...seriesModels);
    return { model, options: {}, data: items };
  }
}
