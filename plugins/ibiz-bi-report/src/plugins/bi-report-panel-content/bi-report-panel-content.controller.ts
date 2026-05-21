import { RuntimeError } from '@ibiz-template/core';
import {
  IFilterNodeField,
  IFilterNodeGroup,
  PanelItemController,
  calcDeCodeNameById,
} from '@ibiz-template/runtime';
import { IAppBIReport } from '@ibiz/model-core';
import { clone } from 'ramda';
import { BIReportPanelContentState } from './bi-report-panel-content.state';
import { getChartConfig } from '../../config';
import {
  IAppBICubeData,
  IAppBICubeDimensionData,
  IAppBICubeMeasureData,
  IBIReportChartController,
  ISchemaField,
} from '../../interface';
import {
  calcSchemaFieldBySchema,
  getSchemaByEntity,
  getSchemaField,
  parseCustomCond,
} from '../../util';

export class BIReportPanelContentController extends PanelItemController {
  /**
   * BI报表配置
   *
   * @author zhanghengfeng
   * @date 2024-07-02 14:07:34
   * @type {IData}
   */
  config: IData = {};

  /**
   * 上下文
   *
   * @author zhanghengfeng
   * @date 2024-07-02 14:07:53
   * @type {IContext}
   */
  context!: IContext;

  /**
   * 状态
   *
   * @author zhanghengfeng
   * @date 2024-07-03 20:07:34
   * @type {BIReportPanelContentState}
   */
  declare state: BIReportPanelContentState;

  /**
   * 表格控制器
   *
   * @author zhanghengfeng
   * @date 2024-07-03 20:07:41
   * @type {IBIReportChartController}
   */
  grid?: IBIReportChartController;

  /**
   * 图表控制器
   *
   * @author zhanghengfeng
   * @date 2024-07-03 20:07:56
   * @type {IBIReportChartController}
   */
  chart?: IBIReportChartController;

  /**
   * 表格类型
   *
   * @author zhanghengfeng
   * @date 2024-07-03 20:07:24
   * @type {string[]}
   */
  gridType: string[] = ['GRID', 'CROSSTABLE'];

  /**
   * BI报表key
   *
   * @author zhanghengfeng
   * @date 2024-07-03 20:07:45
   * @type {string}
   */
  reportKey: string = '';

  /**
   * 立方体数据
   *
   * @author zhanghengfeng
   * @date 2024-07-16 17:07:42
   * @type {IAppBICubeData}
   */
  appBICube?: IAppBICubeData;

  get appId(): string {
    return this.context.srfappid || ibiz.env.appId;
  }

  /**
   * 创建面板状态对象
   *
   * @author zhanghengfeng
   * @date 2024-07-03 20:07:45
   * @protected
   * @return {*}  {BIReportPanelContentState}
   */
  protected createState(): BIReportPanelContentState {
    return new BIReportPanelContentState(this.parent?.state);
  }

  /**
   * 初始化BI报表key
   *
   * @author zhanghengfeng
   * @date 2024-07-03 20:07:16
   */
  initReportKey(): void {
    const appDataEntityId = this.panel.view.model?.appDataEntityId;
    if (appDataEntityId) {
      this.reportKey = calcDeCodeNameById(appDataEntityId);
    }
    const editorParams = (this.model as IData)?.editor?.editorParams;
    if (editorParams && editorParams.appDataEntityId) {
      this.reportKey = editorParams.appDataEntityId;
    }
  }

  /**
   * 设置表格控制器
   *
   * @author zhanghengfeng
   * @date 2024-07-03 20:07:43
   * @param {IBIReportChartController} grid
   */
  setGrid(grid: IBIReportChartController): void {
    this.grid = grid;
  }

  /**
   * 设置图表控制器
   *
   * @author zhanghengfeng
   * @date 2024-07-03 20:07:56
   * @param {IBIReportChartController} chart
   */
  setChart(chart: IBIReportChartController): void {
    this.chart = chart;
  }

