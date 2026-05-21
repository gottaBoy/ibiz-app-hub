import { IDEReportPanel, IAppDataEntity } from '@ibiz/model-core';
import {
  MDCtrlLoadParams,
  IReportPanelEvent,
  IReportPanelState,
  IReportPanelController,
} from '../../../interface';
import { ControlController } from '../../common';
import { ReportPanelService } from './report-panel.service';
import { ControllerEvent } from '../../utils';
import { ReportPanelBaseGenerator } from './generator/base-generator';
import { ReportPanelGeneratorFactory } from './generator/generator-factory';

export class ReportPanelController
  extends ControlController<
    IDEReportPanel,
    IReportPanelState,
    IReportPanelEvent
  >
  implements IReportPanelController
{
  /**
   * 报表部件服务
   *
   * @type {ReportPanelService}
   */
  protected service!: ReportPanelService;

  /**
   * 当前部件对应的应用实体对象
   *
   * @protected
   * @type {IAppDataEntity}
   */
  protected dataEntity!: IAppDataEntity;

  /**
   * 报表生成器
   *
   * @protected
   * @type {ReportPanelBaseGenerator}
   * @memberof ReportPanelController
   */
  public generator!: ReportPanelBaseGenerator;

  /**
   * 事件对象
   *
   * @readonly
   * @protected
   * @type {ControllerEvent<IReportPanelEvent>}
   * @memberof ReportPanelController
   */
  protected get _evt(): ControllerEvent<IReportPanelEvent> {
    return this.evt;
  }

  /**
   * @description 是否为BI报表设计
   * @readonly
   * @type {boolean}
   * @memberof ReportPanelController
   */
  get isBIReportDesign(): boolean {
    const { appDEReport } = this.model;
    const biReportType = [
      'DESYSBIREPORTS',
      'SYSBICUBE',
      'DESYSBICUBES',
      'ALLSYSBICUBES',
      'SYSBIREPORT',
      'SYSBICUBEREPORTS',
      'ALLSYSBIREPORTS',
    ];
    if (
      appDEReport?.reportType &&
      biReportType.includes(appDEReport?.reportType)
    ) {
      return !this.generator.reportType;
    }
    return false;
  }

  /**
   * @description 获取数据
   * @returns {*}  {IData[]}
   * @memberof ReportPanelController
   */
  getData(): IData[] {
    if (this.isBIReportDesign)
      return this.generator.protoRef?.state.items || [];
    return this.state.data;
  }

  /**
   * @description 初始化状态
   * @protected
   * @memberof ReportPanelController
   */
  protected initState(): void {
    super.initState();
    this.state.data = [];
    this.state.searchParams = {};
    this.state.biReport = undefined;
  }

  /**
   * @description 生命周期-创建完成
   * @protected
   * @returns {*}  {Promise<void>}
   * @memberof ReportPanelController
   */
  protected async onCreated(): Promise<void> {
    await super.onCreated();
    this.generator = ReportPanelGeneratorFactory.getInstance(this.model, this);
    await this.generator?.initConfig();
    this.dataEntity = await ibiz.hub.getAppDataEntity(
      this.model.appDataEntityId!,
      this.model.appId,
    );
    this.service = new ReportPanelService(this.model);
    await this.service.init(this.context);
  }

  /**
   * @description 生命周期-加载完成
   * @protected
   * @returns {*}  {Promise<void>}
   * @memberof ReportPanelController
   */
  protected async onMounted(): Promise<void> {
    await super.onMounted();
    // 如果外面没有配置默认不加载的话，默认部件自己加载
    if (this.state.loadDefault) {
      this.load({ isInitialLoad: true });
    }
  }

  /**
   * @description 获取报表参数
   * @protected
   * @returns {*}  {IParams}
   * @memberof ReportPanelController
   */
  protected getReportParams(): IParams {
    const appBIReport = this.model.appDEReport?.appBIReport;
    if (!appBIReport) return {};
    const {
      appBICubeId,
      reportUIModel,
      appBIReportMeasures,
      appBIReportDimensions,
    } = appBIReport;
    const uiModel = reportUIModel ? JSON.parse(reportUIModel) : {};
    const period = uiModel.period?.[0];
    const colSort: IData[] | undefined = uiModel.grid_col_sort;
    const result = {
      bicubetag: appBICubeId,
      bimeasures:
        appBIReportMeasures?.map(measure => {
          const item: IParams = { name: measure.measureTag?.toLowerCase() };
          if (measure.measureParams) item.param = measure.measureParams;
          if (measure.aggMode) item.aggmode = measure.aggMode;
          return item;
        }) || [],
      bidimensions:
        appBIReportDimensions?.map(dimension => {
          const item: IParams = { name: dimension.dimensionTag?.toLowerCase() };
          if (dimension.dimensionParams) item.param = dimension.dimensionParams;
          return item;
        }) || [],
      bisort: colSort
        ?.map(col => `${col.codename.toLowerCase()},${col.sort}`)
        .join(';'),
      biperiod: period?.params,
    };
    return result;
  }

  /**
   * @description 获取请求过滤参数
   * @param {IParams} [extraParams]
   * @returns {*}  {Promise<IParams>}
   * @memberof ReportPanelController
   */
  async getFetchParams(extraParams?: IParams): Promise<IParams> {
    const resultParams: IParams = {
      ...this.params,
      ...this.getReportParams(),
    };
    // *请求参数处理
    await this._evt.emit('onBeforeLoad', undefined);
    // 合并搜索条件参数，这些参数在onBeforeLoad监听里由外部填入
    Object.assign(resultParams, {
      ...this.state.searchParams,
    });

    // 额外附加参数
    if (extraParams) {
      Object.assign(resultParams, extraParams);
    }
    return resultParams;
  }

  /**
   * @description 加载数据
   * @param {MDCtrlLoadParams} [args={}]
   * @returns {*}  {Promise<IData>}
   * @memberof ReportPanelController
   */
  public async load(args: MDCtrlLoadParams = {}): Promise<IData> {
    // 如果是BI报表设计则交给BI报表设计组件处理
    if (this.isBIReportDesign) return this.state.data;
    try {
      // *查询参数处理
      await this.startLoading();
      const { codeName, appDEReport, appDataEntityId } = this.model;
      const reportTag = appDEReport?.appBIReport?.id || codeName!;
      const enyityId =
        appDEReport?.appBIReport?.appDataEntityId || appDataEntityId!;
      const { context } = this.handlerAbilityParams(args);
      const params = await this.getFetchParams(args?.viewParam);

      const res = await this.service.fetch(
        reportTag,
        enyityId,
        context,
        params,
      );

      this.state.data = res.data;

      await this.afterLoad(args, res.data);

      this.state.isLoaded = true;
      await this._evt.emit('onLoadSuccess', undefined);
    } catch (error) {
      await this._evt.emit('onLoadError', undefined);
      this.actionNotification('FETCHERROR', {
        error: error as Error,
      });
      throw error;
    } finally {
      await this.endLoading();
    }
    this.actionNotification('FETCHSUCCESS');
    return this.state.data;
  }

  /**
   * @description 部件加载后处理
   * @param {MDCtrlLoadParams} args
   * @param {IData} data
   * @returns {*}  {Promise<IData>}
   * @memberof ReportPanelController
   */
  async afterLoad(args: MDCtrlLoadParams, data: IData[]): Promise<IData> {
    this.state.biReport = this.generator.generate(data);
    return data;
  }

  /**
   * @description 刷新
   * @returns {*}  {Promise<void>}
   * @memberof ReportPanelController
   */
  async refresh(): Promise<void> {
    if (this.isBIReportDesign) {
      this.generator.load();
    } else {
      this.doNextActive(() => this.load({ isInitialLoad: false }), {
        key: 'refresh',
      });
    }
  }
}
