/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-unused-vars */
import { QXEvent } from 'qx-util';
import { clone } from 'ramda';
import {
  IAppBIReport,
  IDEToolbar,
  IUIActionGroupDetail,
} from '@ibiz/model-core';
import { RuntimeError } from '@ibiz-template/core';
import {
  ButtonContainerState,
  UIActionButtonState,
} from '@ibiz-template/runtime';
import {
  ChartType,
  IAppBICubeData,
  IAppBICubeDimensionData,
  IAppBICubeMeasureData,
  IBIReportChartController,
  IBIReportDesignController,
  IBIReportDesignEvent,
  IBIReportDesignState,
  IChartConfig,
  ISchemaField,
} from '../interface';
import { calcSchemaFieldBySchema, getSchemaByEntity } from '../util';
import { getChartConfig } from '../config';
import { BIVerifyController } from './bi-verify.controller';

/**
 * bi报表设计器
 *
 * @author tony001
 * @date 2024-05-21 11:05:09
 * @export
 * @class BIReportDesignController
 */
export class BIReportDesignController implements IBIReportDesignController {
  /**
   * 事件对象
   *
   * @author tony001
   * @date 2024-06-04 23:06:05
   */
  readonly evt = new QXEvent<IBIReportDesignEvent>();

  /**
   * 当前环境全部数据
   *
   * @private
   * @type {IAppBICubeData[]}
   * @memberof BIReportDesignController
   */
  private allAppBICubes: IAppBICubeData[] = [];

  /**
   * 初始化状态
   *
   * @author tony001
   * @date 2024-05-21 16:05:58
   * @type {IBIReportDesignState}
   */
  state!: IBIReportDesignState;

  /**
   * 备份数据
   *
   * @type {IData}
   * @memberof BIReportDesignController
   */
  backupData: IData = {};

  /**
   * 校验控制器
   *
   * @type {(BIVerifyController | undefined)}
   * @memberof BIReportDesignController
   */
  verifyController: BIVerifyController | undefined = undefined;

  get appId(): string {
    return this.context.srfappid || ibiz.env.appId;
  }

  /**
   * 获取默认值
   *
   * @private
   * @param {string} selectChartType
   * @param {IData | undefined} inputPropertyData
   * @return {*}  {IData}
   * @memberof BIReportDesignController
   */
  private getDefaultValue(
    selectChartType: string,
    sourceData: IData | undefined,
  ): IData {
    const { chartDefaultValue, chartConfig } = getChartConfig(selectChartType);
    const targetData: IData = clone(chartDefaultValue!);
    if (sourceData && Object.keys(sourceData).length > 0) {
      Object.keys(sourceData).forEach(key => {
        if (key === 'data') {
          Object.keys(sourceData.data).forEach(key1 => {
            if (Object.prototype.hasOwnProperty.call(targetData.data, key1)) {
              const config = chartConfig?.data.details.find((item: IData) => {
                return item.id === key1;
              });
              if (!config) {
                return;
              }
              if (config && config.details[0].multiple) {
                targetData.data[key1] = sourceData.data[key1];
              } else {
                targetData.data[key1] = sourceData.data[key1]?.slice(0, 1);
              }
            }
          });
        } else {
          targetData[key] = sourceData[key];
        }
      });
    }
    return targetData;
  }

  /**
   * Creates an instance of BIReportDesignController.
   * @author tony001
   * @date 2024-06-04 23:06:51
   */
  constructor(
    public context: IContext,
    public viewParams: IParams,
    public config: IChartConfig,
    public dismiss: Function,
    public measureToolbar: IDEToolbar,
    public dimensionToolbar: IDEToolbar,
  ) {
    this.verifyController = new BIVerifyController();
    this.initState();
  }

  /**
   * 初始化状态
   *
   * @author tony001
   * @date 2024-06-05 14:06:54
   */
  initState(): void {
    const { selectChartType } = this.config;
    this.state = {} as IBIReportDesignState;
    this.state.isCreated = false;
    this.state.scheme = [];
    this.state.selectedScheme = undefined;
    this.state.cube = [];
    this.state.selectCube = undefined;
    this.state.measure = [];
    this.state.dimension = [];
    this.state.selectChartType = selectChartType;
    this.state.propertyData = this.getDefaultValue(
      this.config.selectChartType,
      this.config.propertyData,
    );
    this.state.reportChart = undefined;
    this.state.schemaFields = [];
    this.state.dataChangeState = false;
    this.state.reportModel = undefined;
    this.state.error = {};
  }

