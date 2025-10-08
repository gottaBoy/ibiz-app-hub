import {
  MDViewEngine,
  ViewController,
  IListViewState,
  IListViewEvent,
  IMobMDCtrlController,
  SysUIActionTag,
  EventBase,
  getWFContext,
  IApiMobMDViewCall,
} from '@ibiz-template/runtime';
import { IAppDEMobMDView, IDEListItem } from '@ibiz/model-core';

/**
 * 移动端多数据视图驱动引擎
 *
 * @author chitanda
 * @date 2023-06-16 17:06:00
 * @export
 * @class MobMDViewEngine
 * @extends {MDViewEngine}
 */
export class MobMDViewEngine extends MDViewEngine {
  protected declare view: ViewController<
    IAppDEMobMDView,
    IListViewState,
    IListViewEvent
  >;

  get mdctrl(): IMobMDCtrlController {
    return this.view.getController('mdctrl') as IMobMDCtrlController;
  }

  async call(
    key: keyof IApiMobMDViewCall,
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
   * 多数据部件激活事件处理
   * @author lxm
   * @date 2023-08-31 02:53:37
   * @protected
   * @param {EventBase} event
   * @return {*}  {Promise<void>}
   */
  protected async onXDataActive(event: EventBase): Promise<void> {
    const wfContext = getWFContext(event.data[0]);
    Object.assign(event.context, wfContext);
    await this.openData(event);
  }

  /**
   * 加载更多数据
   *
   * @author chitanda
   * @date 2023-06-16 17:06:10
   * @protected
   * @return {*}  {Promise<void>}
   */
  protected loadMore(): Promise<void> {
    return this.mdctrl.loadMore();
  }

  async onCreated(): Promise<void> {
    await super.onCreated();
  }

  /**
   * 挂载完成
   *
   * @author zk
   * @date 2023-05-26 10:05:13
   * @memberof PickupGridViewEngine
   */
  async onMounted(): Promise<void> {
    await super.onMounted();
    this.xdataControl.evt.on('onSelectionChange', async event => {
      this.view.evt.emit('onSelectionChange', { ...event });
    });
    this.xdataControl.evt.on('onActive', async event => {
      this.view.evt.emit('onDataActive', { ...event });
    });
    // 计算是否允许排序
    const tempItems = this.mdctrl.model.delistItems;
    if (tempItems) {
      const index = tempItems.findIndex((item: IDEListItem) => {
        return !!item.enableSort;
      });
      if (index >= 0) {
        this.view.evt.emit('onPresetClassChange', {
          data: ['enablesort'],
        });
      }
    }
  }
}
