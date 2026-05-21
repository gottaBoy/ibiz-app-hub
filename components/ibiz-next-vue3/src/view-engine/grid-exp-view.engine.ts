import {
  IGridExpViewEvent,
  IGridExpViewState,
  ViewController,
} from '@ibiz-template/runtime';
import { IAppDEGridExplorerView } from '@ibiz/model-core';
import { ExpViewEngine } from './exp-view.engine';
/**
 * 表格导航视图引擎
 *
 * @author zk
 * @date 2023-05-30 09:05:54
 * @export
 * @class GridExpViewEngine
 * @extends {ExpViewEngine}
 */
export class GridExpViewEngine extends ExpViewEngine {
  /**
   * 视图泛型
   *
   * @author zk
   * @date 2023-05-30 10:05:59
   * @protected
   * @type {ViewController<IAppDEGridExplorerView,IGridExpViewState,IGridExpViewEvent
   *   >}
   * @memberof GridExpViewEngine
   */
  declare protected view: ViewController<
    IAppDEGridExplorerView,
    IGridExpViewState,
    IGridExpViewEvent
  >;

  /**
   * 表格导航栏部件名称
   *
   * @author zk
   * @date 2023-05-30 06:05:21
   * @readonly
   * @type {string}
   * @memberof GridExpViewEngine
   */
  get expBarName(): string {
    return 'gridexpbar';
  }
}