  /**
   * 校验各种错误状态
   *
   * @param {string} name
   * @param {unknown} value
   * @param {string[]} tag
   * @param {IData} [opts]
   * @return {*}  {IData}
   * @memberof BIReportDesignController
   */
  verifyErrorState(
    name: string,
    value: unknown,
    tag: string[],
    opts?: IData,
  ): IData {
    return this.verifyController!.verifyState(name, value, tag, opts);
  }

  /**
   * 初始化错误状态
   *
   * @return {*}
   * @memberof BIReportDesignController
   */
  initErrorState() {
    this.state.error = {};
    const { chartConfig } = getChartConfig(this.state.selectChartType);
    if (!chartConfig) {
      return;
    }
    const dataConfig: IData = chartConfig.data;
    if (!dataConfig || !dataConfig.details) {
      return;
    }
    const requiredItems = dataConfig.details.filter((item: IData) => {
      return item.required === true;
    });
    if (!requiredItems || requiredItems.length === 0) {
      return;
    }
    requiredItems.forEach((item: IData) => {
      this.state.error[item.id] = {
        ok: true, // 判断默认是否有值,true是检查通过，false表示不通过
        msg: '',
      };
    });
  }

  /**
   * 设置属性数据并备份
   *
   * @param {IData} data
   * @memberof BIReportDesignController
   */
  setBackUpData(data: IData) {
    this.backupData = clone({
      propertyData: data,
      selectChartType: this.state.selectChartType,
      selectCube: this.state.selectCube,
    });
  }

  /**
   * 创建
   *
   * @author tony001
   * @date 2024-05-21 16:05:31
   */
  async created(): Promise<void> {
    await this.fetchSchemeDetails();
    await this.mergeSourceParams();
    this.setBackUpData(this.state.propertyData);
    const result = await this.compileAppBIReport(this.state.propertyData);
    if (result) {
      this.state.reportModel = result;
    }
    await this.initFilters();
    this.initVerifyState();
    this.state.isCreated = true;
  }

  /**
   * 合并原始参数（指标和维度）
   *
   * @author tony001
   * @date 2024-07-23 23:07:02
   * @return {*}  {Promise<void>}
   */
  async mergeSourceParams(): Promise<void> {
    const propertyData = this.state.propertyData.data;
    // 指标参数
    if (
      propertyData &&
      propertyData.measure &&
      propertyData.measure.length > 0
    ) {
      propertyData.measure.forEach((item1: IData, index: number) => {
        const targetMeasure = this.state.measure.find(
          (item2: IAppBICubeMeasureData) => {
            return item2.pssysbicubemeasureid === item1.pssysbicubemeasureid;
          },
        );
        if (targetMeasure) {
          this.state.propertyData.data.measure[index] = Object.assign(
            clone(targetMeasure),
            item1,
          );
        }
      });
    }
    // 维度参数
    if (
      propertyData &&
      propertyData.dimension &&
      propertyData.dimension.length > 0
    ) {
      propertyData.dimension.forEach((item1: IData, index: number) => {
        const targetDimension = this.state.dimension.find(
          (item2: IAppBICubeDimensionData) => {
            return (
              item2.pssysbicubedimensionid === item1.pssysbicubedimensionid
            );
          },
        );
        if (targetDimension) {
          this.state.propertyData.data.dimension[index] = Object.assign(
            clone(targetDimension),
            item1,
          );
        }
      });
    }
  }

  /**
   * 销毁
   *
   * @author tony001
   * @date 2024-05-21 17:05:09
   */
  async destroyed(): Promise<void> {
    // this.evt.reset();
  }

