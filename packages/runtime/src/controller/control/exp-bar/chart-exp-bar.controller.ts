import { IChartExpBar, IDEChart, INavigatable } from '@ibiz/model-core';
import {
  INavViewMsg,
  IChartExpBarState,
  IChartExpBarEvent,
  IChartExpBarController,
} from '../../../interface';
import { ExpBarControlController } from './exp-bar.controller';
import { ChartController } from '../chart';
import { convertNavData } from '../../../utils';

/**
 * 图表导航栏控制器
 *
 * @export
 * @class ChartExpBarController
 * @extends {ExpBarControlController<IChartExpBar, IChartExpBarState, IChartExpBarEvent>}
 * @implements {IChartExpBarController}
 */
export class ChartExpBarController
  extends ExpBarControlController<
    IChartExpBar,
    IChartExpBarState,
    IChartExpBarEvent
  >
  implements IChartExpBarController
{
  /**
   * @description 获取默认激活数据
   * @returns {*}  {(IData | undefined)}
   * @memberof ChartExpBarController
   */
  getDefaultActiveData(): IData | undefined {
    const activeSeriesGenerator = (
      this.xDataController as ChartController
    ).generator.seriesGenerators.find(generator => {
      return generator.chartDataArr.length > 0 && generator.model.navAppViewId;
    });
    if (activeSeriesGenerator && activeSeriesGenerator.groupData) {
      const firstGroupName = Object.keys(activeSeriesGenerator.groupData)[0];
      const { chartData } = activeSeriesGenerator.groupData[firstGroupName]
        .values()
        .next().value;
      return chartData;
    }
  }

  /**
   * 导航页面首次打开且没有回显时，
   * 默认取第一条数据进行导航
   * 对于不同的导航，第一条可导航的数据可能定义不同，可以重写改方法。
   * @author lxm
   * @date 2023-08-10 03:58:15
   * @protected
   */
  protected navByFirstItem(): void {
    if (!this.xDataController) return;
    const data = this.getDefaultActiveData();
    if (!data) return this.clearNavigation();
    this.xDataController.setActive(data);
    this.xDataController.setSelection([data]);
  }

  /**
   * @description 根据栈数据导航数据
   * @memberof ChartExpBarController
   */
  navDataByStack(): void {
    if (!this.xDataController) return;
    // 根据栈数据查找最近的一次导航数据
    const preNav = this.navStack.find(nav => {
      return (
        this.xDataController as ChartController
      ).generator.seriesGenerators.find(generator =>
        generator.chartDataArr.find(
          item =>
            item._seriesModelId === nav._seriesModelId &&
            item._catalog === nav._catalog &&
            item._groupName === nav._groupName,
        ),
      );
    });
    const navData = preNav || this.getDefaultActiveData();
    if (navData) {
      this.xDataController.setActive(navData);
      this.xDataController.setSelection([navData]);
    } else {
      this.clearNavigation();
    }
  }

  /**
   * 解析参数
   *
   * @author zk
   * @date 2023-05-29 04:05:52
   * @param {IDETabViewPanel} tabViewPanel
   * @return {*}
   * @memberof ExpBarControlController
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
      const seriesModel = (XDataModel as IDEChart).dechartSerieses?.find(
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
   * 获取导航视图
   *
   * @author zk
   * @date 2023-06-29 03:06:41
   * @param {IDETabViewPanel} tabViewPanel
   * @return {*}  {Promise<INavViewMsg>}
   * @memberof TabExpPanelController
   */
  public getNavViewMsg(
    data: IData,
    context: IContext,
    params: IParams,
  ): INavViewMsg {
    let viewModelId;
    if (data._seriesModelId) {
      const seriesModel = (this.XDataModel as IDEChart).dechartSerieses?.find(
        series => {
          return series.id === data._seriesModelId;
        },
      );
      viewModelId = seriesModel?.navAppViewId;
    }
    const result = this.prepareParams(this.XDataModel!, data, context, params);
    return {
      key: data._uuid,
      context: result.context,
      params: result.params,
      viewId: viewModelId,
      isCache: this.isCache,
    };
  }
}
