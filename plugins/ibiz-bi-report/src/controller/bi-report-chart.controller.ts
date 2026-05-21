/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-restricted-syntax */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { clone } from 'ramda';
import { h } from 'vue';
import { calcResPath, ISearchCondGroup, IModal } from '@ibiz-template/runtime';
import {
  IAppBIReport,
  IAppBIReportDimension,
  IAppBIReportMeasure,
} from '@ibiz/model-core';
import { IBizContext } from '@ibiz-template/core';
import { ConverterFactory } from '../converter';
import {
  ChartType,
  IAppBICubeData,
  IAppBIDrillDetailData,
  IBIReportChartController,
  IBIReportChartState,
  IChartConverter,
} from '../interface';
import {
  computeMarkLine,
  formatDate,
  getAllNoGroupDimensions,
  getReportDimensionParam,
  getReportMeasureParam,
  getReportSortParam,
  getSearchconds,
  isDate,
  parseReportUIModel,
  plural,
} from '../util';
import { BIReportDrillShell } from '../components';

/**
 * bi图表
 *
 * @author tony001
 * @date 2024-05-30 22:05:35
 * @export
 * @class BIReportChartController
 * @implements {IBIReportChartController}
 */
export abstract class BIReportChartController
  implements IBIReportChartController
{
  /**
   * 初始化状态
   *
   * @author tony001
   * @date 2024-05-31 00:05:28
   * @type {IBIReportChartState}
   */
  state!: IBIReportChartState;

  /**
   * 转化器
   *
   * @author tony001
   * @date 2024-06-06 01:06:55
   * @type {(IChartConverter | undefined)}
   */
  converter: IChartConverter | undefined;

  /**
   * 初始化图表模型
   *
   * @author tony001
   * @date 2024-06-12 15:06:47
   * @type {(IModel | undefined)}
   */
  chartModel: IModel | undefined;

  /**
   * 图表默认值
   *
   * @author tony001
   * @date 2024-06-12 15:06:15
   * @type {(IData | undefined)}
   */
  chartDefaultValue: IData | undefined;

  /**
   * 图表配置
   *
   * @author tony001
   * @date 2024-06-12 15:06:51
   * @type {(IData | undefined)}
   */
  chartConfig: IData | undefined;

  /**
   * 应用实体标识
   *
   * @author tony001
   * @date 2024-06-12 16:06:42
   * @type {(string | undefined)}
   */
  appDataEntityId: string | undefined;

  /**
   * 图表控制器
   *
   * @author zhanghengfeng
   * @date 2024-07-03 20:07:15
   * @type {IData}
   */
  chartController?: IData;

  /**
   * 唯一标识
   *
   * @author tony001
   * @date 2024-07-24 22:07:10
   * @type {string}
   */
  uuid: string = '';

  /**
   * 动态数据字典
   *
   * @author tony001
   * @date 2024-07-24 23:07:26
   * @type {IData}
   */
  dynaDataDic: IData = {};

  get appId(): string {
    return this.context.srfappid || ibiz.env.appId;
  }

  /**
   * Creates an instance of BIReportChartController.
   * @author tony001
   * @date 2024-06-12 15:06:09
   * @param {string} mode
   * @param {IContext} context
   * @param {IParams} viewParams
   * @param {IAppBIReport} config
   */
  constructor(
    public mode: string,
    public context: IContext,
    public viewParams: IParams,
    public config: IAppBIReport,
    public initData: {
      chartModel: IModel;
      chartConfig: IData;
      chartDefaultValue: IData;
    },
  ) {
    const { chartModel, chartConfig, chartDefaultValue } = initData;
    this.chartModel = chartModel;
    this.chartConfig = chartConfig;
    this.chartDefaultValue = chartDefaultValue;
    let selectChartType: ChartType = 'NUMBER';
    if (config.reportUIModel) {
      const reportUIModelObject = JSON.parse(config.reportUIModel);
      selectChartType = reportUIModelObject.selectChartType || 'NUMBER';
    }
    const { appBISchemeId, appBICubeId, id, name } = this.config as IData;
    this.uuid = `${
      this.appId
    }@${appBISchemeId}@${appBICubeId}@${id}@${selectChartType}@${encodeURIComponent(
      name,
    )}`;
    this.converter = ConverterFactory.createConverter(selectChartType, this);
    this.initState();
  }

  /**
   * 设置图表控制器
   *
   * @author zhanghengfeng
   * @date 2024-07-03 20:07:32
   * @param {IData} c
   */
  setChartController(c: IData): void {
    this.chartController = c;
    // 计算图表部件是否出滚动条，超过20条类目就出滚动条
    c.evt.on('onBeforeUpdate', () => {
      if (this.chartController) {
        const { options = {} } = this.chartController;
        const series = options.series || [];
        const xAxis = options.xAxis;
        const yAxis = options.yAxis;
        const isRow = this.state.model.controlParam?.ctrlParams?.MODE === 'ROW';
        delete options.dataZoom;
        const tempSerie = series.find((serie: IData) => {
          return serie.data && serie.data.length > 20;
        });
        // 重新设置滚动条
        if (series.length > 0 && (series.length > 15 || tempSerie)) {
          if (isRow) {
            options.dataZoom = [
              {
                yAxisIndex: Array.isArray(yAxis)
                  ? yAxis.map((_item: IData, index: number) => index)
                  : 0,
                start: 0,
                end: 10,
              },
            ];
          } else {
            options.dataZoom = [
              {
                xAxisIndex: Array.isArray(xAxis)
                  ? xAxis.map((_item: IData, index: number) => index)
                  : 0,
                start: 0,
                end: 10,
              },
            ];
          }
        }
        // 雷达图时根据指标有无值格式化重写数据
        if (series.length > 0) {
          series.forEach((serie: IData, index: number) => {
            if (serie.type === 'radar' && this.chartController) {
              const targetSerie =
                this.chartController.generator.seriesGenerators[index];
              const { valueField } = targetSerie;
              const tempMeasure =
                this.state.reportModel.appBIReportMeasures?.find(
                  (measure: IAppBIReportMeasure) => {
                    return measure.measureTag === valueField;
                  },
                );
              if (
                tempMeasure?.jsonFormat &&
                serie.data &&
                serie.data.length > 0
              ) {
                serie.data.forEach((item: IData) => {
                  item.value = item.value.map((_item: number) => {
                    return ibiz.util.text.format(
                      String(_item),
                      tempMeasure.jsonFormat!,
                    );
                  });
                });
              }

              // 雷达图时需要更改radar里面的indicator来动态翻译数据
              const { radar } = options;
              if (radar && Array.isArray(radar)) {
                radar.forEach((_radar: IData) => {
                  if (_radar.indicator && Array.isArray(_radar.indicator)) {
                    _radar.indicator.forEach((indicator: IData) => {
                      const field = Object.keys(this.dynaDataDic).find(
                        (_key: string) => {
                          return this.dynaDataDic[_key][indicator.name];
                        },
                      );
                      if (field) {
                        indicator.name =
                          this.dynaDataDic[field][indicator.name];
                      }
                    });
                  }
                });
              }
            }
          });
        }
        const that = this;
        const dimens = getAllNoGroupDimensions(that.state.reportModel);
        if (dimens && dimens.length > 0) {
          const _index = dimens.findIndex((item: IData) => {
            return item.mode === 'field' && item.textAppDEFieldId;
          });
          // 翻译 轴 label
          if (isRow) {
            // 条形图
            yAxis.forEach((_yaxis: IData) => {
              if (!_yaxis.axisLabel) return;
              _yaxis.axisLabel.formatter = function (param: string) {
                const labels = param.split('_').map((_label: string) => {
                  const curDim = that.dynaDataDic[dimens[_index]?.codename];
                  if (curDim && curDim[_label]) {
                    return curDim[_label];
                  }
                  return _label;
                });
                const text = labels.at(-1);
                if (!text || text.indexOf('undefined') > -1) {
                  return 'undefined';
                }

                if (text.length > 4 && !text.includes('\n')) {
                  return `${text.slice(0, 4)}...`;
                }
                return text;
              };
            });
          } else if (xAxis && Array.isArray(xAxis) && xAxis.length > 0) {
            xAxis.forEach((xaxis: IData) => {
              if (!xaxis.axisLabel) return;
              xaxis.axisLabel.formatter = function (param: string) {
                const labels = param.split('_').map((_label: string) => {
                  const curDim = that.dynaDataDic[dimens[_index]?.codename];
                  if (curDim && curDim[_label]) {
                    return curDim[_label];
                  }
                  return _label;
                });
                return labels.at(-1);
              };
            });
          }
          // 翻译X轴滚动条label
          if (options.dataZoom && Array.isArray(options.dataZoom)) {
            options.dataZoom.forEach((zoom: IData) => {
              if (_index >= 0) {
                const curDim = that.dynaDataDic[dimens[_index]?.codename];
                Object.assign(zoom, {
                  labelFormatter(index: number, value: string) {
                    const tempValue = value.split('_').at(-1);
                    if (curDim && tempValue && curDim[tempValue]) {
                      return curDim[tempValue];
                    }
                    return tempValue || 'undefined';
                  },
                });
              }
            });
          }
        }
        // 设置警戒线
        let uiModel: IData = {};
        if (this.state.reportModel && this.state.reportModel.reportUIModel) {
          uiModel = JSON.parse(this.state.reportModel.reportUIModel);
        }
        if (
          series.length > 0 &&
          this.state.model.dechartSerieses &&
          uiModel.extend
        ) {
          this.state.model.dechartSerieses.forEach((_serie: IData) => {
            const lines = uiModel.extend?.[`cordon@${_serie.valueField}`];
            const option: IData = {
              symbol: 'none',
              silent: true,
            };
            const marks: IData[] = [];
            if (lines) {
              const index = series.findIndex((_item: IData) => {
                if (_serie.seriesField) {
                  return _item.stack === _serie.serieText;
                }
                return _item.name === _serie.serieText;
              });
              let total = 1;
              const categroup: string[] = [];
              // 根据纬度计算有多少分类
              if (dimens) {
                dimens.forEach((dimen: IData) => {
                  categroup.push(dimen.codename);
                  if (dimen.codelistId) {
                    const tempcodelist =
                      this.chartController!.generator.codeListMap.get(
                        dimen.codelistId,
                      );
                    total *= tempcodelist.length;
                  } else {
                    const tempitems = this.state.items.map((_item: IData) => {
                      return (
                        _item[dimen.codename] || _item[dimen.codename] !== 0
                      );
                    });
                    const cate = Array.from(new Set(tempitems));
                    total *= cate.length;
                  }
                });
              }
              // 计算警戒线样式与位置
              lines.forEach((line: IData) => {
                const mark = computeMarkLine(
                  line,
                  _serie,
                  this.state.items,
                  total,
                  categroup,
                  isRow,
                );
                marks.push(mark);
              });
              Object.assign(option, {
                data: marks,
              });
              // 考虑到应用轴位置变化，这里需要寻找到当前警戒线对应的指标序列
              if (index > -1) {
                Object.assign(series[index], {
                  markLine: option,
                });
              } else {
                Object.assign(series[0], {
                  markLine: option,
                });
              }
            }
          });
        }
      }
    });
  }

  /**
   * 初始化状态
   *
   * @author tony001
   * @date 2024-06-12 16:06:07
   */
  initState(): void {
    this.state = {} as IBIReportChartState;
    this.state.isCreated = false;
    this.state.refreshFlag = true;
    this.state.propertyConfig = this.chartConfig!;
    this.state.items = [];
    this.state.reportModel = this.config;
  }

  /**
   * 初始化
   *
   * @author tony001
   * @date 2024-06-12 17:06:20
   * @return {*}  {Promise<void>}
   */
  async created(): Promise<void> {
    try {
      await this.init();
    } finally {
      this.state.isCreated = true;
    }
  }

  /**
   * 初始化
   *
   * @author tony001
   * @date 2024-06-26 14:06:56
   * @return {*}  {Promise<void>}
   */
  async init(): Promise<void> {
    const { appBISchemeId, appBICubeId } = this.config as IData;
    const appBICube: IAppBICubeData | undefined = await this.getCubeById(
      `${appBISchemeId}.${appBICubeId}`,
    );
    if (!appBICube) {
      return;
    }
    this.appDataEntityId = appBICube.psdename.toLowerCase();
    await this.load();
    const targetModel = await this.converter?.translateDataToModel(
      this.state.reportModel,
      clone(this.chartModel!),
      {
        items: this.state.items,
        mode: this.mode,
        chartid: this.uuid,
        appDataEntityId: this.appDataEntityId,
      },
    );
    if (!targetModel) return;
    this.state.model = targetModel;
  }

  /**
   * 获取立方体数据
   *
   * @param {(string | undefined)} cubeId
   * @return {*}  {(Promise<IAppBICubeData | undefined>)}
   * @memberof BIReportChartController
   */
  async getCubeById(
    cubeId: string | undefined,
  ): Promise<IAppBICubeData | undefined> {
    if (!cubeId) return;
    const tempContext = clone(this.context);
    tempContext.pssysbicube = cubeId;
    const app = ibiz.hub.getApp(this.appId);
    const res = await app.deService.exec(
      'pssysbicube',
      'get',
      tempContext,
      this.viewParams,
    );
    return (res.data as IAppBICubeData) || {};
  }

  /**
   * 初始化数据集
   *
   * @author tony001
   * @date 2024-06-18 15:06:41
   * @return {*}  {Promise<void>}
   */
  async load(): Promise<IData[]> {
    this.state.items = [];
    const bol = await this.checkData();
    if (bol) {
      const items = await this.fetchDataSource();
      this.state.items = items;
    }
    return this.state.items;
  }

  /**
   * 销毁
   *
   * @author tony001
   * @date 2024-06-12 17:06:38
   * @return {*}  {Promise<void>}
   */
  async destroyed(): Promise<void> {
    localStorage.removeItem(this.uuid);
  }

  /**
   * 处理值变更
   *
   * @param {string} _name
   * @param {unknown} _value
   * @param {IData} _mergeParams
   * @return {*}  {Promise<void>}
   * @memberof BIReportChartController
   */
  async handleValueChange(
    _name: string,
    _value: unknown,
    _mergeParams: IData,
  ): Promise<void> {
    if (_mergeParams && Object.keys(_mergeParams).length > 0) {
      if (
        _name.startsWith('style') ||
        _name.startsWith('extend.cordon') ||
        _name.startsWith('extend.axis')
      ) {
        Object.assign(this.state.reportModel, _mergeParams);
      }
      if (_name.startsWith('data') || _name.startsWith('extend')) {
        this.state.reportModel = _mergeParams as IAppBIReport;
      }
    }
  }

  /**
   * 检查数据
   *
   * @return {*}  {Promise<boolean>}
   * @memberof BIReportChartController
   */
  async checkData(): Promise<boolean> {
    let result = true;
    if (!this.chartConfig) {
      return result;
    }
    const dataConfig: IData = this.chartConfig.data;
    if (!dataConfig || !dataConfig.details) {
      return result;
    }
    const requiredItems = dataConfig.details.filter((item: IData) => {
      return item.required === true;
    });
    if (!requiredItems || requiredItems.length === 0) {
      return result;
    }
    const data = this.state.reportModel;
    for (const item of requiredItems) {
      // 指标判断
      if (item.id && item.id === 'measure') {
        if (
          !data.appBIReportMeasures ||
          (data.appBIReportMeasures && data.appBIReportMeasures.length === 0)
        ) {
          result = false;
          break;
        }
      }
      // 维度判断
      if (item.id && item.id === 'dimension') {
        if (
          !data.appBIReportDimensions ||
          (data.appBIReportDimensions &&
            data.appBIReportDimensions.length === 0)
        ) {
          result = false;
          break;
        } else if (data.reportUIModel) {
          // 排除group以外的维度再判断
          let tempAppBIReportDimensions = clone(data.appBIReportDimensions);
          const reportUIModelObject = JSON.parse(data.reportUIModel);
          if (reportUIModelObject.group?.length > 0) {
            reportUIModelObject.group.forEach((key: string) => {
              const tempKey: string = key.split('.').pop()!;
              tempAppBIReportDimensions = tempAppBIReportDimensions.filter(
                (dimension: IData) => {
                  return dimension.dimensionTag !== tempKey;
                },
              );
            });
            if (tempAppBIReportDimensions.length === 0) {
              result = false;
              break;
            }
          }
        }
      }
    }
    return result;
  }

  /**
   * 刷新
   *
   * @author tony001
   * @date 2024-06-20 11:06:57
   * @param {('UI' | 'ALL')} [type='UI']
   * @return {*}  {Promise<void>}
   */
  async refresh(type: 'UI' | 'ALL' = 'UI'): Promise<void> {
    this.state.refreshFlag = false;
    if (type === 'ALL') {
      const bol = await this.checkData();
      if (bol) {
        const items = await this.fetchDataSource();
        this.state.items = items;
      }
    }
    const targetModel = await this.converter?.translateDataToModel(
      this.state.reportModel,
      clone(this.chartModel!),
      {
        items: this.state.items,
        mode: this.mode,
        chartid: this.uuid,
        appDataEntityId: this.appDataEntityId,
      },
    );
    if (!targetModel) return;
    this.state.model = targetModel;
    this.state.refreshFlag = true;
  }

  /**
   * 获取数据集
   *
   * @author tony001
   * @date 2024-06-12 17:06:15
   * @return {*}  {Promise<IData[]>}
   */
  async fetchDataSource(): Promise<IData[]> {
    const { appBICubeId } = this.config;
    let url: string = '';
    if (this.config.reportTag && this.config.reportTag.indexOf('.') === -1) {
      const appDataEntity = await (ibiz as IData).hub.getAppDataEntity(
        this.appDataEntityId!,
        this.appId,
      );
      url = `/${appDataEntity.deapicodeName2}/report?srfreporttag=${
        this.config.reportTag || 'bi_report'
      }&srfcontenttype=json`;
      if (this.context) {
        const resPath = calcResPath(this.context, appDataEntity);
        url = resPath + url;
      }
    } else {
      const keys = this.config.reportTag!.split('.');
      url = `/${plural(keys[0])}/report?srfreporttag=${
        keys[1]
      }&srfcontenttype=json`;
    }
    const options = {
      bicubetag: appBICubeId,
      bimeasures: getReportMeasureParam(
        this.state.reportModel,
        this.state.reportModel.appBIReportMeasures || [],
      ),
      bidimensions: getReportDimensionParam(
        this.state.reportModel,
        this.state.reportModel.appBIReportDimensions || [],
      ),
      bisort: getReportSortParam(
        this.state.reportModel,
        this.state.reportModel.appBIReportMeasures,
        this.state.reportModel.appBIReportDimensions,
      ),
    };
    // 合入过滤器条件
    let searchconds = getSearchconds(this.state.reportModel);
    if (this.viewParams && this.viewParams.srfsearchconds) {
      if (searchconds && searchconds.length > 0) {
        const firstSearchConds = searchconds[0] as ISearchCondGroup;
        firstSearchConds.searchconds?.push(this.viewParams.srfsearchconds);
      } else {
        searchconds = this.viewParams.srfsearchconds;
      }
    }
    Object.assign(options, { searchconds });
    // 合入同环比参数
    if (this.state.reportModel.reportUIModel) {
      const reportUIModelObj = JSON.parse(
        this.state.reportModel.reportUIModel!,
      );
      if (reportUIModelObj.period && reportUIModelObj.period.length > 0) {
        const value = reportUIModelObj.period[0].value;
        if (value) {
          Object.assign(options, { biperiod: value });
        }
      }
    }
    const app = await ibiz.hub.getAppAsync(this.appId);
    const response = await app.net.post(url, options);
    const result: IData[] = this.handResponseData(response.data as IData[]);
    return result;
  }

  /**
   * 处理响应数据
   *
   * @author tony001
   * @date 2024-07-23 15:07:29
   * @private
   * @param {IData[]} data
   * @return {*}  {IData[]}
   */
  private handResponseData(data: IData[]): IData[] {
    const result: IData[] = [];
    const textFields: string[] = [];
    const timeFormatObj: IData = {};
    if (this.state.reportModel.appBIReportDimensions) {
      this.state.reportModel.appBIReportDimensions.forEach(
        (biReportDimension: IAppBIReportDimension) => {
          // 需翻译文本
          if (
            !biReportDimension.appCodeListId &&
            biReportDimension.textAppDEFieldId
          ) {
            textFields.push(biReportDimension.dimensionTag!);
          }
          // 时间格式化
          if (
            biReportDimension.stdDataType &&
            isDate(biReportDimension.stdDataType)
          ) {
            const extend = parseReportUIModel('extend', this.state.reportModel);
            if (extend && extend[`period@${biReportDimension.dimensionTag}`]) {
              timeFormatObj[biReportDimension.dimensionTag!] =
                extend[`period@${biReportDimension.dimensionTag}`];
            }
          }
        },
      );
    }
    // 构建动态数据字典
    if (textFields.length > 0) {
      textFields.forEach((tempField: string) => {
        const tempObj: IData = {};
        if (data && data.length > 0) {
          data.forEach((item: IData) => {
            if (
              Object.prototype.hasOwnProperty.call(item, `${tempField}_text`)
            ) {
              tempObj[item[tempField]] = item[`${tempField}_text`];
            }
          });
        }
        this.dynaDataDic[tempField] = tempObj;
      });
      localStorage.setItem(this.uuid, JSON.stringify(this.dynaDataDic));
    }
    if (data && data.length > 0) {
      data.forEach((item: IData) => {
        item.$origin = clone(item);
        // 时间格式化
        if (Object.keys(timeFormatObj).length > 0) {
          Object.keys(timeFormatObj).forEach((key: string) => {
            item[key] = formatDate(timeFormatObj[key].unit, item[key]);
          });
        }
        result.push(item);
      });
    }
    return result;
  }

  /**
   * 打开反查视图modal
   *
   * @author zhanghengfeng
   * @date 2024-07-26 16:07:09
   * @param {string} appViewId
   * @param {IAppBIDrillDetailData} data
   * @return {*}  {Promise<void>}
   */
  async openDrillModal(
    appViewId: string,
    data: IAppBIDrillDetailData,
  ): Promise<void> {
    const tempContext = IBizContext.create(this.context);
    tempContext.srfdefaulttoroutedepth = 2;
    const overlayModal = ibiz.overlay.createModal(
      (modal: IModal) => {
        return h(BIReportDrillShell, {
          appViewId,
          context: tempContext,
          data,
          reportModel: this.state.reportModel,
          config: this.config,
          dynamicDataDic: this.dynaDataDic,
          modal,
        });
      },
      {},
      {
        width: '80%',
        height: '80%',
      },
    );
    await overlayModal.present();
  }

  /**
   * 处理数据反查
   *
   * @author tony001
   * @date 2024-07-11 16:07:20
   * @param {IAppBIDrillDetailData} args
   * @return {*}  {Promise<void>}
   */
  async handleDrillDetail(args: IAppBIDrillDetailData): Promise<void> {
    const drillDetailAppViewId: string | undefined =
      this.computeDrillDetailAppView(args);
    if (!drillDetailAppViewId) {
      return;
    }
    this.openDrillModal(drillDetailAppViewId, args);
  }

  /**
   * 计算反查视图
   *
   * @author tony001
   * @date 2024-07-11 17:07:23
   * @private
   * @param {IAppBIDrillDetailData} args
   * @return {*}  {(string | undefined)}
   */
  private computeDrillDetailAppView(
    args: IAppBIDrillDetailData,
  ): string | undefined {
    const { measure } = args;
    if (!measure || !measure.name) {
      ibiz.log.error('执行数据反查无指标数据中断');
      return;
    }
    const targetMeasure = this.config.appBIReportMeasures?.find(
      (item: IAppBIReportMeasure) => {
        return item.measureTag === measure.name;
      },
    );
    if (!targetMeasure) {
      ibiz.log.error('执行数据反查未找到指标数据中断');
      return;
    }
    const drillDetailAppViewId = targetMeasure.drillDetailAppViewId;
    if (!drillDetailAppViewId) {
      ibiz.log.error('执行数据反查未找到反查视图中断');
      return;
    }
    return drillDetailAppViewId;
  }
}