  /**
   * 初始化立方体数据
   *
   * @author zhanghengfeng
   * @date 2024-07-16 17:07:06
   * @return {*}  {Promise<void>}
   */
  async initAppBICube(): Promise<void> {
    const selectChartType = this.config.selectChartType;
    const model = this.gridType.includes(selectChartType)
      ? this.state.gridReportModel
      : this.state.reportModel;
    if (!model) {
      return;
    }
    const { appBISchemeId, appBICubeId } = model as IData;
    if (!appBISchemeId || !appBICubeId) {
      return;
    }
    const tempContext = clone(this.context);
    tempContext.pssysbicube = `${appBISchemeId}.${appBICubeId}`;
    const app = ibiz.hub.getApp(this.appId);
    const res = await app.deService.exec(
      'pssysbicube',
      'get',
      tempContext,
      this.panel.params,
    );
    this.appBICube = res.data as IAppBICubeData;
    if (this.appBICube?.pssysbicubeid) {
      this.context.pssysbicube = this.appBICube?.pssysbicubeid;
    }
  }

  /**
   * 初始化指标
   *
   * @author zhanghengfeng
   * @date 2024-07-16 17:07:53
   * @return {*}  {Promise<void>}
   */
  async initMeasure(): Promise<void> {
    const params = {
      ...this.panel.params,
      ...{ n_pssysbicubeid_eq: this.context.pssysbicube, size: 1000 },
    };
    const app = ibiz.hub.getApp(this.appId);
    const res = await app.deService.exec(
      'pssysbicubemeasure',
      'fetchdefault',
      this.context,
      params,
    );
    if (Array.isArray(res.data)) {
      this.state.measure = res.data as IAppBICubeMeasureData[];
    }
  }

  /**
   * 初始化维度
   *
   * @author zhanghengfeng
   * @date 2024-07-16 17:07:27
   * @return {*}  {Promise<void>}
   */
  async initDimension(): Promise<void> {
    const params = {
      ...this.panel.params,
      ...{ n_pssysbicubeid_eq: this.context.pssysbicube, size: 1000 },
    };
    const app = ibiz.hub.getApp(this.appId);
    const res = await app.deService.exec(
      'pssysbicubedimension',
      'fetchdefault',
      this.context,
      params,
    );
    if (Array.isArray(res.data)) {
      this.state.dimension = res.data as IAppBICubeDimensionData[];
    }
  }

  /**
   * 初始化schema字段
   *
   * @author zhanghengfeng
   * @date 2024-07-16 17:07:32
   * @return {*}  {Promise<void>}
   */
  async initSchemaFields(): Promise<void> {
    const appDataEntityId = this.appBICube?.psdename;
    if (!appDataEntityId) {
      return;
    }
    const jsonSchema = await getSchemaByEntity(appDataEntityId, this.appId);
    if (!jsonSchema) {
      return;
    }
    const schemaFields = await calcSchemaFieldBySchema(jsonSchema);
    if (Array.isArray(schemaFields)) {
      const appDataEntity = await ibiz.hub.getAppDataEntity(
        appDataEntityId,
        this.appId,
      );
      if (appDataEntity) {
        schemaFields.forEach(item => {
          Object.assign(item, {
            appDataEntityFullTag: appDataEntity.defullTag,
          });
        });
      }
      this.state.schemaFields = schemaFields;
    }
  }

  /**
   * 初始化字段
   *
   * @author zhanghengfeng
   * @date 2024-07-16 17:07:06
   * @return {*}  {Promise<void>}
   */
  async initFields(): Promise<void> {
    if (!this.state.schemaFields.length) {
      return;
    }
    const filterType = ['COMMON'];
    const items = [
      ...this.state.measure.filter(item =>
        filterType.includes(item.bimeasuretype),
      ),
      ...this.state.dimension.filter(item =>
        filterType.includes(item.bidimensiontype),
      ),
    ];
    const fields = await Promise.all(
      items.map(async item => {
        const field = await getSchemaField(
          item,
          this.state.schemaFields,
          this.appId,
        );
        if (field) {
          this.state.fieldIconMap.set(
            field.appDEFieldId,
            (item as IData).bimeasuretype ? 'measure' : 'dimension',
          );
        }
        return field;
      }),
    );
    this.state.fields = fields.filter(field => {
      if (!field) {
        return false;
      }
      return true;
    }) as ISchemaField[];
  }

  /**
   * 初始化条件字段
   *
   * @author zhanghengfeng
   * @date 2024-07-16 17:07:46
   * @return {*}  {Promise<void>}
   */
  async initConditionFields(): Promise<void> {
    if (!this.state.schemaFields.length) {
      return;
    }
    const filterType = ['COMMON'];
    const items = [
      ...this.state.dimension.filter(item =>
        filterType.includes(item.bidimensiontype),
      ),
    ];
    const fields = await Promise.all(
      items.map(async item => {
        const field = await getSchemaField(
          item,
          this.state.schemaFields,
          this.appId,
        );
        if (field) {
          this.state.conditionFieldMap.set(field.appDEFieldId, item);
        }
        return field;
      }),
    );
    this.state.conditionFields = fields.filter(field => {
      if (!field) {
        return false;
      }
      return true;
    }) as ISchemaField[];
  }

