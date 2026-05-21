import { IAppDEDataViewExplorerView } from '@ibiz/model-core';

import {
  IDataViewExpViewState,
  IDataViewExpViewEvent,
  ViewController,
} from '@ibiz-template/runtime';
import { ExpViewEngine } from './exp-view.engine';
/**
 * 卡片导航视图引擎
 *
 * @author zk
 * @date 2023-05-30 09:05:54
 * @export
 * @class DataViewExpViewEngine
 * @extends {ExpViewEngine}
 */
export class DataViewExpViewEngine extends ExpViewEngine {
  /**
   * 视图泛型
   *
   * @author zk
   * @date 2023-05-30 10:05:59
   * @protected
   * @type {ViewController<IAppDEDataViewExplorerView,IDataViewExpViewState,IDataViewExpViewEvent
   *   >}
   * @memberof DataViewExpViewEngine
   */
  declare protected view: ViewController<
    IAppDEDataViewExplorerView,
    IDataViewExpViewState,
    IDataViewExpViewEvent
  >;

  /**
   * 卡片导航视图导航栏部件名称
   *
   * @author zk
   * @date 2023-05-30 06:05:53
   * @readonly
   * @type {string}
   * @memberof DataViewExpViewEngine
   */
  get expBarName(): string {
    return 'dataviewexpbar';
  }
}