  /**
   * 获取报表体系详情
   *
   * @author tony001
   * @date 2024-06-05 15:06:12
   * @return {*}  {Promise<void>}
   */
  async fetchSchemeDetails(): Promise<void> {
    const { selectCubeId } = this.config;
    this.allAppBICubes = await this.fetchCube();
    const appBIScheme: IData = {};
    if (this.allAppBICubes && this.allAppBICubes.length > 0) {
      this.allAppBICubes.forEach(cube => {
        const item = {
          id: cube.pssysbischemeid,
          name: cube.pssysbischemename,
        };
        // 设置选中scheme和cube
        if (selectCubeId === cube.pssysbicubeid) {
          this.state.selectedScheme = item;
          this.state.selectCube = cube;
          this.context.pssysbicube = cube.pssysbicubeid;
        }
        appBIScheme[cube.pssysbischemeid] = item;
      });
      // 设置所有scheme
      this.state.scheme = Object.values(appBIScheme);
      // 设置选中scheme
      if (!this.state.selectedScheme && this.state.scheme.length > 0) {
        this.state.selectedScheme = this.state.scheme[0];
      }
      if (!this.state.selectedScheme) {
        return;
      }
      // 设置所有cube
      this.state.cube = this.allAppBICubes.filter(item => {
        return item.pssysbischemeid === this.state.selectedScheme!.id;
      });
      // 设置选中cube
      if (!this.state.selectCube && this.state.cube.length > 0) {
        this.state.selectCube = this.state.cube[0];
        this.context.pssysbicube = this.state.selectCube.pssysbicubeid;
      }
      if (!this.context.pssysbicube) {
        return;
      }
      // 设置选中cube的指标
      this.state.measure = await this.fetchCubeMeasure(
        this.context.pssysbicube,
      );
      // 设置选中cube的维度
      this.state.dimension = await this.fetchCubeDimension(
        this.context.pssysbicube,
      );
    }
  }

  /**
   * 初始化过滤项集合
   *
   * @return {*}  {Promise<void>}
   * @memberof BIReportDesignController
   */
  async initFilters(): Promise<void> {
    const { selectCube } = this.state;
    let schemaFilters: ISchemaField[] = [];
    if (selectCube) {
      const jsonSchema = await getSchemaByEntity(
        selectCube.psdename,
        this.appId,
      );
      if (jsonSchema) {
        schemaFilters = await calcSchemaFieldBySchema(jsonSchema);
      }
    }
    this.state.schemaFields = schemaFilters;
  }

  /**
   * 获取立方体数据
   *
   * @author tony001
   * @date 2024-06-04 18:06:48
   * @return {*}  {Promise<IAppBICube[]>}
   */
  async fetchCube(): Promise<IAppBICubeData[]> {
    const app = ibiz.hub.getApp(this.appId);
    const res = await app.deService.exec(
      'pssysbicube',
      'fetchdefault',
      this.context,
      this.viewParams,
    );
    return (res.data as IAppBICubeData[]) || [];
  }

  /**
   * 获取立方体指标数据
   *
   * @param {string} cubeid
   * @return {*}  {Promise<IAppBICubeMeasureData[]>}
   * @memberof BIReportDesignController
   */
  async fetchCubeMeasure(cubeid: string): Promise<IAppBICubeMeasureData[]> {
    const params = {
      ...this.viewParams,
      ...{ n_pssysbicubeid_eq: cubeid, size: 1000 },
    };
    const app = ibiz.hub.getApp(this.appId);
    const res = await app.deService.exec(
      'pssysbicubemeasure',
      'fetchdefault',
      this.context,
      params,
    );
    return (res.data as IAppBICubeMeasureData[]) || [];
  }

  /**
   * 获取立方体维度数据
   *
   * @param {string} cubeid
   * @return {*}  {Promise<IAppBICubeDimensionData[]>}
   * @memberof BIReportDesignController
   */
  async fetchCubeDimension(cubeid: string): Promise<IAppBICubeDimensionData[]> {
    const params = {
      ...this.viewParams,
      ...{ n_pssysbicubeid_eq: cubeid, size: 1000 },
    };
    const app = ibiz.hub.getApp(this.appId);
    const res = await app.deService.exec(
      'pssysbicubedimension',
      'fetchdefault',
      this.context,
      params,
    );
    return (res.data as IAppBICubeDimensionData[]) || [];
  }

