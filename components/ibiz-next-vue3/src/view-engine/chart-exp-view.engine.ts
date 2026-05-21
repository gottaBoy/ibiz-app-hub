import {
  ViewController,
  IChartExpViewEvent,
  IChartExpViewState,
} from '@ibiz-template/runtime';
import { IAppDEChartExplorerView } from '@ibiz/model-core';
import { ExpViewEngine } from './exp-view.engine';

export class ChartExpViewEngine extends ExpViewEngine {
  /**
   * 图表导航视图控制器
   *
   * @protected
   * @type {ViewController<
   *     IAppDEChartExplorerView,
   *     IChartExpViewState,
   *     IChartExpViewEvent
   *   >}
   * @memberof ChartExpViewEngine
   */
  declare protected view: ViewController<
    IAppDEChartExplorerView,
    IChartExpViewState,
    IChartExpViewEvent
  >;

  /**
   * @description 导航栏部件名称
   * @readonly
   * @type {string}
   * @memberof ChartExpViewEngine
   */
  get expBarName(): string {
    return 'chartexpbar';
  }
}
