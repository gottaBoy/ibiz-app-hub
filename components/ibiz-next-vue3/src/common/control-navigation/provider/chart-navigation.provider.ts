import {
  ChartController,
  convertNavData,
  EventBase,
  INavViewMsg,
  MDControlController,
} from '@ibiz-template/runtime';
import { INavigatable } from '@ibiz/model-core';
import { NavgationBaseProvider } from './navigation-base.provider';

export class ChartNavigationProvider extends NavgationBaseProvider {
  /**
   * 图表导航栈数据
   *
   * @type {IData[]}
   * @memberof ChartNavigationProvider
   */
  chartNavStack: IData[] = [];

  declare controller: ChartController;

  constructor(controller: MDControlController) {
    super(controller);
    if (controller.state.enableNavView) {
      controller.evt.on('onActive', event => {
        this.xDataActive(event);
      });
    }
  }

  /**
   * 获取默认激活数据
   *
   * @return {*}  {(IData | undefined)}
   * @memberof ChartNavigationProvider
   */
  getDefaultActiveData(): IData | undefined {
    const activeSeriesGenerator =
      this.controller.generator.seriesGenerators.find(generator => {
        return (
          generator.chartDataArr.length > 0 && generator.model.navAppViewId
        );
      });
    if (activeSeriesGenerator && activeSeriesGenerator.groupData) {
      const firstGroupName = Object.keys(activeSeriesGenerator.groupData)[0];
      const { chartData } = activeSeriesGenerator.groupData[firstGroupName]
        .values()
        .next().value as IData;
      return chartData;
    }
  }

  /**
   * 图表数据激活
   *
   * @param {EventBase} event
   * @memberof ChartNavigationProvider
   */
  xDataActive(event: EventBase): void {
    const { data } = event;
    this.navViewMsg.value = this.getNavViewMsg(data[0]);
    // 缓存用户导航数据，放置在最前
    this.chartNavStack.unshift(data[0]);
  }

  /**
   * 通过栈数据导航
   *
   * @return {*}  {void}
   * @memberof ChartNavigationProvider
   */
  onNavDataByStack(): void {
    const data = this.getDefaultActiveData();
    if (!data) return this.clearNavigation();
    this.controller.setActive(data);
    this.controller.setSelection([data]);
  }

  /**
   * 解析参数
   *
   * @param {(INavigatable & { appDataEntityId?: string })} XDataModel
   * @param {IData} data
   * @param {IContext} context
   * @param {IParams} params
   * @return {*}  {{ context: IContext; params: IParams }}
   * @memberof ChartNavigationProvider
   */
  prepareParams(
    XDataModel: INavigatable & { appDataEntityId?: string },
    data: IData,
    context: IContext,
    params: IParams,
  ): { context: IContext; params: IParams } {
    const { context: tempContext, params: tempParams } = super.prepareParams(
      XDataModel,
      data,
      context,
      params,
    );
    // 序列上或配置导航相关参数
    if (data._seriesModelId) {
      const seriesModel = this.controller.model.dechartSerieses?.find(
        series => {
          return series.id === data._seriesModelId;
        },
      );
      if (seriesModel) {
        const { navigateContexts, navigateParams } = seriesModel;
        // 序列上配的导航视图参数和上下文
        const tempContext2 = convertNavData(
          navigateContexts,
          data,
          params,
          tempContext,
        );
        const tempParams2 = convertNavData(
          navigateParams,
          data,
          params,
          tempParams,
        );
        if (data.navParams) Object.assign(tempParams2, data.navParams);
        return {
          context: Object.assign(tempContext.clone(), tempContext2),
          params: tempParams2,
        };
      }
    }
    return { context: tempContext, params: tempParams };
  }

  /**
   * 获取导航视图信息
   *
   * @param {IData} data
   * @return {*}  {INavViewMsg}
   * @memberof ChartNavigationProvider
   */
  public getNavViewMsg(data: IData): INavViewMsg {
    let viewModelId;
    if (data._seriesModelId) {
      const seriesModel = this.controller.model.dechartSerieses?.find(
        series => {
          return series.id === data._seriesModelId;
        },
      );
      viewModelId = seriesModel?.navAppViewId;
    }
    const result = this.prepareParams(
      this.controller.model!,
      data,
      this.controller.context,
      this.controller.params,
    );
    return {
      key: data._uuid,
      context: result.context,
      params: result.params,
      viewId: viewModelId,
    };
  }
}