  /**
   * 刷新立方体子数据（指标或者维度）
   *
   * @param {('measure' | 'dimension')} type
   * @return {*}  {Promise<void>}
   * @memberof BIReportDesignController
   */
  async refreshCubeDetails(type: 'measure' | 'dimension'): Promise<void> {
    if (!type) return;
    if (type === 'measure') {
      this.state.measure = await this.fetchCubeMeasure(
        this.context.pssysbicube,
      );
    }
    if (type === 'dimension') {
      this.state.dimension = await this.fetchCubeDimension(
        this.context.pssysbicube,
      );
    }
  }

  /**
   * 编译报表
   *
   * @return {*}  {Promise<IAppBIReport>}
   * @memberof BIReportDesignController
   */
  async compileAppBIReport(
    propertyData: IData,
  ): Promise<IAppBIReport | undefined> {
    const tempContext = clone(this.context);
    Object.assign(tempContext, { pssysbireport: '__UNKNOWN__' });
    const params: IData = await ibiz.util.biReport.translateDataToAppBIReport({
      context: tempContext,
      reportTag: this.config.reportTag,
      selectChartType: this.state.selectChartType,
      selectCubeId: this.state.selectCube!.pssysbicubeid,
      caption: propertyData.caption,
      data: propertyData.data,
      style: propertyData.style,
      extend: propertyData.extend,
    });
    const app = ibiz.hub.getApp(this.appId);
    const res = await app.deService.exec(
      'pssysbireport',
      'compileappbireport',
      tempContext,
      params,
    );
    if (res && res.data) {
      const result = await (ibiz.hub as IData).translationModelToDsl(
        res.data,
        'APPBIREPORT',
      );
      (result as IData).appBISchemeId = this.config.selectedSchemeId;
      result.appId = this.appId;
      return result as IAppBIReport;
    }
  }

  /**
   * 计算报表模型
   *
   * @param {string} _name
   * @param {unknown} _value
   * @return {*}  {Promise<IData>}
   * @memberof BIReportDesignController
   */
  async computeAppBIReportModel(
    _name: string,
    _value: unknown,
  ): Promise<IData> {
    let _mergeParams: IData = {};
    if (_name === 'caption') {
      _mergeParams.name = _value;
    }
    if (_name.startsWith('style')) {
      // 常规数据
      const tempReportUIModel: IData = {
        selectChartType: this.state.selectChartType,
        style: this.state.propertyData.style,
      };
      // 过滤器数据
      if (this.state.propertyData.data?.filter) {
        Object.assign(tempReportUIModel, {
          filter: this.state.propertyData.data.filter,
        });
      }
      // 同环比数据
      if (this.state.propertyData.data?.period) {
        Object.assign(tempReportUIModel, {
          period: this.state.propertyData.data.period,
        });
      }
      // 分组数据
      if (this.state.propertyData.data?.group?.length > 0) {
        const groupNames = this.state.propertyData.data.group.map(
          (item: IData) => {
            return item.pssysbicubedimensionid;
          },
        );
        Object.assign(tempReportUIModel, { group: groupNames });
      }
      if (this.state.propertyData.extend) {
        Object.assign(tempReportUIModel, {
          extend: this.state.propertyData.extend,
        });
      }
      _mergeParams.reportUIModel = JSON.stringify(tempReportUIModel);
    }
    if (_name.startsWith('data') || _name.startsWith('extend.aggmode')) {
      _mergeParams =
        (await this.compileAppBIReport(this.state.propertyData)) || {};
    }
    return _mergeParams;
  }

  /**
   * 校验必填检查状态
   *
   * @param {string} name
   * @param {unknown} value
   * @memberof BIReportDesignController
   */
  checkData(name: string, value: unknown) {
    this.state.error[name] = this.verifyErrorState(name, value, ['REQUIRE']);
  }

  /**
   * 设置值
   *
   * @author tony001
   * @date 2024-06-12 17:06:22
   * @param {string} _name
   * @param {unknown} _value
   * @return {*}  {Promise<void>}
   */
  async setData(_name: string, _value: unknown): Promise<void> {
    if (_name.indexOf('.') !== -1) {
      const keys = _name.split('.');
      let data: IData = this.state.propertyData;
      for (const key of keys.slice(0, -1)) {
        data = data[key];
      }
      const lastKey = keys[keys.length - 1];
      if (_value === null) {
        delete data[lastKey];
      } else {
        data[lastKey] = _value;
      }
      this.checkData(lastKey, _value);
    } else {
      this.state.propertyData[_name] = _value;
    }
    this.state.dataChangeState = true;
    const reportChartRef = this.state.reportChart;
    if (reportChartRef) {
      const _mergeParams = await this.computeAppBIReportModel(_name, _value);
      await reportChartRef.handleValueChange(_name, _value, _mergeParams);
    }
  }

