/* eslint-disable no-param-reassign */
import { clone } from 'ramda';
import { biReportT, biReportScriptText } from '../locale';
import {
  IAppBIReport,
  IAppBIReportDimension,
  IAppBIReportMeasure,
} from '@ibiz/model-core';

/**
 * 递归处理对象属性
 *
 * @author tony001
 * @date 2024-06-06 18:06:50
 * @export
 * @param {IData} data 传入数据
 * @param {Function} callback 处理单个属性回调
 */
export function deepHandData(data: IData, callback: Function): void {
  if (Object.prototype.toString.call(data) === '[object Array]') {
    data.forEach((item: IData) => {
      deepHandData(item, callback);
    });
  } else if (Object.prototype.toString.call(data) === '[object Object]') {
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (typeof value === 'object') {
        if (Array.isArray(value)) {
          deepHandData(data[key], callback);
        } else {
          deepHandData(data[key], callback);
        }
      } else if (typeof value === 'string') {
        data[key] = callback(value);
      }
    });
  }
}

/**
 * 格式化单个属性
 *
 * @author tony001
 * @date 2024-06-12 18:06:10
 * @export
 * @param {string} str
 * @param {IData} data
 * @return {*}  {string}
 */
export function formatField(str: string, data: IData): string {
  const {
    appId,
    appDataEntityId,
    caption,
    catalog,
    value,
    seriesField,
    catalogCodeListId = '',
    seriesCodeListId = '',
    serieText,
    catname,
    jsonFormat,
  } = data;
  return str
    .replaceAll('srfAppId', appId)
    .replaceAll('srfAppDataEntityId', appDataEntityId!)
    .replaceAll('srfCaption', caption)
    .replaceAll('srfCatalogField', catalog)
    .replaceAll('srfValue', value)
    .replaceAll('srfSeriesField', seriesField)
    .replaceAll('srfCatalogCodeListId', catalogCodeListId)
    .replaceAll('srfSeriesCodeListId', seriesCodeListId)
    .replaceAll('srfCatalogName', catname)
    .replaceAll('srfSerieText', serieText)
    .replaceAll('srfJsonFormat', jsonFormat);
}

/**
 * 解析报表UI模型
 *
 * @export
 * @param {string} key
 * @param {string} model
 */
export function parseReportUIModel(key: string, report: IAppBIReport) {
  try {
    if (report.reportUIModel) {
      const model = JSON.parse(report.reportUIModel);
      return model[key];
    }
  } catch (error) {
    ibiz.message.error(biReportT('parseModelError'));
  }
}

/**
 * 获取指标参数
 *
 * @author tony001
 * @date 2024-07-16 20:07:35
 * @export
 * @param {IAppBIReport} reportModel
 * @param {IAppBIReportMeasure[]} [reportMeasures=[]]
 * @return {*}  {IData[]}
 */
export function getReportMeasureParam(
  reportModel: IAppBIReport,
  reportMeasures: IAppBIReportMeasure[] = [],
): IData[] {
  const result: IData[] = [];
  const extend = parseReportUIModel('extend', reportModel);
  if (reportMeasures.length > 0) {
    reportMeasures.forEach((item: IAppBIReportMeasure) => {
      const _item: IData = {
        name: item.measureTag,
      };
      if (item.measureParams) {
        _item.param = item.measureParams;
      }
      if (extend && extend[`aggmode@${item.measureTag}`]) {
        _item.aggmode = extend[`aggmode@${item.measureTag}`];
      }
      result.push(_item);
    });
  }
  return result;
}

/**
 * 获取维度参数
 *
 * @author tony001
 * @date 2024-07-16 20:07:52
 * @export
 * @param {IAppBIReportDimension[]} [reportDimensions=[]]
 * @param {IAppBIReport} reportModel
 * @return {*}  {IData[]}
 */
export function getReportDimensionParam(
  reportModel: IAppBIReport,
  reportDimensions: IAppBIReportDimension[] = [],
): IData[] {
  const result: IData[] = [];
  const extend = parseReportUIModel('extend', reportModel);
  if (reportDimensions.length > 0) {
    reportDimensions.forEach((item: IAppBIReportDimension) => {
      const _item: IData = {
        name: item.dimensionTag,
      };
      if (item.dimensionParams) {
        _item.param = item.dimensionParams;
      }
      if (extend && extend[`period@${item.dimensionTag}`]) {
        _item.period = extend[`period@${item.dimensionTag}`];
      }
      result.push(_item);
    });
  }
  return result;
}

