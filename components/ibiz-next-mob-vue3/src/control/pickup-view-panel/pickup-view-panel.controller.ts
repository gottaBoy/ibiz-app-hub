import { IApiData } from '@ibiz-template/core';
import {
  ControlController,
  convertNavData,
  IPickupGridViewEvent,
  IPickupViewPanelController,
  IPickupViewPanelEvent,
  IPickupViewPanelState,
  IViewController,
  IPickupGridViewState,
} from '@ibiz-template/runtime';
import { IAppDEMobMDView, IDEPickupViewPanel } from '@ibiz/model-core';

/**
 * 选择面板控制器
 *
 * @export
 * @class PickupViewPanelController
 * @extends {ControlController<IDEPickupViewPanel, IPickupViewPanelState, IPickupViewPanelEvent>}
 * @implements {IPickupViewPanelController}
 */
export class PickupViewPanelController
  extends ControlController<
    IDEPickupViewPanel,
    IPickupViewPanelState,
    IPickupViewPanelEvent
  >
  implements IPickupViewPanelController
{
  setSelectedData(_items: IApiData[]): Promise<void> {
    throw new Error('Method not implemented.');
  }

  /**
   * 嵌入视图控制器
   *
   * @type {IViewController}
   * @memberof PickupViewPanelController
   */
  embedView!: IViewController<
    IAppDEMobMDView,
    IPickupGridViewState,
    IPickupGridViewEvent
  >;

  /**
   * 生命周期-创建完成
   *
   * @protected
   * @return {*}  {Promise<void>}
   * @memberof PickupViewPanelController
   */
  protected async onCreated(): Promise<void> {
    await super.onCreated();
    this.initNavParam();
  }

  /**
   * 初始化导航参数
   *
   * @memberof PickupViewPanelController
   */
  initNavParam(): void {
    const { navigateContexts, navigateParams } = this.model;
    const context = this.context.clone();
    const params = { ...this.params };
    if (navigateContexts) {
      Object.assign(
        context,
        convertNavData(navigateContexts, this.context, this.params),
      );
    }
    if (navigateParams) {
      Object.assign(
        params,
        convertNavData(navigateParams, this.context, this.params),
      );
    }
    this.state.context = context;
    this.state.params = params;
  }

  /**
   * 设置嵌入视图
   *
   * @param {IViewController} view
   * @memberof PickupViewPanelController
   */
  setEmbedView(
    view: IViewController<
      IAppDEMobMDView,
      IPickupGridViewState,
      IPickupGridViewEvent
    >,
  ): void {
    this.embedView = view;
    this.embedView.evt.on('onSelectionChange', event => {
      this.evt.emit('onSelectionChange', event);
    });
    this.embedView.evt.on('onDataActive', event => {
      this.evt.emit('onDataActive', {
        data: event.data,
      });
    });
  }

  /**
   * 获取选中数据
   *
   * @author zk
   * @date 2023-05-26 03:05:53
   * @return {*}  {Promise<IData[]>}
   * @memberof PickupViewPanelController
   */
  async getSelectedData(): Promise<IData[]> {
    const items: IData[] = await this.embedView.call('GetData');
    return items;
  }

  /**
   * 获取全部数据
   *
   * @author zk
   * @date 2023-05-26 03:05:49
   * @return {*}  {Promise<IData[]>}
   * @memberof PickupViewPanelController
   */
  async getAllData(): Promise<IData[]> {
    const items: IData[] = await this.embedView.call('GetAllData');
    return items;
  }
}