  /**
   * 初始化过滤项
   *
   * @author zhanghengfeng
   * @date 2024-07-16 17:07:19
   * @return {*}  {Promise<void>}
   */
  initFilter(): void {
    const selectChartType = this.config.selectChartType;
    const data = this.gridType.includes(selectChartType)
      ? this.state.gridPropertyData
      : this.state.propertyData;
    const filterMode = data?.extend?.filterMode;
    this.state.filterMode = filterMode || '';
    this.state.customCond = '';
    this.state.filter = [];
    this.state.condNum = 0;
    if (filterMode === 'pql') {
      const pqlValue = data?.extend?.pqlValue;
      this.state.customCond = pqlValue || '';
      if (this.state.customCond) {
        const pqlItems = parseCustomCond(this.state.customCond)?.filter(
          item => item.type === 'condition',
        );
        if (pqlItems) {
          this.state.condNum = pqlItems.length;
        }
      }
      return;
    }
    const filter: IData[] = data?.data?.filter || [];
    if (Array.isArray(filter)) {
      this.state.filter = filter;
      this.state.condNum = this.state.filter.length;
    }
    if (!filter.length) {
      return;
    }
    const children: IFilterNodeField[] = [];
    filter.forEach(item => {
      children.push({
        nodeType: 'FIELD',
        field: item.condition?.field,
        valueOP: item.condition?.valueOP,
        value: item.condition?.value,
      });
    });
    const value: IFilterNodeGroup = {
      nodeType: 'GROUP',
      logicType: filter[0]?.groupLogicType || 'AND',
      children,
    };
    this.state.cond = value;
  }

  /**
   * 加载schema数据
   *
   * @author zhanghengfeng
   * @date 2024-07-16 17:07:37
   * @return {*}  {Promise<void>}
   */
  async loadSchema(): Promise<void> {
    await this.initAppBICube();
    await this.initSchemaFields();
    await this.initMeasure();
    await this.initDimension();
    await this.initConditionFields();
    await this.initFields();
    this.state.isLoadedSchema = true;
  }

  /**
   * 更新过滤项
   *
   * @author zhanghengfeng
   * @date 2024-07-16 17:07:01
   * @param {IData[]} value
   */
  async updateFilter(value: IData[]): Promise<void> {
    this.state.filter = value;
    this.state.condNum = this.state.filter.length;
    if (this.chart && this.state.propertyData) {
      if (!this.state.propertyData.data) {
        this.state.propertyData.data = {};
      }
      if (!this.state.propertyData.extend) {
        this.state.propertyData.extend = {};
      }
      this.state.gridPropertyData.extend.filterMode = this.state.filterMode;
      this.state.propertyData.data.filter = value;
      const mergeParams = await this.compileAppBIReport(
        this.config.selectChartType,
        this.state.propertyData,
      );
      this.chart.handleValueChange('data.', '', mergeParams || {});
    }
    if (this.grid && this.state.defaultGridReportModel) {
      if (!this.state.gridPropertyData.data) {
        this.state.gridPropertyData.data = {};
      }
      if (!this.state.propertyData.extend) {
        this.state.propertyData.extend = {};
      }
      this.state.gridPropertyData.extend.filterMode = this.state.filterMode;
      this.state.gridPropertyData.data.filter = value;
      const selectChartType = this.config.selectChartType;
      const type = this.gridType.includes(selectChartType)
        ? selectChartType
        : 'GRID';
      const mergeParams = await this.compileAppBIReport(
        type,
        this.state.gridPropertyData,
      );
      this.grid.handleValueChange('data.', '', mergeParams || {});
    }
  }