/**
 * 获取排序参数
 *
 * @author tony001
 * @date 2024-07-28 16:07:53
 * @export
 * @param {IAppBIReport} reportModel
 * @param {IAppBIReportMeasure[]} [reportMeasures=[]]
 * @param {IAppBIReportDimension[]} [reportDimensions=[]]
 * @return {*}  {string | undefined}
 */
export function getReportSortParam(
  reportModel: IAppBIReport,
  reportMeasures: IAppBIReportMeasure[] = [],
  reportDimensions: IAppBIReportDimension[] = [],
): string | undefined {
  const reportSort: string[] = [];
  const extend = parseReportUIModel('extend', reportModel);
  if (reportMeasures.length > 0) {
    reportMeasures.forEach((item: IAppBIReportMeasure) => {
      if (extend && extend[`sort@${item.measureTag}`]) {
        reportSort.push(
          `${item.measureTag},${extend[`sort@${item.measureTag}`]}`,
        );
      }
    });
  }
  if (reportDimensions.length > 0) {
    reportDimensions.forEach((item: IAppBIReportDimension) => {
      if (extend && extend[`sort@${item.dimensionTag}`]) {
        if (item.textAppDEFieldId) {
          reportSort.push(
            `${item.dimensionTag}_text,${extend[`sort@${item.dimensionTag}`]}`,
          );
        } else {
          reportSort.push(
            `${item.dimensionTag},${extend[`sort@${item.dimensionTag}`]}`,
          );
        }
      }
    });
  }
  const bisortStr = reportSort.join(';');
  return bisortStr || undefined;
}

/**
 * 处理序列代码表
 *
 * @export
 * @param {IData[]} items
 * @param {IData} model
 * @param {IData} opts
 */
export function handleSeriesCodeList(
  items: IAppBIReportMeasure[],
  model: IData,
  opts: IData,
  callback?: Function,
): IData[] {
  const { appDataEntityId, caption, dimension, appId } = opts;
  const seriesModel: IData[] = [];
  items.forEach((item: IAppBIReportMeasure, index: number) => {
    const serieModel = clone(model);
    const itemInput = {
      appId,
      appDataEntityId,
      caption,
      catalog: dimension.dimensionTag,
      catname: dimension.dimensionName,
      value: item.measureTag,
      serieText: item.measureName,
      seriesCodeListId: item.appCodeListId,
      catalogCodeListId: dimension.appCodeListId,
      jsonFormat: item.jsonFormat,
    };
    Object.assign(serieModel, {
      id: `${serieModel.seriesType}_${index}`,
    });

    if (itemInput.catalogCodeListId) {
      Object.assign(serieModel, {
        catalogCodeListId: 'srfCatalogCodeListId',
      });
    }
    if (itemInput.seriesCodeListId) {
      Object.assign(serieModel, {
        seriesCodeListId: 'srfSeriesCodeListId',
      });
    }
    if (itemInput.jsonFormat) {
      Object.assign(serieModel, {
        jsonFormat: 'srfJsonFormat',
      });
    }
    deepHandData(serieModel, (str: string) => {
      return formatField(str, itemInput);
    });
    if (callback) {
      callback(serieModel, index);
    }
    seriesModel.push(serieModel);
  });
  return seriesModel;
}

/**
 * 处理分组转序列
 *
 * @export
 */
export function handleGroupToSeries(
  items: IData[],
  dimensions: IAppBIReportDimension[],
  appId: string,
) {
  const series: IAppBIReportMeasure[] = [];
  if (items.length) {
    const groupTag = items[0].split('.').pop();
    const index = dimensions.findIndex((dimension: IAppBIReportDimension) => {
      return dimension.dimensionTag === groupTag;
    });
    if (index >= 0) {
      const target = dimensions[index];
      series.push({
        measureTag: target.dimensionTag,
        measureName: target.dimensionName,
        appCodeListId: target.appCodeListId,
        appId,
      });
    }
  }
  return series;
}

