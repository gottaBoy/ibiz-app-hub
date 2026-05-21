import {
  IListExpViewEvent,
  IListExpViewState,
  ViewController,
} from '@ibiz-template/runtime';
import { IAppDEListExplorerView } from '@ibiz/model-core';
import { ExpViewEngine } from './exp-view.engine';
/**
 * 列表导航视图引擎
 *
 * @author zk
 * @date 2023-05-30 09:05:09
 * @export
 * @class ListExpViewEngine
 * @extends {ExpViewEngine}
 */
export class ListExpViewEngine extends ExpViewEngine {
  /**
   * 视图泛型
   *
   * @author zk
   * @date 2023-05-30 10:05:59
   * @protected
   * @type {ViewController<IAppDEListExplorerView,IListExpViewState,IListExpViewEvent
   *   >}
   * @memberof ListExpViewEngine
   */
  declare protected view: ViewController<
    IAppDEListExplorerView,
    IListExpViewState,
    IListExpViewEvent
  >;

  /**
   * 列表导航栏部件名称
   *
   * @author zk
   * @date 2023-05-30 06:05:21
   * @readonly
   * @type {string}
   * @memberof ListExpViewEngine
   */
  get expBarName(): string {
    return 'listexpbar';
  }
}