  /**
   * 更新自定义条件
   *
   * @author zhanghengfeng
   * @date 2024-07-16 22:07:16
   * @param {string} value
   * @return {*}  {Promise<void>}
   */
  async updateCustomCond(value: string): Promise<void> {
    this.state.customCond = value;
    if (this.state.customCond) {
      const pqlItems = parseCustomCond(this.state.customCond)?.filter(
        item => item.type === 'condition',
      );
      if (pqlItems) {
        this.state.condNum = pqlItems.length;
      }
    } else {
      this.state.condNum = 0;
    }
    if (this.chart && this.state.propertyData) {
      if (!this.state.propertyData.extend) {
        this.state.propertyData.extend = {};
      }
      this.state.propertyData.extend.filterMode = this.state.filterMode;
      this.state.propertyData.extend.pqlValue = value;
      const mergeParams = await this.compileAppBIReport(
        this.config.selectChartType,
        this.state.propertyData,
      );
      this.chart.handleValueChange('data.', '', mergeParams || {});
    }
    if (this.grid && this.state.defaultGridReportModel) {
      if (!this.state.gridPropertyData.extend) {
        this.state.gridPropertyData.extend = {};
      }
      this.state.gridPropertyData.extend.filterMode = this.state.filterMode;
      this.state.gridPropertyData.extend.pqlValue = value;
      const selectChartType = this.config.selectChartType;
      const type = this.gridType.includes(selectChartType)
        ? selectChartType
        : 'GRID';
      const mergeParams = await this.compileAppBIReport(
        type,
        this.state.gridPropertyData,
      );
      this.grid.handleValueChange('data.', '', mergeParams || {});
    }
  }

  /**
   * 重置模型
   *
   * @author zhanghengfeng
   * @date 2024-07-16 17:07:41
   */
  resetModel(): void {
    this.state.propertyData = clone(this.state.defaultPropertyData);
    this.state.gridPropertyData = clone(this.state.defaultGridPropertyData);
    this.initFilter();
    if (this.chart && this.state.defaultReportModel) {
      this.chart.handleValueChange(
        'data.',
        '',
        clone(this.state.defaultReportModel),
      );
    }
    if (this.grid && this.state.defaultGridReportModel) {
      this.grid.handleValueChange(
        'data.',
        '',
        clone(this.state.defaultGridReportModel),
      );
    }
  }

  /**
   * 初始化
   *
   * @author zhanghengfeng
   * @date 2024-07-03 20:07:15
   * @return {*}  {Promise<void>}
   */
  async onInit(): Promise<void> {
    await super.onInit();
    this.initReportKey();
    const tempContext: IContext = clone(this.panel.context);
    Object.assign(tempContext, { pssysbireport: tempContext[this.reportKey] });
    this.context = tempContext;
    const app = ibiz.hub.getApp(this.appId);
    try {
      this.panel.view.startLoading();
      const res = await app.deService.exec(
        'pssysbireport',
        'get',
        tempContext,
        this.panel.params,
      );
      if (res.data) {
        // 修正appid，适配多应用场景
        const appId = res.data.pssysappid;
        if (appId) {
          const mainApp = ibiz.hub.getApp(ibiz.env.appId);
          // 主应用上下文的srfappid应该等于主应用appId
          if (appId === mainApp.id && this.context.srfappid !== mainApp.appId) {
            this.context.srfappid = mainApp.appId;
          } else {
            // 子应用上下文的srfappid应该等于子应用id
            const targetApp = mainApp.model.subAppRefs?.find(subAppRef => {
              return subAppRef.id?.endsWith(appId);
            });
            if (
              targetApp &&
              targetApp.id &&
              targetApp.id !== this.context.srfappid
            ) {
              this.context.srfappid = targetApp.id;
            }
          }
        }
        const tempConfig = await ibiz.util.biReport.translateDEReportToConfig(
          res.data,
        );
        // 报表标识
        if (this.panel.params.srfreporttag) {
          tempConfig.reportTag = this.panel.params.srfreporttag;
        }
        this.config = tempConfig;
        const selectChartType = this.config.selectChartType;
        if (!this.gridType.includes(selectChartType)) {
          await this.initReportModel();
        }
        await this.initGridReportModel();
        this.initFilter();
      }
    } catch (error: unknown) {
      throw new RuntimeError((error as IData).message);
    } finally {
      this.panel.view.endLoading();
    }
  }