/**
 * 处理序列分组和tip
 *
 * @export
 * @param {Array<IData>} serieGroup
 * @param {IData} series
 * @param {boolean} [isStack=false]
 * @return {*}
 */
export function handleSerieGroupTip(
  serieGroup: Array<IData>,
  series: IData,
  isStack: boolean = false,
  isRow: boolean = false,
) {
  // 无分组维度时
  if (!serieGroup || !serieGroup.length) {
    return {
      'EC.name': series.serieText,
      'EC.tooltip': JSON.stringify({
        formatter: `function(param){
          const tempdata = param.data[2];
          const chartData = JSON.parse(localStorage.getItem(tempdata._chartid));
          const names = param.name.split('_');
          const catalogData =  tempdata._catalogLevelData;

          let value = ${isRow} ? param.value[0] : param.value[1];
          if('${series.jsonFormat}' !== 'undefined'){
            value = ibiz.util.text.format(String(value), '${series.jsonFormat}') || value;
          }
          // 计算维度项分层
          let dimcatalogs = '';
          catalogData.forEach((item) => {
            let text = item.valueText || ${biReportScriptText('undefinedValue')}
            if(chartData && Object.keys(chartData).length > 0 && chartData[item.codename] && chartData[item.codename][item.value]){
              text = chartData[item.codename][item.value];
            }
            const dimitem = '<div style="width:100%;display:flex;justifyContent: left;alignItems:center;"><div>' + item.name + ':</div><div style="flex:0;margin-left:4px;">' +text + '</div></div>'
            dimcatalogs += dimitem;
          })

          return  '<div style="min-width: 150px">'+ dimcatalogs +'<div style="width:100%;display:flex;justifyContent: left;alignItems:center;"><div style="flex:0">'+ param.marker + param.seriesName +':</div><div style="flex:1;margin-left:4px;">'+ value +'</div></div></div>'            
        }`,
      }),
    };
  }
  // 有分组维度
  const group = serieGroup[0];
  const param = {
    'EC.tooltip': JSON.stringify({
      formatter: `function(param){
        const {data} = param;        
        const chartData = JSON.parse(localStorage.getItem(data[2]._chartid));
        const catalogData = data[2]._catalogLevelData;

        let tempName = param.seriesName;
        const field = Object.keys(data[2]).find(key => {
          return key !== '_groupName' && data[2][key] === param.seriesName;
        })
        if(field && chartData && chartData[field]){
          tempName = chartData[field][param.seriesName];
        }
        // 计算维度项分层
        let dimcatalogs = '';
        catalogData.forEach((item) => {
          let text = item.valueText || ${biReportScriptText('undefinedValue')}
          if(chartData && Object.keys(chartData).length > 0 && chartData[item.codename] && chartData[item.codename][item.value]){
            text = chartData[item.codename][item.value];
          }
          const dimitem = '<div style="width:100%;display:flex;justifyContent: left;alignItems:center;"><div>' + item.name + ':</div><div style="flex:0;margin-left:4px;">' +text + '</div></div>'
          dimcatalogs += dimitem;
        })

        let value = ${isRow} ? param.value[0] : param.value[1];
        if('${series.jsonFormat}' !== 'undefined'){
          value = ibiz.util.text.format(String(value), '${series.jsonFormat}') || value;
        }
        return  '<div style="min-width: 200px">' + dimcatalogs +          
        '<div style="width:100%;display:flex;justifyContent: left;alignItems:center;">'+
          '<div>${group.measureName}:</div>'+
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
  if (isStack) {
    Object.assign(param, { 'EC.stack': series.serieText });
  }
  return param;
}

/**
 * 处理饼图的tooltip
 *
 * @export
 * @param {IData} series
 * @return {*}
 */
export function handlePieSerieGroupTip(
  series: IData,
  measures: IData[],
  dimension: IData,
) {
  const param = {
    'EC.tooltip': JSON.stringify({
      formatter: `function(param){
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
        
        let value = param.value[0];
        if('${series.jsonFormat}' !== 'undefined'){
          value = ibiz.util.text.format(String(value), '${series.jsonFormat}') || value;
        }
        return '<div style="min-width: 150px">' + 
        '<div style="width:100%;display:flex;justifyContent: left;alignItems:center;">'+
          '<div style="flex:0">${dimension.dimensionName}:</div>' + 
          '<div style="flex:1;margin-left:4px;">'+tempName+'</div>' +
         '</div>' + 
        '<div style="width:100%;display:flex;justifyContent: left;alignItems:center;">'+
          '<div style="flex:0;">'+ param.marker + '${measures[0].measureName}:</div>'+
          '<div style="flex:1;margin-left:4px;">' + value + '</div>' + 
        '</div>'+
        '</div>'
      }`,
    }),
  };
  return param;
}

/**
 * 获取所有不是分组的维度
 *
 * @export
 * @param {IAppBIReport} data
 * @return {*}
 */
export function getAllNoGroupDimensions(data: IAppBIReport) {
  if (!data) {
    return null;
  }
  let serieGroup: IData[] = [];
  if (data.reportUIModel) {
    const tempData = JSON.parse(data.reportUIModel);
    if (tempData && tempData.group && Array.isArray(tempData.group)) {
      serieGroup = handleGroupToSeries(
        tempData.group,
        data.appBIReportDimensions!,
        data.appId || ibiz.env.appId,
      );
    }
  }
  let tag = false;
  const dimens = data.appBIReportDimensions
    ?.filter((item: IData) => {
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
        codename: item.dimensionTag,
        name: item.dimensionName,
        mode: item.appCodeListId ? 'codelist' : 'field',
        textAppDEFieldId: item.textAppDEFieldId,
        codelistId: item.appCodeListId,
      };
    });
  return dimens;
}

/**
 * 计算各类型警戒线
 *
 * @export
 * @param {IData} line
 * @param {IData} _serie
 * @param {IData[]} items
 * @param {number} total
 * @param {string[]} categroup
 * @param {boolean} isRow
 * @return {*}
 */
export function computeMarkLine(
  line: IData,
  _serie: IData,
  items: IData[],
  total: number,
  categroup: string[],
  isRow: boolean,
) {
  const lineStyle: IData = {
    color: line.lineColor,
    width: line.lineSize,
    type: line.lineStyle,
  };
  if (line.lineStyle === 'dotted') {
    Object.assign(lineStyle, {
      type: [1, 5],
      dashOffset: 5,
      cap: 'round',
    });
  } else if (line.lineStyle === 'doubleDashed') {
    Object.assign(lineStyle, {
      type: [5, 5],
      dashOffset: 5,
      cap: 'round',
    });
  }
  const tempOption: IData = {
    name: line.name,
    lineStyle,
    label: {
      textBorderWidth: 0,
      color: line.lineColor,
      fontWeight: 400,
      position: 'insideEndTop',
      formatter(param: IData) {
        return `${param.name} : ${param.value}`;
      },
    },
  };
  let lineValue = 0;
  if (line.cordonType === 'FIXED') {
    lineValue = line.cordonSize;
  } else if (line.cordonType === 'MAX') {
    // 找到数据中最大的那个值
    let max = -Infinity;
    items.forEach((item: IData) => {
      const cate = categroup.findIndex((_cate: string) => {
        return !item[_cate] && item[_cate] !== 0;
      });
      if (cate < 0 && Number(item[_serie.valueField]) > max) {
        max = Number(item[_serie.valueField]);
      }
    });
    lineValue = max;
  } else if (line.cordonType === 'MIN') {
    // 找到数据中最小的那个值
    let min = Infinity;
    items.forEach((item: IData) => {
      const cate = categroup.findIndex((_cate: string) => {
        return !item[_cate] && item[_cate] !== 0;
      });
      if (cate < 0 && Number(item[_serie.valueField]) < min) {
        min = Number(item[_serie.valueField]);
      }
    });
    lineValue = min;
  } else if (line.cordonType === 'AVERAGE') {
    // 计算平均数
    let sum = 0;
    items.forEach((item: IData) => {
      const cate = categroup.findIndex((_cate: string) => {
        return !item[_cate] && item[_cate] !== 0;
      });
      if (cate < 0 && !Number.isNaN(Number(item[_serie.valueField]))) {
        sum += Number(item[_serie.valueField]);
      }
    });
    if (total) {
      lineValue = sum / total;
    }
  }
  if (isRow) {
    Object.assign(tempOption, {
      xAxis: lineValue,
    });
  } else {
    Object.assign(tempOption, {
      yAxis: lineValue,
    });
  }
  return tempOption;
}