  /**
   * 切换报表体系
   *
   * @author tony001
   * @date 2024-06-04 18:06:25
   * @param {string} tag
   * @return {*}  {Promise<void>}
   */
  async switchScheme(tag: string): Promise<void> {
    if (this.state.scheme.length === 0) return;
    const targetScheme = this.state.scheme.find(item => {
      return item.id === tag;
    });
    if (!targetScheme) return;
    // 设置选中scheme
    this.state.selectedScheme = targetScheme;
    const targetCube = this.allAppBICubes.filter(item => {
      return item.pssysbischemeid === targetScheme.id;
    });
    // 设置所有cube
    this.state.cube = targetCube || [];
    if (this.state.cube.length === 0) {
      this.state.selectCube = undefined;
      delete this.context.pssysbicube;
      return;
    }
    // 设置选中cube
    this.state.selectCube = this.state.cube[0];
    this.context.pssysbicube = this.state.selectCube.pssysbicubeid;
    if (!this.context.pssysbicube) {
      this.state.measure = [];
      this.state.dimension = [];
      return;
    }
    // 设置选中cube的指标
    this.state.measure = await this.fetchCubeMeasure(this.context.pssysbicube);
    // 设置选中cube的维度
    this.state.dimension = await this.fetchCubeDimension(
      this.context.pssysbicube,
    );
  }

  /**
   * 切换立方体
   *
   * @author tony001
   * @date 2024-06-04 18:06:48
   * @return {*}  {Promise<void>}
   */
  async switchCube(tag: string): Promise<void> {
    if (!tag) return;
    const targetCube = this.allAppBICubes.find(item => {
      return item.pssysbicubeid === tag;
    });
    // 设置所有cube
    if (!targetCube) {
      this.state.selectCube = undefined;
      delete this.context.pssysbicube;
      return;
    }
    // 设置选中cube
    this.state.selectCube = targetCube;
    this.context.pssysbicube = this.state.selectCube.pssysbicubeid;
    if (!this.context.pssysbicube) {
      this.state.measure = [];
      this.state.dimension = [];
      return;
    }
    // 设置选中cube的指标
    this.state.measure = await this.fetchCubeMeasure(this.context.pssysbicube);
    // 设置选中cube的维度
    this.state.dimension = await this.fetchCubeDimension(
      this.context.pssysbicube,
    );
    this.evt.emit('onSelectedCube', { tag });
    await this.initFilters();
    this.initVerifyState();
    await this.switchReportType(this.state.selectChartType, false);
  }

  /**
   * 初始化校验状态
   *
   * @memberof BIReportDesignController
   */
  initVerifyState() {
    this.initErrorState();
    const { chartConfig } = getChartConfig(this.state.selectChartType);
    this.verifyController?.init(this.state.schemaFields, chartConfig.data);
  }

  /**
   * 切换图表类型
   *
   * @author tony001
   * @date 2024-06-06 00:06:27
   * @param {ChartType} tag
   * @return {*}  {Promise<void>}
   */
  async switchReportType(
    tag: ChartType,
    isMergeData: boolean = true,
  ): Promise<void> {
    this.state.reportModel = undefined;
    this.state.dataChangeState = true;
    this.state.selectChartType = tag;
    const clonePropertyData = clone(this.state.propertyData);
    const cacheData: IData = {
      caption: clonePropertyData.caption,
    };
    if (isMergeData) {
      Object.assign(cacheData, { data: clonePropertyData.data });
    }
    const tempData = this.getDefaultValue(tag, cacheData);
    const result = await this.compileAppBIReport(tempData);
    if (result) {
      this.state.reportModel = result;
      this.state.propertyData = tempData;
    }
    this.initVerifyState();
    this.evt.emit('onSelectedReportType', { tag });
  }

