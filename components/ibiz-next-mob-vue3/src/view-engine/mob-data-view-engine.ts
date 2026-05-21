import {
  MDViewEngine,
  ViewController,
  IDataViewState,
  IDataViewEvent,
  SysUIActionTag,
  IMobMDCtrlController,
  IApiMobDataViewCall,
} from '@ibiz-template/runtime';
import { IAppDEMobMDView } from '@ibiz/model-core';

/**
 * 移动端卡片视图驱动引擎
 *
 * @author chitanda
 * @date 2023-06-16 17:06:00
 * @export
 * @class MobDataViewEngine
 * @extends {MDViewEngine}
 */
export class MobDataViewEngine extends MDViewEngine {
  declare protected view: ViewController<
    IAppDEMobMDView,
    IDataViewState,
    IDataViewEvent
  >;

  /**
   * 数据视图部件控制器
   *
   * @author zk
   * @date 2023-07-06 03:07:25
   * @readonly
   * @memberof MobDataViewEngine
   */
  get dataview(): IMobMDCtrlController {
    return this.view.getController('dataview') as IMobMDCtrlController;
  }

  async call(
    key: keyof IApiMobDataViewCall,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    args: any,
  ): Promise<IData | null | undefined> {
    if (key === SysUIActionTag.LOAD_MORE) {
      await this.loadMore();
      return null;
    }
    return super.call(key, args);
  }

  /**
   * 加载更多数据
   *
   * @author zk
   * @date 2023-07-06 03:07:07
   * @protected
   * @return {*}  {Promise<void>}
   * @memberof MobDataViewEngine
   */
  protected loadMore(): Promise<void> {
    return this.dataview.loadMore?.() || Promise.resolve();
  }
}