  /**
   * 获取图表默认值
   *
   * @author zhanghengfeng
   * @date 2024-07-03 20:07:52
   * @param {string} selectChartType
   * @param {(IData | undefined)} sourceData
   * @return {*}  {IData}
   */
  getDefaultValue(
    selectChartType: string,
    sourceData: IData | undefined,
  ): IData {
    const { chartDefaultValue, chartConfig } = getChartConfig(selectChartType);
    const targetData: IData = clone(chartDefaultValue);
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
              // 特殊处理同环比字段
            } else if (key1 === 'period') {
              targetData.data[key1] = sourceData.data[key1];
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
   * 编译报表
   *
   * @author zhanghengfeng
   * @date 2024-07-03 20:07:25
   * @param {string} selectChartType
   * @param {IData} propertyData
   * @return {*}  {(Promise<IAppBIReport | undefined>)}
   */
  async compileAppBIReport(
    selectChartType: string,
    propertyData: IData,
  ): Promise<IAppBIReport | undefined> {
    const tempContext = clone(this.context);
    Object.assign(tempContext, { pssysbireport: '__UNKNOWN__' });
    const params: IData = await ibiz.util.biReport.translateDataToAppBIReport({
      context: tempContext,
      reportTag: this.config.reportTag,
      selectChartType,
      selectCubeId: this.config.selectCubeId,
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
   * 初始化图表模型
   *
   * @author zhanghengfeng
   * @date 2024-07-03 20:07:33
   * @return {*}  {Promise<void>}
   */
  async initReportModel(): Promise<void> {
    this.state.propertyData = {};
    this.state.reportModel = undefined;
    this.state.propertyData = this.getDefaultValue(
      this.config.selectChartType,
      clone(this.config.propertyData),
    );
    this.state.defaultPropertyData = clone(this.state.propertyData);
    const result = await this.compileAppBIReport(
      this.config.selectChartType,
      this.state.propertyData,
    );
    if (result) {
      this.state.reportModel = result;
      this.state.defaultReportModel = clone(result);
    }
  }

  /**
   * 初始化表格模型
   *
   * @author zhanghengfeng
   * @date 2024-07-03 20:07:48
   * @return {*}  {Promise<void>}
   */
  async initGridReportModel(): Promise<void> {
    const selectChartType = this.config.selectChartType;
    const type = this.gridType.includes(selectChartType)
      ? selectChartType
      : 'GRID';
    this.state.gridPropertyData = {};
    this.state.gridReportModel = undefined;
    const clonePropertyData = clone(
      this.gridType.includes(this.config.selectChartType)
        ? this.config.propertyData
        : this.state.propertyData,
    );
    const cacheData: IData = {
      caption: clonePropertyData.caption,
    };
    Object.assign(cacheData, {
      data: clonePropertyData.data,
    });
    Object.assign(cacheData, {
      extend: clonePropertyData.extend,
    });
    if (this.gridType.includes(selectChartType)) {
      Object.assign(cacheData, {
        style: clonePropertyData.style,
      });
    }
    this.state.gridPropertyData = this.getDefaultValue(type, cacheData);
    this.state.defaultGridPropertyData = clone(this.state.gridPropertyData);
    const result = await this.compileAppBIReport(
      type,
      this.state.gridPropertyData,
    );
    if (result) {
      this.state.gridReportModel = result;
      this.state.defaultGridReportModel = clone(result);
    }
  }

  /**
   * 更新表格模型
   *
   * @author zhanghengfeng
   * @date 2024-07-03 20:07:05
   * @return {*}  {Promise<void>}
   */
  async updateGridReportModel(): Promise<void> {
    if (!this.grid) {
      return;
    }
    const selectChartType = this.config.selectChartType;
    const type = this.gridType.includes(selectChartType)
      ? selectChartType
      : 'GRID';
    const _mergeParams: IData = {};
    // 常规数据
    const tempReportUIModel: IData = {
      selectChartType: type,
      style: this.state.gridPropertyData.style,
    };
    // 过滤器数据
    if (this.state.gridPropertyData.data?.filter) {
      Object.assign(tempReportUIModel, {
        filter: this.state.gridPropertyData.data.filter,
      });
    }
    // 同环比数据
    if (this.state.gridPropertyData.data?.period) {
      Object.assign(tempReportUIModel, {
        period: this.state.gridPropertyData.data.period,
      });
    }
    // 分组数据
    if (this.state.gridPropertyData.data?.group?.length > 0) {
      const groupNames = this.state.gridPropertyData.data.group.map(
        (item: IData) => {
          return item.pssysbicubedimensionid;
        },
      );
      Object.assign(tempReportUIModel, { group: groupNames });
    }
    _mergeParams.reportUIModel = JSON.stringify(tempReportUIModel);
    await this.grid.handleValueChange('style', '', _mergeParams);
  }
}