  /**
   * 设置报表图表控制器
   *
   * @author tony001
   * @date 2024-06-04 23:06:08
   * @param {(IBIReportChartController | undefined)} reportChart
   * @return {*}  {Promise<void>}
   */
  async setReportChart(
    reportChart: IBIReportChartController | undefined,
  ): Promise<void> {
    this.state.reportChart = reportChart;
  }

  /**
   * 关闭
   *
   * @author tony001
   * @date 2024-06-20 13:06:17
   * @return {*}  {Promise<void>}
   */
  async close(): Promise<void> {
    if (this.state.dataChangeState) {
      const target = await (ibiz as IData).confirm.warning({
        title: '确认返回',
        desc: '返回则无法保存编辑的信息。',
      });
      if (this.dismiss && target) {
        this.dismiss({ ok: true, data: [] });
      }
    } else if (this.dismiss) {
      this.dismiss({ ok: true, data: [] });
    }
  }

  /**
   * 保存数据
   *
   * @author tony001
   * @date 2024-06-20 13:06:28
   * @return {*}  {Promise<void>}
   */
  async save(): Promise<void> {
    const result: { ok: boolean; data?: IData } = { ok: false };
    // 校验
    const reportChartRef = this.state.reportChart;
    if (reportChartRef) {
      const bol = await reportChartRef.checkData();
      if (!bol) {
        return;
      }
    }
    const tempContext = clone(this.context);
    const tempData = {
      context: tempContext,
      reportTag: this.config.reportTag,
      selectChartType: this.state.selectChartType,
      selectCubeId: this.state.selectCube!.pssysbicubeid,
      caption: this.state.propertyData.caption,
      data: this.state.propertyData.data,
      style: this.state.propertyData.style,
      extend: this.state.propertyData.extend,
    };
    const data = await ibiz.util.biReport.translateDataToAppBIReport(tempData);
    const app = ibiz.hub.getApp(this.appId);
    try {
      const res = await app.deService.exec(
        'pssysbireport',
        'update',
        tempContext,
        data,
      );
      if (res && res.data) {
        result.data = res.data;
        this.setBackUpData(this.state.propertyData);
        ibiz.message.success('保存成功');
      }
      this.state.dataChangeState = false;
    } catch (error: any) {
      throw new RuntimeError(error.message);
    }
    if (this.dismiss) {
      this.dismiss(result);
    }
  }

  /**
   * 取消保存
   *
   * @author tony001
   * @date 2024-06-20 13:06:39
   * @return {*}  {Promise<void>}
   */
  async cancel(): Promise<void> {
    const result: { ok: boolean; data?: IData | undefined } = { ok: true };
    if (this.state.dataChangeState) {
      this.state.reportModel = undefined;
      const { propertyData, selectChartType, selectCube } = clone(
        this.backupData,
      );
      this.state.propertyData = propertyData;
      this.state.selectChartType = selectChartType;
      this.state.selectCube = selectCube;
      const appBIReport = await this.compileAppBIReport(propertyData);
      if (appBIReport) {
        this.state.reportModel = appBIReport;
      }
      this.state.dataChangeState = false;
      result.data = clone(this.backupData);
    }
  }

  /**
   * @description 获取操作项行为
   * @param {IData} item
   * @param {IUIActionGroupDetail[]} uiactionGroupDetails
   * @return {*}  {ButtonContainerState}
   * @memberof BIReportDesignController
   */
  getOptItemAction(
    item: IData,
    uiactionGroupDetails: IUIActionGroupDetail[],
  ): ButtonContainerState {
    const containerState = new ButtonContainerState();
    if (!uiactionGroupDetails?.length) {
      ibiz.log.debug(
        ibiz.i18n.t(
          'runtime.controller.control.dataView.noBehaviourGroupAction',
        ),
      );
      return containerState;
    }
    uiactionGroupDetails.forEach(detail => {
      const actionid = detail.uiactionId;
      if (actionid) {
        const buttonState = new UIActionButtonState(
          detail.id!,
          this.appId,
          actionid,
        );
        containerState.addState(detail.id!, buttonState);
      }
    });
    containerState.update(this.context, item);
    return containerState;
  }
}
